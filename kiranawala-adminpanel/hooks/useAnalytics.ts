import { useQuery } from "@tanstack/react-query"
import { 
  getAnalyticsData, 
  getOrderTrends, 
  getRevenueTrends, 
  getTopProducts,
  getCategoryBreakdown,
  getReportData
} from "@/lib/queries/analytics"
import type { DateRange, ReportPeriod } from "@/types"

export function useAnalyticsData(dateRange: DateRange) {
  return useQuery({
    queryKey: ["analytics", dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => getAnalyticsData(dateRange),
    staleTime: 60000, // 1 minute
  })
}

export function useOrderTrends(dateRange: DateRange) {
  return useQuery({
    queryKey: ["orderTrends", dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => getOrderTrends(dateRange),
    staleTime: 60000,
  })
}

export function useRevenueTrends(dateRange: DateRange) {
  return useQuery({
    queryKey: ["revenueTrends", dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => getRevenueTrends(dateRange),
    staleTime: 60000,
  })
}

export function useTopProducts(dateRange: DateRange, limit = 5) {
  return useQuery({
    queryKey: ["topProducts", dateRange.from.toISOString(), dateRange.to.toISOString(), limit],
    queryFn: () => getTopProducts(dateRange, limit),
    staleTime: 60000,
  })
}

export function useCategoryBreakdown(dateRange: DateRange) {
  return useQuery({
    queryKey: ["categoryBreakdown", dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => getCategoryBreakdown(dateRange),
    staleTime: 60000,
  })
}

export function useReportData(period: ReportPeriod) {
  return useQuery({
    queryKey: ["reportData", period],
    queryFn: () => getReportData(period),
    staleTime: 30000, // 30 seconds
  })
}
