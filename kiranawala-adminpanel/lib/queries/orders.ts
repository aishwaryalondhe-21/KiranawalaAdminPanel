import { supabase } from "@/lib/supabase/client"
import type { Order, OrderStatus } from "@/types"

interface OrderFilters {
  status?: OrderStatus
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
}

export async function getOrders(filters?: OrderFilters) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data: admin } = await supabase
      .from("store_admins")
      .select("store_id")
      .eq("user_id", user.id)
      .single()

    if (!admin?.store_id) return []

    let query = supabase
      .from("orders")
      .select(`
        *,
        customer:customers(id, full_name, phone_number, email),
        order_items(
          id,
          quantity,
          price,
          product:products(id, name, image_url)
        )
      `)
      .eq("store_id", admin.store_id)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.searchQuery) {
      query = query.or(`order_number.ilike.%${filters.searchQuery}%`)
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq("id", orderId)
      .single()

    if (error) throw error
    return data as Order
  } catch (error) {
    console.error("Error fetching order:", error)
    throw error
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

export async function getOrderStatusHistory(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("order_status_history")
      .select(`
        *,
        changed_by:store_admins(full_name)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching order status history:", error)
    return []
  }
}
