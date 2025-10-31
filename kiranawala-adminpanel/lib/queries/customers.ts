import { supabase } from "@/lib/supabase/client"
import type { Customer, CustomerDetails } from "@/types"

async function getStoreId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from("store_admins")
    .select("store_id")
    .eq("user_id", user.id)
    .single()

  return admin?.store_id || null
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    // Get all orders for this store
    const { data: orders, error } = await supabase
      .from("orders")
      .select("customer_id, total_amount, created_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (error) throw error
    if (!orders || orders.length === 0) return []

    // Get unique customer IDs
    const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))]
    
    // Fetch customers separately
    const { data: customers } = await supabase
      .from("customers")
      .select("id, full_name, phone_number, email, created_at")
      .in("id", customerIds)

    if (!customers) return []

    // Aggregate customer data
    const customerMap = new Map<string, Customer>()
    
    customers.forEach(customer => {
      customerMap.set(customer.id, {
        ...customer,
        total_orders: 0,
        total_spent: 0,
        last_order_date: null
      })
    })

    orders.forEach((order) => {
      const customer = customerMap.get(order.customer_id)
      if (customer) {
        customer.total_orders = (customer.total_orders || 0) + 1
        customer.total_spent = (customer.total_spent || 0) + order.total_amount
        
        // Update last order date if this order is more recent
        if (!customer.last_order_date || order.created_at > customer.last_order_date) {
          customer.last_order_date = order.created_at
        }
      }
    })

    return Array.from(customerMap.values()).sort((a, b) => {
      const dateA = new Date(a.last_order_date || 0).getTime()
      const dateB = new Date(b.last_order_date || 0).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomerDetails(customerId: string): Promise<CustomerDetails | null> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return null

    // Get customer basic info
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()

    if (customerError) throw customerError

    // Get customer orders for this store
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (ordersError) throw ordersError

    // Get order items for these orders
    const orderIds = orders?.map(o => o.id) || []
    const { data: orderItems } = orderIds.length > 0 ? await supabase
      .from("order_items")
      .select("id, order_id, quantity, price, product_id")
      .in("order_id", orderIds) : { data: [] }

    // Get products for order items
    const productIds = [...new Set(orderItems?.map(oi => oi.product_id).filter(Boolean) || [])]
    const { data: products } = productIds.length > 0 ? await supabase
      .from("products")
      .select("id, name, image_url")
      .in("id", productIds) : { data: [] }

    const productsMap = new Map((products || []).map(p => [p.id, p]))

    // Manually join order items with products
    const ordersWithItems = orders?.map(order => ({
      ...order,
      order_items: (orderItems || [])
        .filter(oi => oi.order_id === order.id)
        .map(oi => ({
          ...oi,
          product: oi.product_id ? productsMap.get(oi.product_id) || null : null,
        })),
    })) || []

    // Calculate stats
    const totalOrders = ordersWithItems.length
    const totalSpent = ordersWithItems.reduce((sum, order) => sum + order.total_amount, 0)
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const lastOrderDate = ordersWithItems[0]?.created_at || null

    return {
      ...customer,
      orders: ordersWithItems,
      orderStats: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate
      }
    }
  } catch (error) {
    console.error("Error fetching customer details:", error)
    return null
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    // Search customers directly
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, full_name, phone_number, email, created_at")
      .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`)

    if (customersError) throw customersError
    if (!customers || customers.length === 0) return []

    const customerIds = customers.map(c => c.id)

    // Get orders for these customers at this store
    const { data: orders } = await supabase
      .from("orders")
      .select("customer_id, total_amount, created_at")
      .eq("store_id", storeId)
      .in("customer_id", customerIds)

    // Aggregate customer data
    const customerMap = new Map<string, Customer>()
    
    customers.forEach(customer => {
      customerMap.set(customer.id, {
        ...customer,
        total_orders: 0,
        total_spent: 0,
        last_order_date: null
      })
    })

    orders?.forEach((order) => {
      const customer = customerMap.get(order.customer_id)
      if (customer) {
        customer.total_orders = (customer.total_orders || 0) + 1
        customer.total_spent = (customer.total_spent || 0) + order.total_amount
        
        if (!customer.last_order_date || order.created_at > customer.last_order_date) {
          customer.last_order_date = order.created_at
        }
      }
    })

    return Array.from(customerMap.values())
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}
