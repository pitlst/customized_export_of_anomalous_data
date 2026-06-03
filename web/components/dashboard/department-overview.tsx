import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { computeDepartmentStats, formatRate } from "@/lib/mock-data"
import type { AnomalyRecord } from "@/lib/mock-data"
import { StatsCards } from "./stats-cards"

interface DepartmentOverviewProps {
  records: AnomalyRecord[]
}

/** 部门概览 Tab：统计卡片 + 各工作中心明细表 */
export function DepartmentOverview({ records }: DepartmentOverviewProps) {
  const stats = computeDepartmentStats(records)

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工作中心</TableHead>
              <TableHead className="text-right">总数</TableHead>
              <TableHead className="text-right">响应数</TableHead>
              <TableHead className="text-right">响应及时数(2H)</TableHead>
              <TableHead className="text-right">响应率</TableHead>
              <TableHead className="text-right">响应及时率</TableHead>
              <TableHead className="text-right">处理数</TableHead>
              <TableHead className="text-right">处理及时数(24H)</TableHead>
              <TableHead className="text-right">处理率</TableHead>
              <TableHead className="text-right">处理及时率</TableHead>
              <TableHead className="text-right">关闭数</TableHead>
              <TableHead className="text-right">关闭率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((row) => (
              <TableRow key={row.工作中心}>
                <TableCell className="font-medium">{row.工作中心}</TableCell>
                <TableCell className="text-right tabular-nums">{row.总数}</TableCell>
                <TableCell className="text-right tabular-nums">{row.响应数}</TableCell>
                <TableCell className="text-right tabular-nums">{row.响应及时数_总时长2H}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <RateBadge value={row.响应率} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <RateBadge value={row.响应及时率_总时长2H} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.处理数}</TableCell>
                <TableCell className="text-right tabular-nums">{row.处理及时数_总时长24H}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <RateBadge value={row.处理率} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <RateBadge value={row.处理及时率_总时长24H} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.关闭数}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <RateBadge value={row.关闭率} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/** 带颜色标记的比率 Badge */
function RateBadge({ value }: { value: number }) {
  const pct = value * 100
  const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
  return <Badge variant={variant}>{formatRate(value)}</Badge>
}
