import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ANOMALY_RECORDS } from "@/lib/mock-data"
import { DepartmentOverview } from "@/components/dashboard/department-overview"
import { PersonalStats } from "@/components/dashboard/personal-stats"
import { GroupStats } from "@/components/dashboard/group-stats"
import { RawDataTable } from "@/components/dashboard/raw-data-table"

const tabs = [
  { id: "source", label: "部门概览", component: DepartmentOverview },
  { id: "personal", label: "个人统计", component: PersonalStats },
  { id: "assembly", label: "总成车间", component: (props: { records: typeof ANOMALY_RECORDS }) => <GroupStats {...props} department="总成组装" /> },
  { id: "delivery", label: "交车车间", component: (props: { records: typeof ANOMALY_RECORDS }) => <GroupStats {...props} department="调试交付" /> },
  { id: "project", label: "项目管理", component: (props: { records: typeof ANOMALY_RECORDS }) => <GroupStats {...props} department="项目管理" /> },
  { id: "process", label: "工艺质量", component: (props: { records: typeof ANOMALY_RECORDS }) => <GroupStats {...props} department="工艺技术" /> },
  { id: "raw", label: "原始数据", component: RawDataTable },
]

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-base font-semibold tracking-tight">异常处理数据导出看板</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          模拟数据预览 · 共 {ANOMALY_RECORDS.length} 条异常记录
        </p>
      </header>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue="source" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-6">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <t.component records={ANOMALY_RECORDS} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
