"""模拟数据生成 — 与前端 mock-data.ts 逻辑完全一致"""
import random
from datetime import datetime, timedelta
from typing import Any

ORG_MAP: dict[str, str] = {
    "落车班": "调试交付", "调车班": "调试交付", "校线一班": "调试交付", "校线二班": "调试交付",
    "调试一班": "调试交付", "调试二班": "调试交付", "调试三班": "调试交付", "调试四班": "调试交付",
    "交车进程组": "项目管理", "生产管理组": "项目管理", "现场安全组": "项目管理",
    "计划管理组": "项目管理", "设备管理组": "项目管理", "总成进程组": "项目管理",
    "质量保证组": "质量管理", "交付质量组": "质量管理", "过程质量组": "质量管理",
    "粘接组": "工艺技术", "内装组": "工艺技术", "外装组": "工艺技术",
    "电气组": "工艺技术", "管钳组": "工艺技术",
    "台车组": "总成组装", "构架组": "总成组装", "落轮组": "总成组装",
    "轮对组": "总成组装", "轴承组": "总成组装", "制动组": "总成组装",
}

GROUPS = list(ORG_MAP.keys())

PEOPLE = [
    {"name": "张伟", "group": "落车班"}, {"name": "李强", "group": "调车班"},
    {"name": "王芳", "group": "校线一班"}, {"name": "刘洋", "group": "校线二班"},
    {"name": "陈明", "group": "调试一班"}, {"name": "杨丽", "group": "调试二班"},
    {"name": "赵磊", "group": "调试三班"}, {"name": "周敏", "group": "调试四班"},
    {"name": "吴刚", "group": "交车进程组"}, {"name": "郑洁", "group": "生产管理组"},
    {"name": "孙涛", "group": "现场安全组"}, {"name": "马超", "group": "计划管理组"},
    {"name": "林红", "group": "设备管理组"}, {"name": "何军", "group": "总成进程组"},
    {"name": "罗文", "group": "粘接组"}, {"name": "梁丹", "group": "内装组"},
    {"name": "宋波", "group": "外装组"}, {"name": "谢静", "group": "电气组"},
    {"name": "韩飞", "group": "管钳组"}, {"name": "唐宁", "group": "台车组"},
    {"name": "曹阳", "group": "构架组"}, {"name": "邓峰", "group": "落轮组"},
    {"name": "彭浩", "group": "轮对组"}, {"name": "冯强", "group": "轴承组"},
    {"name": "董华", "group": "制动组"},
]

WORK_CENTERS = ["总成车间", "交车车间", "调试车间"]
ANOMALY_TYPES = ["缺料异常", "设备故障", "工艺问题", "质量异常", "人员问题", "图纸问题"]
PROJECTS = [
    {"code": "PRJ001", "name": "CR450动车组项目"},
    {"code": "PRJ002", "name": "地铁B型车项目"},
    {"code": "PRJ003", "name": "城际列车项目"},
]

INITIATORS = ["赵工", "钱工", "孙工", "李工"]
POSITIONS = ["左侧", "右侧", "前部", "后部"]
OPERATIONS = ["安装", "检测", "调试", "焊接"]
STATUSES = ["已关闭", "处理中", "待响应"]

BASE_DATE = datetime(2026, 5, 1)
END_DATE = datetime(2026, 5, 30)


def _random_date(start: datetime, end: datetime) -> str:
    delta = (end - start).total_seconds()
    d = start + timedelta(seconds=random.uniform(0, delta))
    return d.strftime("%Y-%m-%d %H:%M:%S")


def _hours_after(date_str: str, max_hours: float) -> str:
    d = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    d += timedelta(hours=random.uniform(0, max_hours))
    return d.strftime("%Y-%m-%d %H:%M:%S")


def _build_base(idx: int, person: dict[str, str], project: dict[str, str],
                work_center: str, anomaly_type: str) -> dict[str, Any]:
    init_date = _random_date(BASE_DATE, END_DATE)
    create_date = _random_date(BASE_DATE, END_DATE)
    department = ORG_MAP.get(person["group"], "未知")

    # 响应: 总时长阈值 2h (总时长 ≈ 有效时长, 短期内一致)
    response_hours = random.uniform(0.1, 4)
    response_overtime = "是" if response_hours > 2 else "否"
    response_date = _hours_after(init_date, response_hours)

    # 处理: 总时长 1~36h, 有效时长 1~16h — 两者独立, 体现"总时长"与"有效时长"指标分离
    process_hours = random.uniform(1, 36)           # 总耗时(含非工作时段)
    effective_process_hours = random.uniform(1, 16)  # 有效工作时长
    process_overtime = "是" if effective_process_hours > 8 else "否"  # 有效超时 > 8h
    process_date = _hours_after(response_date, max(process_hours - response_hours, 0.5))

    close_hours = random.uniform(1, 72)
    close_date = _hours_after(process_date, max(close_hours - process_hours, 0.5))

    responder = random.choice([p for p in PEOPLE if p["group"] == person["group"]])
    processor = random.choice(PEOPLE)

    return {
        "zid": f"EX-{idx + 1:06d}",
        "异常类型": anomaly_type,
        "异常描述": f"{anomaly_type}—{project['name']}{random.choice(POSITIONS)}{random.choice(OPERATIONS)}工序",
        "项目": project["code"],
        "项目名称": project["name"],
        "节车号": f"TC{random.randint(1, 8)}",
        "车号": f"CR450-{random.randint(1000, 3999)}",
        "工作中心": work_center,
        "工位": f"{work_center[:2]}-{random.randint(1, 20):02d}",
        "工序名称": f"{anomaly_type}处理",
        "工序编码": f"OP-{random.randint(0, 999):03d}",
        "异常状态分类": random.choice(STATUSES),
        "创建日期": create_date,
        "修改日期": _random_date(datetime.strptime(create_date, "%Y-%m-%d %H:%M:%S"), datetime.now()),
        "发起人": f"USR{random.randint(100, 2099):04d}",
        "发起日期": init_date,
        "发起人姓名": random.choice(INITIATORS),
        "发起人组室": random.choice(GROUPS),
        "发起人部门": department,
        "指定响应人": f"EMP{idx + 100:04d}",
        "指定响应人姓名": person["name"],
        "指定响应人组室": person["group"],
        "指定响应人部门": department,
        "响应人": responder["name"],
        "响应日期": response_date,
        "响应人姓名": responder["name"],
        "响应人组室": responder["group"],
        "响应人部门": ORG_MAP.get(responder["group"], "未知"),
        "处理人": processor["name"],
        "处理日期": process_date,
        "处理人姓名": processor["name"],
        "处理人组室": processor["group"],
        "处理人部门": ORG_MAP.get(processor["group"], "未知"),
        "关闭人": random.choice(PEOPLE)["name"],
        "关闭日期": close_date,
        "关闭人姓名": random.choice(PEOPLE)["name"],
        "关闭人组室": random.choice(GROUPS),
        "关闭人部门": ORG_MAP.get(random.choice(GROUPS), "未知"),
        "department": department,
        "响应是否超时": response_overtime,
        "处理是否超时": process_overtime,
    }


# --- 模块级缓存（仅生成一次） ---
RECORDS: list[dict[str, Any]] = []


def get_records(count: int = 120) -> list[dict[str, Any]]:
    global RECORDS
    if not RECORDS:
        for i in range(count):
            person = random.choice(PEOPLE)
            project = random.choice(PROJECTS)
            work_center = random.choice(WORK_CENTERS)
            anomaly_type = random.choice(ANOMALY_TYPES)
            RECORDS.append(_build_base(i, person, project, work_center, anomaly_type))
    return RECORDS


# --- 统计函数 ---
# 计算逻辑对齐谢总工作/export/sql.py 中的 SQL 模板
#   - 响应及时数(总时长2H):  ifnull(响应日期, now) - 发起日期 <= 2h
#   - 响应及时数(有效时长2H): pre-computed 响应是否超时 flag
#   - 处理及时数(总时长24H): ifnull(处理日期, now) - ifnull(响应日期, 发起日期) <= 24h
#   - 处理及时数(有效时长8H): pre-computed 处理是否超时 flag
#   - 计数类: 对应日期 >= 2023-01-01 才算已发生

def _to_dt(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")


THRESHOLD = datetime(2023, 1, 1)


def _compute(base: list[dict[str, Any]], key_fn, name_fn) -> list[dict[str, Any]]:
    buckets: dict[str, list[dict[str, Any]]] = {}
    for r in base:
        k = key_fn(r)
        buckets.setdefault(k, []).append(r)

    result: list[dict[str, Any]] = []
    now = datetime.now()

    for k, rs in buckets.items():
        total = len(rs)

        # 响应数: 响应日期 >= 2023 才算已响应
        responded = 0
        # 响应及时数(总时长2H): ifnull(响应日期, now) - 发起日期 <= 2h
        responded_timely_total = 0
        # 响应及时数(有效时长2H): pre-computed flag
        responded_timely_effective = 0

        # 处理数: 处理日期 >= 2023 才算已处理
        processed = 0
        # 处理及时数(总时长24H): ifnull(处理日期, now) - ifnull(响应日期, 发起日期) <= 24h
        processed_timely_total = 0
        # 处理及时数(有效时长8H): pre-computed flag
        processed_timely_effective = 0

        # 关闭数
        closed = 0

        for r in rs:
            init_dt = _to_dt(r["发起日期"])
            resp_dt = _to_dt(r["响应日期"])
            proc_dt = _to_dt(r["处理日期"])
            close_dt = _to_dt(r["关闭日期"])

            # --- 响应计数 ---
            if resp_dt > THRESHOLD:
                responded += 1
                # 总时长: 响应日期 - 发起日期 <= 2h
                if (resp_dt - init_dt).total_seconds() / 3600 <= 2:
                    responded_timely_total += 1
            else:
                # 未响应: 用当前时间模拟 ifnull
                if (now - init_dt).total_seconds() / 3600 <= 2:
                    responded_timely_total += 1

            if r["响应是否超时"] == "否":
                responded_timely_effective += 1

            # --- 处理计数 ---
            if proc_dt > THRESHOLD:
                processed += 1
                # 总时长24H: 处理日期 - ifnull(响应日期, 发起日期) <= 24h
                base_dt = resp_dt if resp_dt > THRESHOLD else init_dt
                if (proc_dt - base_dt).total_seconds() / 3600 <= 24:
                    processed_timely_total += 1
            else:
                # 未处理: 用当前时间
                base_dt = resp_dt if resp_dt > THRESHOLD else init_dt
                if (now - base_dt).total_seconds() / 3600 <= 24:
                    processed_timely_total += 1

            if r["处理是否超时"] == "否":
                processed_timely_effective += 1

            # --- 关闭计数 ---
            if close_dt > THRESHOLD:
                closed += 1

        result.append({
            **name_fn(k),
            "总数": total,
            "响应数": responded,
            "响应及时数_总时长2H": responded_timely_total,
            "响应及时数_有效时长2H": responded_timely_effective,
            "处理数": processed,
            "处理及时数_总时长24H": processed_timely_total,
            "处理及时数_有效时长8H": processed_timely_effective,
            "关闭数": closed,
            "响应率": responded / total if total else 0,
            "响应及时率_总时长2H": responded_timely_total / total if total else 0,
            "响应及时率_有效时长2H": responded_timely_effective / total if total else 0,
            "处理率": processed / total if total else 0,
            "处理及时率_总时长24H": processed_timely_total / total if total else 0,
            "处理及时率_有效时长8H": processed_timely_effective / total if total else 0,
            "关闭率": closed / total if total else 0,
        })
    return result


def compute_department_stats(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return _compute(
        records,
        key_fn=lambda r: r.get("工作中心", "未知"),
        name_fn=lambda k: {"工作中心": k},
    )


def compute_personal_stats(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = _compute(
        records,
        key_fn=lambda r: r["指定响应人"],
        name_fn=lambda k: {
            "工号": k,
            "姓名": next((r["指定响应人姓名"] for r in records if r["指定响应人"] == k), ""),
            "组室": next((r["指定响应人组室"] for r in records if r["指定响应人"] == k), ""),
            "部门": next((r["department"] for r in records if r["指定响应人"] == k), ""),
        },
    )
    result.sort(key=lambda x: x["总数"], reverse=True)
    return result


def compute_group_stats(records: list[dict[str, Any]], department: str) -> list[dict[str, Any]]:
    filtered = [r for r in records if r.get("department") == department]
    result = _compute(
        filtered,
        key_fn=lambda r: r["指定响应人组室"],
        name_fn=lambda k: {"组室": k},
    )
    result.sort(key=lambda x: (-x["响应率"], -x["处理率"], -x["总数"]))
    return result
