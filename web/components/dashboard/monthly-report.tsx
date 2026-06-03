import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AnomalyRecord } from "@/lib/mock-data"
import { formatRate } from "@/lib/mock-data"

interface MonthlyReportProps {
    records: AnomalyRecord[]
}

/** 按部门聚合的指标 */
interface DeptSummary {
    department: string
    total: number
    responded: number
    respondedTimely: number
    processed: number
    processedTimely: number
    closed: number
}

/** 月报视图：月度 KPI 总览 + 部门对比表 */
export function MonthlyReport({ records }: MonthlyReportProps) {
    const departments = ["总成组装", "调试交付", "项目管理", "工艺技术"]

    const deptSummaries: DeptSummary[] = departments.map((dept) => {
        const rs = records.filter((r) => r.department === dept)
        return {
            department: dept,
            total: rs.length,
            responded: rs.filter((r) => new Date(r.响应日期) > new Date("2023-01-01")).length,
            respondedTimely: rs.filter((r) => r.响应是否超时 === "否").length,
            processed: rs.filter((r) => new Date(r.处理日期) > new Date("2023-01-01")).length,
            processedTimely: rs.filter((r) => r.处理是否超时 === "否").length,
            closed: rs.filter((r) => new Date(r.关闭日期) > new Date("2023-01-01")).length,
        }
    })

    const total = deptSummaries.reduce((s, d) => s + d.total, 0)
    const totalResponded = deptSummaries.reduce((s, d) => s + d.responded, 0)
    const totalRespondedTimely = deptSummaries.reduce((s, d) => s + d.respondedTimely, 0)
    const totalProcessed = deptSummaries.reduce((s, d) => s + d.processed, 0)
    const totalProcessedTimely = deptSummaries.reduce((s, d) => s + d.processedTimely, 0)
    const totalClosed = deptSummaries.reduce((s, d) => s + d.closed, 0)

    const responseRate = total > 0 ? totalResponded / total : 0
    const responseTimelyRate = total > 0 ? totalRespondedTimely / total : 0
    const processRate = total > 0 ? totalProcessed / total : 0
    const processTimelyRate = total > 0 ? totalProcessedTimely / total : 0
    const closureRate = total > 0 ? totalClosed / total : 0

    return (
        <div className="space-y-6">
            {/* 月份标题 */}
            <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 px-3 py-1.5">
                    <span className="text-sm font-semibold text-primary">2026年5月</span>
                </div>
                <span className="text-sm text-muted-foreground">异常处理月报</span>
            </div>

            <Separator />

            {/* KPI 总览卡片 */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <KpiCard label="异常总数" value={total} />
                <KpiCard label="响应率" value={formatRate(responseRate)} highlight={responseRate < 0.9} />
                <KpiCard label="响应及时率" value={formatRate(responseTimelyRate)} highlight={responseTimelyRate < 0.9} sub="(2H)" />
                <KpiCard label="处理率" value={formatRate(processRate)} highlight={processRate < 0.9} />
                <KpiCard label="处理及时率" value={formatRate(processTimelyRate)} highlight={processTimelyRate < 0.9} sub="(24H)" />
                <KpiCard label="关闭率" value={formatRate(closureRate)} highlight={closureRate < 0.9} />
            </div>

            {/* 各部门明细卡片网格 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {deptSummaries.map((d) => (
                    <Card key={d.department} size="sm">
                        <CardHeader className="pb-2">
                            <CardTitle>{deptLabel(d.department)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                <dt className="text-muted-foreground">总数</dt>
                                <dd className="text-right font-medium tabular-nums">{d.total}</dd>
                                <dt className="text-muted-foreground">响应率</dt>
                                <dd className="text-right tabular-nums">
                                    <RateBadge value={d.total > 0 ? d.responded / d.total : 0} />
                                </dd>
                                <dt className="text-muted-foreground">及时响应率</dt>
                                <dd className="text-right tabular-nums">
                                    <RateBadge value={d.total > 0 ? d.respondedTimely / d.total : 0} />
                                </dd>
                                <dt className="text-muted-foreground">处理率</dt>
                                <dd className="text-right tabular-nums">
                                    <RateBadge value={d.total > 0 ? d.processed / d.total : 0} />
                                </dd>
                                <dt className="text-muted-foreground">及时处理率</dt>
                                <dd className="text-right tabular-nums">
                                    <RateBadge value={d.total > 0 ? d.processedTimely / d.total : 0} />
                                </dd>
                                <dt className="text-muted-foreground">关闭率</dt>
                                <dd className="text-right tabular-nums">
                                    <RateBadge value={d.total > 0 ? d.closed / d.total : 0} />
                                </dd>
                            </dl>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 部门对比总表 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>部门指标对比</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>部门</TableHead>
                                <TableHead className="text-right">总数</TableHead>
                                <TableHead className="text-right">响应率</TableHead>
                                <TableHead className="text-right">响应及时率</TableHead>
                                <TableHead className="text-right">处理率</TableHead>
                                <TableHead className="text-right">处理及时率</TableHead>
                                <TableHead className="text-right">关闭率</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deptSummaries.map((d) => (
                                <TableRow key={d.department}>
                                    <TableCell className="font-medium">{deptLabel(d.department)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{d.total}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <RateBadge value={d.total > 0 ? d.responded / d.total : 0} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <RateBadge value={d.total > 0 ? d.respondedTimely / d.total : 0} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <RateBadge value={d.total > 0 ? d.processed / d.total : 0} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <RateBadge value={d.total > 0 ? d.processedTimely / d.total : 0} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <RateBadge value={d.total > 0 ? d.closed / d.total : 0} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function deptLabel(dept: string): string {
    const map: Record<string, string> = {
        总成组装: "总成车间",
        调试交付: "交车车间",
        项目管理: "项目管理板块",
        工艺技术: "工艺质量板块",
    }
    return map[dept] ?? dept
}

function KpiCard({ label, value, sub, highlight = false }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
    return (
        <Card size="sm" className={highlight ? "ring-1 ring-destructive/30" : ""}>
            <CardHeader className="pb-1">
                <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-semibold tabular-nums">{value}</div>
                {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
            </CardContent>
        </Card>
    )
}

function RateBadge({ value }: { value: number }) {
    const pct = value * 100
    const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
    return <Badge variant={variant}>{formatRate(value)}</Badge>
}
