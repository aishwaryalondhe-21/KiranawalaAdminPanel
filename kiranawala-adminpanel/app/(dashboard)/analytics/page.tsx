"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { AnalyticsKPICards } from "@/components/analytics/analytics-kpi-cards"
import { OrderTrendsChart } from "@/components/analytics/order-trends-chart"
import { RevenueTrendsChart } from "@/components/analytics/revenue-trends-chart"
import { TopProductsChart } from "@/components/analytics/top-products-chart"
import { useAnalyticsData, useOrderTrends, useRevenueTrends, useTopProducts } from "@/hooks/useAnalytics"
import { getLast7Days, getLast30Days, getThisWeek, getThisMonth, formatDateRange } from "@/lib/utils/date-helpers"
import type { DateRange } from "@/types"
import { Calendar, RefreshCw } from "lucide-react"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange>(getLast7Days())

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useAnalyticsData(dateRange)
  const { data: orderTrends, isLoading: orderTrendsLoading, refetch: refetchOrderTrends } = useOrderTrends(dateRange)
  const { data: revenueTrends, isLoading: revenueTrendsLoading, refetch: refetchRevenueTrends } = useRevenueTrends(dateRange)
  const { data: topProducts, isLoading: topProductsLoading, refetch: refetchTopProducts } = useTopProducts(dateRange, 5)

  const handleRefresh = () => {
    refetchAnalytics()
    refetchOrderTrends()
    refetchRevenueTrends()
    refetchTopProducts()
  }

  const quickFilters = [
    { label: "Last 7 Days", getValue: getLast7Days },
    { label: "Last 30 Days", getValue: getLast30Days },
    { label: "This Week", getValue: getThisWeek },
    { label: "This Month", getValue: getThisMonth }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and reports about your store
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <DateRangePicker 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange}
            />
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(filter.getValue())}
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Showing data for: {formatDateRange(dateRange)}
          </p>
        </CardContent>
      </Card>

      <AnalyticsKPICards data={analyticsData} isLoading={analyticsLoading} />

      <div className="grid gap-4 md:grid-cols-2">
        <OrderTrendsChart data={orderTrends} isLoading={orderTrendsLoading} />
        <RevenueTrendsChart data={revenueTrends} isLoading={revenueTrendsLoading} />
      </div>

      <TopProductsChart data={topProducts} isLoading={topProductsLoading} />
    </div>
  )
}
