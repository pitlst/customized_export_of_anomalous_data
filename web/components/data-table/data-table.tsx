"use client"

import * as React from "react"
import {
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Search, X } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageSize?: number
    exportFileName?: string
}

export function DataTable<TData, TValue>({ columns, data, pageSize = 30, exportFileName = "export" }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        state: { sorting, columnFilters, globalFilter },
        initialState: { pagination: { pageSize } },
    })

    const handleExportExcel = () => {
        const visibleRows = table.getFilteredRowModel().rows
        const cols = table.getAllColumns()
        const headers = cols.map((col) => {
            const def = col.columnDef as { header?: string; accessorKey?: string }
            return (def.header ?? def.accessorKey ?? col.id) as string
        })

        const exportData = visibleRows.map((row) => {
            const record = row.original as Record<string, unknown>
            const obj: Record<string, unknown> = {}
            cols.forEach((col) => {
                const def = col.columnDef as { accessorKey?: string }
                const key = (def.accessorKey ?? col.id) as string
                obj[key] = record[key] ?? ""
            })
            return obj
        })

        const headerRow = headers.reduce(
            (acc, h, i) => {
                const key = (cols[i].columnDef as { accessorKey?: string }).accessorKey ?? cols[i].id
                acc[h] = (cols[i].columnDef as { header?: string }).header ?? key
                return acc
            },
            {} as Record<string, unknown>
        )
        const finalData = [headerRow, ...exportData]

        const ws = XLSX.utils.json_to_sheet(finalData, { skipHeader: true })
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        XLSX.writeFile(wb, `${exportFileName}.xlsx`)
    }

    const filtered = table.getFilteredRowModel().rows.length
    const total = data.length
    const pageIndex = table.getState().pagination.pageIndex
    const currentPageSize = table.getState().pagination.pageSize
    const from = filtered > 0 ? pageIndex * currentPageSize + 1 : 0
    const to = Math.min((pageIndex + 1) * currentPageSize, filtered)

    return (
        <div className="space-y-4">
            {/* 工具栏 */}
            <div className="flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="搜索全部列..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="h-8 pr-8 pl-8 text-sm"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter("")}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
                <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 shrink-0 gap-1.5 text-sm">
                    <Download className="size-3.5" />
                    导出 Excel
                </Button>
            </div>

            {/* 表格 */}
            <div className="rounded-lg border">
                <Table className="text-sm">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? "flex cursor-pointer items-center gap-1 select-none"
                                                        : "flex items-center gap-1"
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && <SortIndicator sorted={header.column.getIsSorted()} />}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    无匹配数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    {filtered !== total ? (
                        <>
                            筛选后 {filtered} 条（共 {total} 条），显示第 {from} – {to} 条
                        </>
                    ) : (
                        <>
                            共 {total} 条，显示第 {from} – {to} 条
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon-xs" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronsLeft className="size-3" />
                    </Button>
                    <Button variant="outline" size="icon-xs" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronLeft className="size-3" />
                    </Button>
                    <span className="px-2 text-xs tabular-nums">
                        {table.getPageCount() > 0 ? pageIndex + 1 : 0} / {table.getPageCount() || 1}
                    </span>
                    <Button variant="outline" size="icon-xs" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ChevronRight className="size-3" />
                    </Button>
                    <Button variant="outline" size="icon-xs" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
                        <ChevronsRight className="size-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
    if (!sorted) return <span className="ml-0.5 text-xs text-muted-foreground/40">↕</span>
    return <span className="ml-0.5 text-xs">{sorted === "asc" ? "↑" : "↓"}</span>
}
