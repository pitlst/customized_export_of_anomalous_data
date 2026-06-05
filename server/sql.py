"""
SQL 模板 — 对齐谢总工作/export/sql.py
使用 DuckDB 语法: 支持 interval 运算和列/列除法

参数约定:
  {table}   — DuckDB 中已注册的聚合表名
  {org_map} — DuckDB 中已注册的 org_map 表名 (仅 raw_sql)
"""

# 原始数据导出
# 参数: table, org_map
raw_sql = """
select
"异常类型","异常描述","项目","项目名称","节车号","车号",
"工作中心","工位","工序名称","工序编码",
"异常状态分类",
"创建日期","修改日期",
"发起人","发起日期","发起人姓名","发起人组室","发起人部门",
"指定响应人","指定响应人姓名","指定响应人组室","指定响应人部门",
"响应人","响应日期","响应人姓名","响应人组室","响应人部门",
"处理人","处理日期","处理人姓名","处理人组室","处理人部门",
"关闭人","关闭日期","关闭人姓名","关闭人组室","关闭人部门",
{org_map}."部门" as "指定响应人部门(附加)"
from {table} bill
left join {org_map} on bill."指定响应人组室" = {org_map}."组室"
"""

#########################################################################################
# 部门统计: 按 工作中心 维度
# 参数: table
# 注意: DuckDB 不支持列/列直接除法, 故 rates 留空由 Python 补充
department_sql = """
select
bill."工作中心",
------------------------------------------------------------------------
count(bill."zid") as "总数",

sum(case when bill."响应日期" < '2023-01-01' then 0 else 1 end)
    as "响应数",
sum(case when ifnull(bill."响应日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - bill."发起日期" > interval '2 hours'
    then 0 else 1 end) as "响应及时数_总时长2H",
sum(case bill."响应是否超时" when '是' then 0 else 1 end)
    as "响应及时数_有效时长2H",

sum(case when bill."处理日期" < '2023-01-01' then 0 else 1 end)
    as "处理数",
sum(case when ifnull(bill."处理日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - ifnull(bill."响应日期", bill."发起日期") > interval '24 hours'
    then 0 else 1 end) as "处理及时数_总时长24H",
sum(case bill."处理是否超时" when '是' then 0 else 1 end)
    as "处理及时数_有效时长8H",

sum(case when bill."关闭日期" < '2023-01-01' then 0 else 1 end)
    as "关闭数"

from "{table}" bill
group by bill."工作中心"
"""

#########################################################################################
# 总表: 个人统计 (按 指定响应人)
# 参数: table
total_sql = """
select
bill."指定响应人"    as "工号",
bill."指定响应人姓名"  as "姓名",
bill."指定响应人组室"  as "组室",
bill."department"    as "部门",
------------------------------------------------------------------------
count(bill."zid") as "总数",

sum(case when bill."响应日期" < '2023-01-01' then 0 else 1 end)
    as "响应数",
sum(case when ifnull(bill."响应日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - bill."发起日期" > interval '2 hours'
    then 0 else 1 end) as "响应及时数_总时长2H",
sum(case bill."响应是否超时" when '是' then 0 else 1 end)
    as "响应及时数_有效时长2H",

sum(case when bill."处理日期" < '2023-01-01' then 0 else 1 end)
    as "处理数",
sum(case when ifnull(bill."处理日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - ifnull(bill."响应日期", bill."发起日期") > interval '24 hours'
    then 0 else 1 end) as "处理及时数_总时长24H",
sum(case bill."处理是否超时" when '是' then 0 else 1 end)
    as "处理及时数_有效时长8H",

sum(case when bill."关闭日期" < '2023-01-01' then 0 else 1 end)
    as "关闭数",

-- DuckDB 支持列除法
"响应数" / "总数"                          as "响应率",
"响应及时数_总时长2H" / "总数"               as "响应及时率_总时长2H",
"响应及时数_有效时长2H" / "总数"              as "响应及时率_有效时长2H",
"处理数" / "总数"                          as "处理率",
"处理及时数_总时长24H" / "总数"              as "处理及时率_总时长24H",
"处理及时数_有效时长8H" / "总数"              as "处理及时率_有效时长8H",
"关闭数" / "总数"                          as "关闭率"

------------------------------------------------------------------------
from "{table}" bill
group by bill."指定响应人", bill."指定响应人姓名", bill."department", bill."指定响应人组室"
order by "部门", "组室", "总数" DESC
"""

#########################################################################################
# 组室统计: 按部门筛选各组室
# 参数: table, department
group_sql = """
select
bill."指定响应人组室" as "组室",
------------------------------------------------------------------------
count(bill."zid") as "总数",

sum(case when bill."响应日期" < '2023-01-01' then 0 else 1 end)
    as "响应数",
sum(case when ifnull(bill."响应日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - bill."发起日期" > interval '2 hours'
    then 0 else 1 end) as "响应及时数_总时长2H",
sum(case bill."响应是否超时" when '是' then 0 else 1 end)
    as "响应及时数_有效时长2H",

sum(case when bill."处理日期" < '2023-01-01' then 0 else 1 end)
    as "处理数",
sum(case when ifnull(bill."处理日期", CURRENT_TIMESTAMP::TIMESTAMP)
         - ifnull(bill."响应日期", bill."发起日期") > interval '24 hours'
    then 0 else 1 end) as "处理及时数_总时长24H",
sum(case bill."处理是否超时" when '是' then 0 else 1 end)
    as "处理及时数_有效时长8H",

sum(case when bill."关闭日期" < '2023-01-01' then 0 else 1 end)
    as "关闭数",

"响应数" / "总数"                          as "响应率",
"响应及时数_总时长2H" / "总数"               as "响应及时率_总时长2H",
"响应及时数_有效时长2H" / "总数"              as "响应及时率_有效时长2H",
"处理数" / "总数"                          as "处理率",
"处理及时数_总时长24H" / "总数"              as "处理及时率_总时长24H",
"处理及时数_有效时长8H" / "总数"              as "处理及时率_有效时长8H",
"关闭数" / "总数"                          as "关闭率"
------------------------------------------------------------------------
from "{table}" bill
where bill."department" = '{department}'
group by bill."指定响应人组室"
order by "响应率" DESC, "处理率" DESC, "处理及时率_总时长24H" DESC, "总数" DESC, "响应及时率_总时长2H" DESC
"""
