import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AnomalyRecord } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/mock-data"

interface RawDataTableProps {
  records: AnomalyRecord[]
}

/** 原始数据 Tab：完整明细（核心列） */
export function RawDataTable({ records }: RawDataTableProps) {
  return (
    <div className="rounded-lg border">
      <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-10 bg-background">ID</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">异常类型</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">异常描述</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">项目名称</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">节车号</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">工作中心</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">状态</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">发起人</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">发起日期</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">指定响应人</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">响应人</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">响应日期</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">处理人</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">处理日期</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">关闭日期</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">响应超时</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">处理超时</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((row) => (
              <TableRow key={row.zid}>
                <TableCell className="font-mono text-xs">{row.zid}</TableCell>
                <TableCell>{row.异常类型}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={row.异常描述}>
                  {row.异常描述}
                </TableCell>
                <TableCell>{row.项目名称}</TableCell>
                <TableCell>{row.节车号}</TableCell>
                <TableCell>{row.工作中心}</TableCell>
                <TableCell>
                  <StatusBadge status={row.异常状态分类} />
                </TableCell>
                <TableCell>{row.发起人姓名}</TableCell>
                <TableCell className="font-mono text-xs">{formatDateTime(row.发起日期)}</TableCell>
                <TableCell>{row.指定响应人姓名}</TableCell>
                <TableCell>{row.响应人姓名}</TableCell>
                <TableCell className="font-mono text-xs">{formatDateTime(row.响应日期)}</TableCell>
                <TableCell>{row.处理人姓名}</TableCell>
                <TableCell className="font-mono text-xs">{formatDateTime(row.处理日期)}</TableCell>
                <TableCell className="font-mono text-xs">{formatDateTime(row.关闭日期)}</TableCell>
                <TableCell>
                  <OvertimeBadge isOvertime={row.响应是否超时 === "是"} />
                </TableCell>
                <TableCell>
                  <OvertimeBadge isOvertime={row.处理是否超时 === "是"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "已关闭" ? "secondary" : status === "处理中" ? "default" : "outline"
  return <Badge variant={variant}>{status}</Badge>
}

function OvertimeBadge({ isOvertime }: { isOvertime: boolean }) {
  return isOvertime ? (
    <Badge variant="destructive">超时</Badge>
  ) : (
    <Badge variant="outline">正常</Badge>
  )
}
