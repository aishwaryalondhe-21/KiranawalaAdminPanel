"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboardStats, getRecentOrders } from "@/lib/queries/dashboard"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "recent-orders", limit],
    queryFn: () => getRecentOrders(limit),
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
}
