"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStatusHistory,
} from "@/lib/queries/orders"
import type { OrderStatus } from "@/types"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

interface OrderFilters {
  status?: OrderStatus
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
}

export function useOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
    refetchOnWindowFocus: true,
  })

  // Subscribe to real-time order updates
  useEffect(() => {
    const getStoreId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: admin } = await supabase
        .from("store_admins")
        .select("store_id")
        .eq("user_id", user.id)
        .single()

      return admin?.store_id
    }

    const setupSubscription = async () => {
      const storeId = await getStoreId()
      if (!storeId) return

      const channel = supabase
        .channel("orders-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `store_id=eq.${storeId}`,
          },
          (payload) => {
            console.log("Order change detected:", payload)
            
            // Refetch orders to get updated data
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })

            // Show toast notification for new orders
            if (payload.eventType === "INSERT") {
              toast.success("New order received!", {
                description: `Order #${payload.new.order_number}`,
              })
            } else if (payload.eventType === "UPDATE") {
              toast.info("Order updated", {
                description: `Order #${payload.new.order_number}`,
              })
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [queryClient])

  return query
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  })
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  })
}

export function useOrderStatusHistory(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId, "history"],
    queryFn: () => getOrderStatusHistory(orderId),
    enabled: !!orderId,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Order status updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order status")
    },
  })
}
