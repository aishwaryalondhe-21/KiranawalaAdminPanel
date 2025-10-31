"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react"
import { useReportData } from "@/hooks/useAnalytics"
import { exportReportToPDF, exportReportToCSV } from "@/lib/utils/export"
import type { ReportPeriod } from "@/types"

export function ReportGenerator() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<ReportPeriod>("daily")
  const { data: reportData, isLoading } = useReportData(selectedPeriod)
  const [isExporting, setIsExporting] = React.useState(false)

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as ReportPeriod)
  }

  const handleExportPDF = async () => {
    if (!reportData) return
    setIsExporting(true)
    try {
      exportReportToPDF(reportData, "Kiranawala Store")
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    if (!reportData) return
    setIsExporting(true)
    try {
      exportReportToCSV(reportData, "Kiranawala Store")
    } catch (error) {
      console.error("Error exporting to CSV:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Select a period and generate detailed reports with export options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Daily Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive report for today&apos;s activities including all orders, revenue, and product performance.
              </p>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-medium">{reportData?.summary.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">₹{(reportData?.summary.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Weekly Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete weekly summary from Sunday to today, including trends and top performers.
              </p>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">This Week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-medium">{reportData?.summary.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">₹{(reportData?.summary.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Monthly Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full month report from the 1st to today, with detailed breakdowns and insights.
              </p>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">This Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-medium">{reportData?.summary.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">₹{(reportData?.summary.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleExportPDF} 
            disabled={isLoading || !reportData || isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button 
            onClick={handleExportCSV}
            disabled={isLoading || !reportData || isExporting}
            variant="outline"
            className="flex-1"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
