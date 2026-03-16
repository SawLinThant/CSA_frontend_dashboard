//import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import data from "@/app/dashboard/data.json"

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4">
      <SectionCards />
      {/* <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <ChartAreaInteractive />
        <div className="hidden @4xl/main:block" />
      </div> */}
      <div className="flex flex-col gap-4">
        <DataTable data={data} />
      </div>
    </div>
  )
}

