"use client"

import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { fetchGroupStats } from "@/lib/api"
import type { GroupStats } from "@/lib/api"

const columns: ColumnDef<GroupStats>[] = [
  { accessorKey: "组室", header: "组室", cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
  { accessorKey: "总数", header: "总数", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "响应数", header: "响应数", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "响应及时数_总时长2H", header: "响应及时数(2H)", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "响应率", header: "响应率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
  { accessorKey: "响应及时率_总时长2H", header: "响应及时率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
  { accessorKey: "处理数", header: "处理数", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "处理及时数_总时长24H", header: "处理及时数(24H)", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "处理率", header: "处理率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
  { accessorKey: "处理及时率_总时长24H", header: "处理及时率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
  { accessorKey: "关闭数", header: "关闭数", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
  { accessorKey: "关闭率", header: "关闭率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
]

interface GroupStatsProps {
  department: string
  params?: { year?: number; month?: number }
}

export function GroupStats({ department, params }: GroupStatsProps) {
  const [stats, setStats] = useState<GroupStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchGroupStats(department, params)
      .then(setStats)
      .catch((e) => setError(e.message ?? "加载失败"))
      .finally(() => setLoading(false))
  }, [department, params?.year, params?.month])

  if (loading) return <Skeleton />
  if (error) return <ErrorMsg message={error} />
  if (stats.length === 0) return <p className="py-8 text-center text-base text-muted-foreground">该部门暂无数据</p>

  return <DataTable columns={columns} data={stats} exportFileName={`${department}组室统计`} />
}

function RateBadge({ value }: { value: number }) {
  const pct = value * 100
  const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
  return <Badge variant={variant}>{`${(value * 100).toFixed(1)}%`}</Badge>
}

function Skeleton() {
  return <div className="h-64 animate-pulse rounded-lg bg-muted" />
}

function ErrorMsg({ message }: { message: string }) {
  return <div className="py-16 text-center text-sm text-destructive">{message}</div>
}
