import { supabase } from "@/lib/supabase/client"
import type { DashboardStats } from "@/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get current admin's store_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data: admin } = await supabase
      .from("store_admins")
      .select("store_id")
      .eq("user_id", user.id)
      .single()

    if (!admin?.store_id) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
      }
    }

    // Use the dashboard_stats view for optimized query
    const { data: stats, error } = await supabase
      .from("dashboard_stats")
      .select("*")
      .eq("store_id", admin.store_id)
      .single()

    if (error) throw error

    return {
      totalOrders: stats?.total_orders || 0,
      pendingOrders: stats?.pending_orders || 0,
      completedOrders: stats?.completed_orders || 0,
      totalRevenue: parseFloat(stats?.total_revenue || "0"),
      totalCustomers: stats?.total_customers || 0,
      lowStockProducts: stats?.low_stock_products || 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      lowStockProducts: 0,
    }
  }
}

export async function getRecentOrders(limit = 5) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data: admin } = await supabase
      .from("store_admins")
      .select("store_id")
      .eq("user_id", user.id)
      .single()

    if (!admin?.store_id) return []

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", admin.store_id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    if (!orders || orders.length === 0) return []

    // Fetch customers separately
    const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))]
    const { data: customers } = customerIds.length > 0 ? await supabase
      .from("customers")
      .select("id, full_name, phone_number")
      .in("id", customerIds) : { data: [] }

    const customersMap = new Map((customers || []).map(c => [c.id, c]))

    // Manually join the data
    return orders.map(order => ({
      ...order,
      customer: order.customer_id ? customersMap.get(order.customer_id) || null : null,
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }
}
