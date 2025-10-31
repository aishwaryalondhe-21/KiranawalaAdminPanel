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

    // Fetch orders without embedded relationships
    let query = supabase
      .from("orders")
      .select("*")
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

    const { data: orders, error } = await query

    if (error) throw error
    if (!orders || orders.length === 0) return []

    // Fetch customers separately
    const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))]
    const { data: customers } = await supabase
      .from("customers")
      .select("id, full_name, phone_number, email")
      .in("id", customerIds)

    // Fetch order items separately
    const orderIds = orders.map(o => o.id)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("id, order_id, quantity, price, product_id")
      .in("order_id", orderIds)

    // Fetch products for order items
    const productIds = [...new Set(orderItems?.map(oi => oi.product_id).filter(Boolean) || [])]
    const { data: products } = productIds.length > 0 ? await supabase
      .from("products")
      .select("id, name, image_url")
      .in("id", productIds) : { data: [] }

    // Manually join the data
    const customersMap = new Map((customers || []).map(c => [c.id, c]))
    const productsMap = new Map((products || []).map(p => [p.id, p]))
    
    const ordersWithRelations = orders.map(order => ({
      ...order,
      customer: order.customer_id ? customersMap.get(order.customer_id) || null : null,
      order_items: (orderItems || [])
        .filter(oi => oi.order_id === order.id)
        .map(oi => ({
          ...oi,
          product: oi.product_id ? productsMap.get(oi.product_id) || null : null,
        })),
    }))

    return ordersWithRelations as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Fetch order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) throw error
    if (!order) return null

    // Fetch customer
    const { data: customer } = order.customer_id ? await supabase
      .from("customers")
      .select("*")
      .eq("id", order.customer_id)
      .single() : { data: null }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)

    // Fetch products for order items
    const productIds = [...new Set(orderItems?.map(oi => oi.product_id).filter(Boolean) || [])]
    const { data: products } = productIds.length > 0 ? await supabase
      .from("products")
      .select("*")
      .in("id", productIds) : { data: [] }

    const productsMap = new Map((products || []).map(p => [p.id, p]))

    // Manually join the data
    const orderWithRelations = {
      ...order,
      customer: customer || null,
      order_items: (orderItems || []).map(oi => ({
        ...oi,
        product: oi.product_id ? productsMap.get(oi.product_id) || null : null,
      })),
    }

    return orderWithRelations as Order
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
