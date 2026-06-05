"""ClickHouse 数据库连接 — 使用 clickhouse-connect"""

import clickhouse_connect
from clickhouse_connect.driver.client import Client

# ============================================================
# 🔧 全局数据库连接配置 — 部署时修改以下变量
# ============================================================

CH_HOST = "10.24.5.59"
CH_PORT = 8123
CH_USER = "cheakf"
CH_PASSWORD = "Swq8855830."
CH_DATABASE = "dwd"

# ============================================================


def get_ch_client() -> Client:
    """创建 ClickHouse 客户端 (clickhouse-connect)"""
    return clickhouse_connect.get_client(
        host=CH_HOST,
        port=CH_PORT,
        username=CH_USER,
        password=CH_PASSWORD,
        database=CH_DATABASE,
        settings={
            "timezone": "Asia/Shanghai",
            "date_time_input_format": "best_effort",
        },
    )

