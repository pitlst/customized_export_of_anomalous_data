"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import type { AnomalyRecord } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/mock-data"

interface RawDataTableProps {
    records: AnomalyRecord[]
}

const columns: ColumnDef<AnomalyRecord>[] = [
    { accessorKey: "zid", header: "ID", cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span> },
    { accessorKey: "异常类型", header: "异常类型" },
    {
        accessorKey: "异常描述",
        header: "异常描述",
        cell: ({ getValue }) => (
            <span className="block max-w-[200px] truncate" title={getValue<string>()}>
                {getValue<string>()}
            </span>
        ),
    },
    { accessorKey: "项目名称", header: "项目名称" },
    { accessorKey: "节车号", header: "节车号" },
    { accessorKey: "工作中心", header: "工作中心" },
    { accessorKey: "异常状态分类", header: "状态", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
    { accessorKey: "发起人姓名", header: "发起人" },
    { accessorKey: "发起日期", header: "发起日期", cell: ({ getValue }) => <span className="font-mono">{formatDateTime(getValue<string>())}</span> },
    { accessorKey: "指定响应人姓名", header: "指定响应人" },
    { accessorKey: "响应人姓名", header: "响应人" },
    { accessorKey: "响应日期", header: "响应日期", cell: ({ getValue }) => <span className="font-mono">{formatDateTime(getValue<string>())}</span> },
    { accessorKey: "处理人姓名", header: "处理人" },
    { accessorKey: "处理日期", header: "处理日期", cell: ({ getValue }) => <span className="font-mono">{formatDateTime(getValue<string>())}</span> },
    { accessorKey: "关闭日期", header: "关闭日期", cell: ({ getValue }) => <span className="font-mono">{formatDateTime(getValue<string>())}</span> },
    { accessorKey: "响应是否超时", header: "响应超时", cell: ({ getValue }) => <OvertimeBadge isOvertime={getValue<string>() === "是"} /> },
    { accessorKey: "处理是否超时", header: "处理超时", cell: ({ getValue }) => <OvertimeBadge isOvertime={getValue<string>() === "是"} /> },
]

export function RawDataTable({ records }: RawDataTableProps) {
    return <DataTable columns={columns} data={records} exportFileName="原始数据" />
}

function StatusBadge({ status }: { status: string }) {
    const variant = status === "已关闭" ? "secondary" : status === "处理中" ? "default" : "outline"
    return <Badge variant={variant}>{status}</Badge>
}

function OvertimeBadge({ isOvertime }: { isOvertime: boolean }) {
    return isOvertime ? <Badge variant="destructive">超时</Badge> : <Badge variant="outline">正常</Badge>
}
