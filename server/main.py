"""异常处理数据看板 — 后端 API 服务 (Litestar)

数据管线:
  真实模式: ClickHouse (clickhouse-connect) → DuckDB SQL 聚合 → JSON API
  降级模式: Mock 数据 (mock_data.py) — 数据库不可用时自动启用

API 所有端点均支持 ?year=&month= 参数, 不传则默认上月
"""

import logging
from datetime import datetime
from pathlib import Path

import duckdb
import pandas as pd
from litestar import Litestar, get
from litestar.config.cors import CORSConfig
from litestar.params import Parameter
from litestar.static_files.config import StaticFilesConfig

import sql as sql_module
from connect import get_ch_client

logger = logging.getLogger("litestar")

# ============================================================
# 常量
# ============================================================

_ORG_CSV_PATH = Path(__file__).parent / "new_org.csv"

# 部门映射表 (用于前端 group-stats 筛选)
_DEPARTMENTS = ["总成组装", "调试交付", "项目管理", "工艺技术"]


# ============================================================
# 数据管线: ClickHouse → DuckDB
# ============================================================

def _build_pipeline(year: int, month: int) -> duckdb.DuckDBPyConnection:
    """构建 DuckDB 数据管线:
    1. 从 ClickHouse 拉取指定月份原始数据
    2. UTC → Asia/Shanghai 时间转换
    3. 加载 org_map 并 join 出 department
    4. 返回准备好的 DuckDB 连接, 可直接跑聚合 SQL
    """
    db = duckdb.connect(":memory:")

    # 1) 加载组织架构映射表
    db.execute(f"""
        CREATE TABLE org_map AS
        SELECT * FROM read_csv_auto('{_ORG_CSV_PATH.as_posix()}')
    """)

    # 2) 从 ClickHouse 拉取当月数据
    start_date = pd.Timestamp(year=year, month=month, day=1)
    if month < 12:
        end_date = pd.Timestamp(year=year, month=month + 1, day=1)
    else:
        end_date = pd.Timestamp(year=year + 1, month=1, day=1)

    ch = get_ch_client()
    logger.info("ClickHouse 查询: %s ~ %s", start_date.date(), end_date.date())

    df = ch.query_df(
        "SELECT * FROM dwd.cg_mes_usm_exception_processed bill "
        "WHERE bill.\"发起日期\" >= %(start)s AND bill.\"发起日期\" < %(end)s",
        parameters={"start": start_date, "end": end_date},
    )

    logger.info("查询到 %d 条记录", len(df))

    # 3) UTC → Asia/Shanghai 本地时间
    for col in df.columns:
        if str(df[col].dtype).startswith("datetime"):
            df[col] = (
                pd.to_datetime(df[col], utc=True)
                .dt.tz_convert("Asia/Shanghai")
                .dt.tz_localize(None)
            )

    # 4) 注册到 DuckDB, 创建带 department 的视图
    db.register("cg_mes_usm_exception_processed", df)
    db.execute("""
        CREATE VIEW data AS
        SELECT bill.*,
               org_map."部门" AS "department"
        FROM cg_mes_usm_exception_processed bill
        LEFT JOIN org_map ON bill."指定响应人组室" = org_map."组室"
    """)

    return db


def _df_to_records(df: pd.DataFrame) -> list[dict]:
    """DataFrame → list[dict], NaN → None"""
    df = df.where(pd.notna(df), None)
    return df.to_dict(orient="records")


def _compute_rates(records: list[dict]) -> list[dict]:
    """为 department_sql 输出补充率字段 (SQL 不含 rates, Python 补算)"""
    for r in records:
        total = r.get("总数", 0) or 1
        for key in ["响应数", "处理数", "关闭数"]:
            prefix = key.replace("数", "")
            if key in r:
                r[f"{prefix}率"] = r[key] / total
        for suffix in ["_总时长2H", "_有效时长2H", "_总时长24H", "_有效时长8H"]:
            if "2H" in suffix:
                cnt_key = f"响应及时数{suffix}"
                rate_key = f"响应及时率{suffix}"
            else:
                cnt_key = f"处理及时数{suffix}"
                rate_key = f"处理及时率{suffix}"
            if cnt_key in r:
                r[rate_key] = r[cnt_key] / total
    return records


# ============================================================
# Mock 降级 (数据库不可用时)
# ============================================================

from mock_data import (
    RECORDS,
    get_records,
    compute_department_stats,
    compute_personal_stats,
    compute_group_stats,
)

# ============================================================
# 工具
# ============================================================

def _default_year_month() -> tuple[int, int]:
    """默认查询上个月"""
    now = datetime.now()
    if now.month == 1:
        return now.year - 1, 12
    return now.year, now.month - 1


# ============================================================
# API 端点
# ============================================================

@get("/api/records")
async def api_records(
    year: int | None = Parameter(query="year", required=False, default=None),
    month: int | None = Parameter(query="month", required=False, default=None),
) -> list[dict]:
    y, m = (year, month) if year is not None and month is not None else _default_year_month()
    try:
        db = _build_pipeline(y, m)
        return _df_to_records(db.table("data").df())
    except Exception as e:
        logger.warning("ClickHouse 查询失败, 降级至 mock: %s", e)
        return get_records(120)


@get("/api/stats/department")
async def api_department_stats(
    year: int | None = Parameter(query="year", required=False, default=None),
    month: int | None = Parameter(query="month", required=False, default=None),
) -> list[dict]:
    y, m = (year, month) if year is not None and month is not None else _default_year_month()
    try:
        db = _build_pipeline(y, m)
        records = _df_to_records(
            db.sql(sql_module.department_sql.format(table="data")).df()
        )
        return _compute_rates(records)
    except Exception as e:
        logger.warning("ClickHouse 查询失败, 降级至 mock: %s", e)
        return compute_department_stats(RECORDS)


@get("/api/stats/personal")
async def api_personal_stats(
    year: int | None = Parameter(query="year", required=False, default=None),
    month: int | None = Parameter(query="month", required=False, default=None),
) -> list[dict]:
    y, m = (year, month) if year is not None and month is not None else _default_year_month()
    try:
        db = _build_pipeline(y, m)
        return _df_to_records(
            db.sql(sql_module.total_sql.format(table="data")).df()
        )
    except Exception as e:
        logger.warning("ClickHouse 查询失败, 降级至 mock: %s", e)
        return compute_personal_stats(RECORDS)


@get("/api/stats/group")
async def api_group_stats(
    department: str = Parameter(
        query="department",
        description="部门: 总成组装 / 调试交付 / 项目管理 / 工艺技术",
        required=True,
    ),
    year: int | None = Parameter(query="year", required=False, default=None),
    month: int | None = Parameter(query="month", required=False, default=None),
) -> list[dict]:
    y, m = (year, month) if year is not None and month is not None else _default_year_month()
    try:
        db = _build_pipeline(y, m)
        return _df_to_records(
            db.sql(sql_module.group_sql.format(table="data", department=department)).df()
        )
    except Exception as e:
        logger.warning("ClickHouse 查询失败, 降级至 mock: %s", e)
        return compute_group_stats(RECORDS, department)


# ============================================================
# 启动
# ============================================================

cors_config = CORSConfig(allow_origins=["*"], allow_methods=["GET"])

# 前端静态文件目录 (部署时将 web/out/* 放入此目录)
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)

app = Litestar(
    route_handlers=[
        api_records,
        api_department_stats,
        api_personal_stats,
        api_group_stats,
    ],
    cors_config=cors_config,
    static_files_config=[
        StaticFilesConfig(directories=[STATIC_DIR], path="/"),
    ],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=12375)
