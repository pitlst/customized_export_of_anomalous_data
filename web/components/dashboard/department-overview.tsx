"use client"

import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { fetchDepartmentStats } from "@/lib/api"
import type { DepartmentStats } from "@/lib/api"
import { StatsCards } from "./stats-cards"

const columns: ColumnDef<DepartmentStats>[] = [
  { accessorKey: "工作中心", header: "工作中心", cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
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

export function DepartmentOverview({ params }: { params?: { year?: number; month?: number } }) {
  const [stats, setStats] = useState<DepartmentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchDepartmentStats(params)
      .then(setStats)
      .catch((e) => setError(e.message ?? "加载失败"))
      .finally(() => setLoading(false))
  }, [params?.year, params?.month])

  if (loading) return <Skeleton />
  if (error) return <ErrorMsg message={error} />

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <DataTable columns={columns} data={stats} exportFileName="部门概览" />
    </div>
  )
}

function RateBadge({ value }: { value: number }) {
  const pct = value * 100
  const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
  return <Badge variant={variant}>{`${(value * 100).toFixed(1)}%`}</Badge>
}

function Skeleton() {
  return <div className="space-y-4 animate-pulse">
    <div className="h-24 bg-muted rounded-lg" />
    <div className="h-64 bg-muted rounded-lg" />
  </div>
}

function ErrorMsg({ message }: { message: string }) {
  return <div className="py-16 text-center text-sm text-destructive">{message}</div>
}
