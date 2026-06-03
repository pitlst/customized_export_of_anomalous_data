import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { computeGroupStats, formatRate } from "@/lib/mock-data"
import type { AnomalyRecord } from "@/lib/mock-data"

interface GroupStatsProps {
  records: AnomalyRecord[]
  department: string
}

/** 部门组室统计 Tab：可复用于总成组装/调试交付/项目管理/工艺技术 */
export function GroupStats({ records, department }: GroupStatsProps) {
  const stats = computeGroupStats(records, department)

  if (stats.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">该部门暂无数据</p>
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>组室</TableHead>
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
            <TableRow key={row.组室}>
              <TableCell className="font-medium">{row.组室}</TableCell>
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
  )
}

function RateBadge({ value }: { value: number }) {
  const pct = value * 100
  const variant = pct >= 90 ? "default" : pct >= 70 ? "secondary" : "destructive"
  return <Badge variant={variant}>{formatRate(value)}</Badge>
}
