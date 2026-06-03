"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { computeGroupStats, formatRate } from "@/lib/mock-data"
import type { AnomalyRecord, GroupStats } from "@/lib/mock-data"

interface GroupStatsProps {
    records: AnomalyRecord[]
    department: string
}

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

export function GroupStats({ records, department }: GroupStatsProps) {
    const stats = computeGroupStats(records, department)
    if (stats.length === 0) {
        return <p className="py-8 text-center text-base text-muted-foreground">该部门暂无数据</p>
    }
    return <DataTable columns={columns} data={stats} exportFileName={`${department}组室统计`} />
}

function RateBadge({ value }: { value: number }) {
    const pct = value * 100
    const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
    return <Badge variant={variant}>{formatRate(value)}</Badge>
}
