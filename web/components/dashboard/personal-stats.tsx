"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { computePersonalStats, formatRate } from "@/lib/mock-data"
import type { AnomalyRecord, PersonalStats } from "@/lib/mock-data"

interface PersonalStatsProps {
    records: AnomalyRecord[]
}

const columns: ColumnDef<PersonalStats>[] = [
    { accessorKey: "工号", header: "工号", cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span> },
    { accessorKey: "姓名", header: "姓名", cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
    { accessorKey: "组室", header: "组室" },
    { accessorKey: "部门", header: "部门" },
    { accessorKey: "总数", header: "总数", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
    { accessorKey: "响应率", header: "响应率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
    { accessorKey: "响应及时率_总时长2H", header: "响应及时率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
    { accessorKey: "处理率", header: "处理率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
    { accessorKey: "处理及时率_总时长24H", header: "处理及时率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
    { accessorKey: "关闭率", header: "关闭率", cell: ({ getValue }) => <RateBadge value={getValue<number>()} /> },
]

export function PersonalStats({ records }: PersonalStatsProps) {
    const stats = computePersonalStats(records)
    return <DataTable columns={columns} data={stats} exportFileName="个人统计" />
}

function RateBadge({ value }: { value: number }) {
    const pct = value * 100
    const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
    return <Badge variant={variant}>{formatRate(value)}</Badge>
}
