// ============================================================
// 前端 API 客户端 — 与后端 Litestar 服务对接
// ============================================================

// 部署时前后端同源 → 空字符串（相对路径）
// 开发时如需指向其他端口，在 .env.local 中设置 NEXT_PUBLIC_API_BASE=http://localhost:8800
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""

export interface ApiError {
  message: string
  status: number
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw { message: `API error ${res.status}: ${res.statusText}`, status: res.status } as ApiError
  }
  return res.json()
}

// ============================================================
// 后端 API 类型（与 mock-data.ts 一致，此处重新声明以解耦）
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
  department: string
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
// API 方法 — 支持可选 year/month 参数
// ============================================================

interface DateParams {
  year?: number
  month?: number
}

function buildQuery(base: string, params?: DateParams): string {
  if (!params) return base
  const qs = new URLSearchParams()
  if (params.year !== undefined) qs.set("year", String(params.year))
  if (params.month !== undefined) qs.set("month", String(params.month))
  const s = qs.toString()
  return s ? `${base}?${s}` : base
}

export function fetchRecords(params?: DateParams): Promise<AnomalyRecord[]> {
  return fetchApi<AnomalyRecord[]>(buildQuery("/api/records", params))
}

export function fetchDepartmentStats(params?: DateParams): Promise<DepartmentStats[]> {
  return fetchApi<DepartmentStats[]>(buildQuery("/api/stats/department", params))
}

export function fetchPersonalStats(params?: DateParams): Promise<PersonalStats[]> {
  return fetchApi<PersonalStats[]>(buildQuery("/api/stats/personal", params))
}

export function fetchGroupStats(department: string, params?: DateParams): Promise<GroupStats[]> {
  const qs = new URLSearchParams({ department })
  if (params?.year !== undefined) qs.set("year", String(params.year))
  if (params?.month !== undefined) qs.set("month", String(params.month))
  return fetchApi<GroupStats[]>(`/api/stats/group?${qs.toString()}`)
}
