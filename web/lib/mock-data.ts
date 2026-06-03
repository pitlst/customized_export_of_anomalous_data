// ============================================================
// 类型定义 — 与 ClickHouse dwd.cg_mes_usm_exception_processed 表对齐
// ============================================================

export interface AnomalyRecord {
  zid: string
  异常类型: string
  异常描述: string
  项目: string
  项目名称: string
  节车号: string
  车号: string
  工作中心: string
  工位: string
  工序名称: string
  工序编码: string
  异常状态分类: string
  创建日期: string
  修改日期: string
  发起人: string
  发起日期: string
  发起人姓名: string
  发起人组室: string
  发起人部门: string
  指定响应人: string
  指定响应人姓名: string
  指定响应人组室: string
  指定响应人部门: string
  响应人: string
  响应日期: string
  响应人姓名: string
  响应人组室: string
  响应人部门: string
  处理人: string
  处理日期: string
  处理人姓名: string
  处理人组室: string
  处理人部门: string
  关闭人: string
  关闭日期: string
  关闭人姓名: string
  关闭人组室: string
  关闭人部门: string
  department: string // 附加: org_map join 得来
  响应是否超时: "是" | "否"
  处理是否超时: "是" | "否"
}

export interface DepartmentStats {
  工作中心: string
  总数: number
  响应数: number
  响应及时数_总时长2H: number
  响应及时数_有效时长2H: number
  处理数: number
  处理及时数_总时长24H: number
  处理及时数_有效时长8H: number
  关闭数: number
  响应率: number
  响应及时率_总时长2H: number
  响应及时率_有效时长2H: number
  处理率: number
  处理及时率_总时长24H: number
  处理及时率_有效时长8H: number
  关闭率: number
}

export interface PersonalStats {
  工号: string
  姓名: string
  组室: string
  部门: string
  总数: number
  响应数: number
  响应及时数_总时长2H: number
  响应及时数_有效时长2H: number
  处理数: number
  处理及时数_总时长24H: number
  处理及时数_有效时长8H: number
  关闭数: number
  响应率: number
  响应及时率_总时长2H: number
  响应及时率_有效时长2H: number
  处理率: number
  处理及时率_总时长24H: number
  处理及时率_有效时长8H: number
  关闭率: number
}

export interface GroupStats {
  组室: string
  总数: number
  响应数: number
  响应及时数_总时长2H: number
  响应及时数_有效时长2H: number
  处理数: number
  处理及时数_总时长24H: number
  处理及时数_有效时长8H: number
  关闭数: number
  响应率: number
  响应及时率_总时长2H: number
  响应及时率_有效时长2H: number
  处理率: number
  处理及时率_总时长24H: number
  处理及时率_有效时长8H: number
  关闭率: number
}

// ============================================================
// 组织架构映射 (来自 new_org.csv)
// ============================================================

export const ORG_MAP: Record<string, string> = {
  落车班: "调试交付",
  调车班: "调试交付",
  校线一班: "调试交付",
  校线二班: "调试交付",
  调试一班: "调试交付",
  调试二班: "调试交付",
  调试三班: "调试交付",
  调试四班: "调试交付",
  交车进程组: "项目管理",
  生产管理组: "项目管理",
  现场安全组: "项目管理",
  计划管理组: "项目管理",
  设备管理组: "项目管理",
  总成进程组: "项目管理",
  质量保证组: "质量管理",
  交付质量组: "质量管理",
  过程质量组: "质量管理",
  粘接组: "工艺技术",
  内装组: "工艺技术",
  外装组: "工艺技术",
  电气组: "工艺技术",
  管钳组: "工艺技术",
  台车组: "总成组装",
  构架组: "总成组装",
  落轮组: "总成组装",
  轮对组: "总成组装",
  轴承组: "总成组装",
  制动组: "总成组装",
}

// ============================================================
// 人员池
// ============================================================

const GROUPS = Object.keys(ORG_MAP)

const PEOPLE: { name: string; group: string }[] = [
  { name: "张伟", group: "落车班" },
  { name: "李强", group: "调车班" },
  { name: "王芳", group: "校线一班" },
  { name: "刘洋", group: "校线二班" },
  { name: "陈明", group: "调试一班" },
  { name: "杨丽", group: "调试二班" },
  { name: "赵磊", group: "调试三班" },
  { name: "周敏", group: "调试四班" },
  { name: "吴刚", group: "交车进程组" },
  { name: "郑洁", group: "生产管理组" },
  { name: "孙涛", group: "现场安全组" },
  { name: "马超", group: "计划管理组" },
  { name: "林红", group: "设备管理组" },
  { name: "何军", group: "总成进程组" },
  { name: "罗文", group: "粘接组" },
  { name: "梁丹", group: "内装组" },
  { name: "宋波", group: "外装组" },
  { name: "谢静", group: "电气组" },
  { name: "韩飞", group: "管钳组" },
  { name: "唐宁", group: "台车组" },
  { name: "曹阳", group: "构架组" },
  { name: "邓峰", group: "落轮组" },
  { name: "彭浩", group: "轮对组" },
  { name: "冯强", group: "轴承组" },
  { name: "董华", group: "制动组" },
]

const WORK_CENTERS = ["总成车间", "交车车间", "调试车间"]

const ANOMALY_TYPES = ["缺料异常", "设备故障", "工艺问题", "质量异常", "人员问题", "图纸问题"]

const PROJECTS = [
  { code: "PRJ001", name: "CR450动车组项目" },
  { code: "PRJ002", name: "地铁B型车项目" },
  { code: "PRJ003", name: "城际列车项目" },
]

// ============================================================
// 生成模拟异常记录
// ============================================================

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().replace("T", " ").substring(0, 19)
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function hoursAfter(dateStr: string, maxHours: number): string {
  const d = new Date(dateStr.replace(" ", "T") + "Z")
  d.setHours(d.getHours() + Math.random() * maxHours)
  return d.toISOString().replace("T", " ").substring(0, 19)
}

function generateRecords(count: number): AnomalyRecord[] {
  const records: AnomalyRecord[] = []
  const baseDate = new Date("2026-05-01")

  for (let i = 0; i < count; i++) {
    const zid = `EX-${String(i + 1).padStart(6, "0")}`
    const project = randomItem(PROJECTS)
    const workCenter = randomItem(WORK_CENTERS)
    const anomalyType = randomItem(ANOMALY_TYPES)
    const person = randomItem(PEOPLE)
    const department = ORG_MAP[person.group] ?? "未知"

    const createDate = randomDate(baseDate, new Date("2026-05-30"))
    const initDate = randomDate(baseDate, new Date("2026-05-30"))

    // 响应时间 (0.1 ~ 4h)
    const responseHours = Math.random() * 4
    const responseOvertime = responseHours > 2 ? "是" : "否"
    const responseDate = hoursAfter(initDate, responseHours)

    // 处理时间 (1 ~ 36h)
    const processHours = Math.random() * 36
    const processOvertime = processHours > 24 ? "是" : "否"
    const processDate = hoursAfter(responseDate, Math.max(processHours - responseHours, 0.5))

    // 关闭时间
    const closeHours = Math.random() * 72
    const closeDate = hoursAfter(processDate, Math.max(closeHours - processHours, 0.5))

    const responder = randomItem(PEOPLE.filter((p) => p.group === person.group))
    const processor = randomItem(PEOPLE)

    records.push({
      zid,
      异常类型: anomalyType,
      异常描述: `${anomalyType}—${project.name}${randomItem(["左侧", "右侧", "前部", "后部"])}${randomItem(["安装", "检测", "调试", "焊接"])}工序`,
      项目: project.code,
      项目名称: project.name,
      节车号: `TC${Math.floor(Math.random() * 8) + 1}`,
      车号: `CR450-${String(Math.floor(Math.random() * 3000) + 1000)}`,
      工作中心: workCenter,
      工位: `${workCenter.substring(0, 2)}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      工序名称: `${anomalyType}处理`,
      工序编码: `OP-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      异常状态分类: randomItem(["已关闭", "处理中", "待响应"]),
      创建日期: createDate,
      修改日期: randomDate(new Date(createDate.replace(" ", "T")), new Date()),
      发起人: `USR${String(Math.floor(Math.random() * 2000) + 100).padStart(4, "0")}`,
      发起日期: initDate,
      发起人姓名: randomItem(["赵工", "钱工", "孙工", "李工"]),
      发起人组室: randomItem(GROUPS),
      发起人部门: department,
      指定响应人: `EMP${String(i + 100).padStart(4, "0")}`,
      指定响应人姓名: person.name,
      指定响应人组室: person.group,
      指定响应人部门: department,
      响应人: responder.name,
      响应日期: responseDate,
      响应人姓名: responder.name,
      响应人组室: responder.group,
      响应人部门: ORG_MAP[responder.group] ?? "未知",
      处理人: processor.name,
      处理日期: processDate,
      处理人姓名: processor.name,
      处理人组室: processor.group,
      处理人部门: ORG_MAP[processor.group] ?? "未知",
      关闭人: randomItem(PEOPLE).name,
      关闭日期: closeDate,
      关闭人姓名: randomItem(PEOPLE).name,
      关闭人组室: randomItem(GROUPS),
      关闭人部门: ORG_MAP[randomItem(GROUPS)] ?? "未知",
      department,
      响应是否超时: responseOvertime,
      处理是否超时: processOvertime,
    })
  }
  return records
}

// ============================================================
// 导出: 原始数据
// ============================================================

export const ANOMALY_RECORDS: AnomalyRecord[] = generateRecords(120)

// ============================================================
// 导出: 部门统计 (来源)
// ============================================================

export function computeDepartmentStats(records: AnomalyRecord[]): DepartmentStats[] {
  const map = new Map<string, AnomalyRecord[]>()
  for (const r of records) {
    const wc = r.工作中心 || "未知"
    if (!map.has(wc)) map.set(wc, [])
    map.get(wc)!.push(r)
  }
  return Array.from(map.entries()).map(([wc, rs]) => buildDeptStat(wc, rs))
}

function buildDeptStat(name: string, rs: AnomalyRecord[]): DepartmentStats {
  const total = rs.length
  const responded = rs.filter((r) => new Date(r.响应日期) > new Date("2023-01-01")).length
  const respondedTimely2h = rs.filter((r) => r.响应是否超时 === "否").length
  const processed = rs.filter((r) => new Date(r.处理日期) > new Date("2023-01-01")).length
  const processedTimely24h = rs.filter((r) => r.处理是否超时 === "否").length
  const closed = rs.filter((r) => new Date(r.关闭日期) > new Date("2023-01-01")).length

  return {
    工作中心: name,
    总数: total,
    响应数: responded,
    响应及时数_总时长2H: respondedTimely2h,
    响应及时数_有效时长2H: respondedTimely2h,
    处理数: processed,
    处理及时数_总时长24H: processedTimely24h,
    处理及时数_有效时长8H: processedTimely24h,
    关闭数: closed,
    响应率: total > 0 ? responded / total : 0,
    响应及时率_总时长2H: total > 0 ? respondedTimely2h / total : 0,
    响应及时率_有效时长2H: total > 0 ? respondedTimely2h / total : 0,
    处理率: total > 0 ? processed / total : 0,
    处理及时率_总时长24H: total > 0 ? processedTimely24h / total : 0,
    处理及时率_有效时长8H: total > 0 ? processedTimely24h / total : 0,
    关闭率: total > 0 ? closed / total : 0,
  }
}

// ============================================================
// 导出: 个人统计 (个人)
// ============================================================

export function computePersonalStats(records: AnomalyRecord[]): PersonalStats[] {
  const map = new Map<string, AnomalyRecord[]>()
  for (const r of records) {
    const key = r.指定响应人
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries())
    .map(([key, rs]) => {
      const r0 = rs[0]
      const total = rs.length
      const responded = rs.filter((r) => new Date(r.响应日期) > new Date("2023-01-01")).length
      const respondedTimely = rs.filter((r) => r.响应是否超时 === "否").length
      const processed = rs.filter((r) => new Date(r.处理日期) > new Date("2023-01-01")).length
      const processedTimely = rs.filter((r) => r.处理是否超时 === "否").length
      const closed = rs.filter((r) => new Date(r.关闭日期) > new Date("2023-01-01")).length

      return {
        工号: key,
        姓名: r0.指定响应人姓名,
        组室: r0.指定响应人组室,
        部门: r0.department,
        总数: total,
        响应数: responded,
        响应及时数_总时长2H: respondedTimely,
        响应及时数_有效时长2H: respondedTimely,
        处理数: processed,
        处理及时数_总时长24H: processedTimely,
        处理及时数_有效时长8H: processedTimely,
        关闭数: closed,
        响应率: total > 0 ? responded / total : 0,
        响应及时率_总时长2H: total > 0 ? respondedTimely / total : 0,
        响应及时率_有效时长2H: total > 0 ? respondedTimely / total : 0,
        处理率: total > 0 ? processed / total : 0,
        处理及时率_总时长24H: total > 0 ? processedTimely / total : 0,
        处理及时率_有效时长8H: total > 0 ? processedTimely / total : 0,
        关闭率: total > 0 ? closed / total : 0,
      }
    })
    .sort((a, b) => b.总数 - a.总数)
}

// ============================================================
// 导出: 部门组室统计 (group_sql 模式)
// ============================================================

export function computeGroupStats(records: AnomalyRecord[], department: string): GroupStats[] {
  const map = new Map<string, AnomalyRecord[]>()
  for (const r of records) {
    if (r.department !== department) continue
    const g = r.指定响应人组室
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(r)
  }
  return Array.from(map.entries())
    .map(([g, rs]) => {
      const total = rs.length
      const responded = rs.filter((r) => new Date(r.响应日期) > new Date("2023-01-01")).length
      const respondedTimely = rs.filter((r) => r.响应是否超时 === "否").length
      const processed = rs.filter((r) => new Date(r.处理日期) > new Date("2023-01-01")).length
      const processedTimely = rs.filter((r) => r.处理是否超时 === "否").length
      const closed = rs.filter((r) => new Date(r.关闭日期) > new Date("2023-01-01")).length

      return {
        组室: g,
        总数: total,
        响应数: responded,
        响应及时数_总时长2H: respondedTimely,
        响应及时数_有效时长2H: respondedTimely,
        处理数: processed,
        处理及时数_总时长24H: processedTimely,
        处理及时数_有效时长8H: processedTimely,
        关闭数: closed,
        响应率: total > 0 ? responded / total : 0,
        响应及时率_总时长2H: total > 0 ? respondedTimely / total : 0,
        响应及时率_有效时长2H: total > 0 ? respondedTimely / total : 0,
        处理率: total > 0 ? processed / total : 0,
        处理及时率_总时长24H: total > 0 ? processedTimely / total : 0,
        处理及时率_有效时长8H: total > 0 ? processedTimely / total : 0,
        关闭率: total > 0 ? closed / total : 0,
      }
    })
    .sort((a, b) => b.响应率 - a.响应率 || b.处理率 - a.处理率 || b.总数 - a.总数)
}

// ============================================================
// 工具函数
// ============================================================

export function formatRate(v: number): string {
  return `${(v * 100).toFixed(1)}%`
}

export function formatDateTime(d: string): string {
  if (!d) return "-"
  return d.replace("T", " ").substring(0, 19)
}
