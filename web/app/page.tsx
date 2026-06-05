"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DepartmentOverview } from "@/components/dashboard/department-overview"
import { PersonalStats } from "@/components/dashboard/personal-stats"
import { GroupStats } from "@/components/dashboard/group-stats"
import { RawDataTable } from "@/components/dashboard/raw-data-table"
import { ThemeToggle } from "@/components/theme-toggle"

interface DateSelection {
    year: number
    month: number
}

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1]
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function Page() {
    const [date, setDate] = useState<DateSelection>({ year: currentYear, month: currentMonth - 1 || 12 })

    return (
        <div className="flex min-h-svh flex-col p-4 sm:p-6 lg:p-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <img src="/api/logo" alt="中车" className="h-7 max-w-32 object-contain flex-shrink-0" />
                <h1 className="text-xl font-semibold tracking-tight">城轨制造中心 异常处理数据看板</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Select value={String(date.year)} onValueChange={(v) => setDate((d) => ({ ...d, year: Number(v) }))}>
                            <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {YEAR_OPTIONS.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}年
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(date.month)} onValueChange={(v) => setDate((d) => ({ ...d, month: Number(v) }))}>
                            <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTH_OPTIONS.map((m) => (
                                    <SelectItem key={m} value={String(m)}>
                                        {m}月
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <Separator className="mb-6" />

            <Tabs defaultValue="source" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="mb-6 h-auto gap-1 p-2">
                        <TabsTrigger value="monthly" className="h-auto px-3 py-1.5 text-sm">
                            月报视图
                        </TabsTrigger>
                        <TabsTrigger value="source" className="h-auto px-3 py-1.5 text-sm">
                            部门概览
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="h-auto px-3 py-1.5 text-sm">
                            个人统计
                        </TabsTrigger>
                        <TabsTrigger value="assembly" className="h-auto px-3 py-1.5 text-sm">
                            总成车间
                        </TabsTrigger>
                        <TabsTrigger value="delivery" className="h-auto px-3 py-1.5 text-sm">
                            交车车间
                        </TabsTrigger>
                        <TabsTrigger value="project" className="h-auto px-3 py-1.5 text-sm">
                            项目管理
                        </TabsTrigger>
                        <TabsTrigger value="process" className="h-auto px-3 py-1.5 text-sm">
                            工艺质量
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="h-auto px-3 py-1.5 text-sm">
                            原始数据
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="monthly">
                    <RawDataTable params={date} />
                </TabsContent>
                <TabsContent value="source">
                    <DepartmentOverview params={date} />
                </TabsContent>
                <TabsContent value="personal">
                    <PersonalStats params={date} />
                </TabsContent>
                <TabsContent value="assembly">
                    <GroupStats department="总成组装" params={date} />
                </TabsContent>
                <TabsContent value="delivery">
                    <GroupStats department="调试交付" params={date} />
                </TabsContent>
                <TabsContent value="project">
                    <GroupStats department="项目管理" params={date} />
                </TabsContent>
                <TabsContent value="process">
                    <GroupStats department="工艺技术" params={date} />
                </TabsContent>
                <TabsContent value="raw">
                    <RawDataTable params={date} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
