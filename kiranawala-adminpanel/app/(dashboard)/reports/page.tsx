"use client"

import * as React from "react"
import { ReportGenerator } from "@/components/reports/report-generator"
import { ReportPreview } from "@/components/reports/report-preview"
import { ReportTable } from "@/components/reports/report-table"
import { useReportData } from "@/hooks/useAnalytics"
import type { ReportPeriod } from "@/types"
import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ReportsPage() {
  const [selectedPeriod] = React.useState<ReportPeriod>("daily")
  const { data: reportData, isLoading } = useReportData(selectedPeriod)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export detailed business reports
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Report Generation</h3>
              <p className="text-sm text-blue-800 mt-1">
                Select a reporting period (Daily, Weekly, or Monthly) to generate comprehensive reports. 
                Reports include order summaries, revenue analysis, top products, and category breakdowns. 
                Export to PDF for formal reports or CSV for data analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <ReportGenerator />
        <ReportPreview data={reportData} isLoading={isLoading} />
      </div>

      <ReportTable data={reportData} isLoading={isLoading} />
    </div>
  )
}
