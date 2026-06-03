import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { computePersonalStats, formatRate } from "@/lib/mock-data"
import type { AnomalyRecord } from "@/lib/mock-data"

interface PersonalStatsProps {
  records: AnomalyRecord[]
}

/** 个人统计 Tab：按人员展示异常处理指标 */
export function PersonalStats({ records }: PersonalStatsProps) {
  const stats = computePersonalStats(records)

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>工号</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>组室</TableHead>
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
          {stats.map((row) => (
            <TableRow key={row.工号}>
              <TableCell className="font-mono text-xs">{row.工号}</TableCell>
              <TableCell className="font-medium">{row.姓名}</TableCell>
              <TableCell>{row.组室}</TableCell>
              <TableCell>{row.部门}</TableCell>
              <TableCell className="text-right tabular-nums">{row.总数}</TableCell>
              <TableCell className="text-right tabular-nums">
                <RateBadge value={row.响应率} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <RateBadge value={row.响应及时率_总时长2H} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <RateBadge value={row.处理率} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <RateBadge value={row.处理及时率_总时长24H} />
              </TableCell>
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
