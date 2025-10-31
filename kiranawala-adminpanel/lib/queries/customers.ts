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

    // Get all customers who have placed orders at this store
    const { data, error } = await supabase
      .from("orders")
      .select(`
        customer_id,
        total_amount,
        created_at,
        customer:customers(id, full_name, phone_number, email, created_at)
      `)
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Aggregate customer data
    const customerMap = new Map<string, Customer>()
    
    data?.forEach((order: {
      customer_id: string
      total_amount: number
      created_at: string
      customer: { id: string; full_name: string; phone_number: string; email?: string; created_at: string }[]
    }) => {
      const customerId = order.customer_id
      const customer = order.customer?.[0]
      
      if (!customer) return

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customer.id,
          full_name: customer.full_name,
          phone_number: customer.phone_number,
          email: customer.email,
          created_at: customer.created_at,
          total_orders: 0,
          total_spent: 0,
          last_order_date: order.created_at
        })
      }

      const existingCustomer = customerMap.get(customerId)!
      existingCustomer.total_orders = (existingCustomer.total_orders || 0) + 1
      existingCustomer.total_spent = (existingCustomer.total_spent || 0) + order.total_amount
      
      // Update last order date if this order is more recent
      if (!existingCustomer.last_order_date || order.created_at > existingCustomer.last_order_date) {
        existingCustomer.last_order_date = order.created_at
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
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          product:products(id, name, image_url)
        )
      `)
      .eq("customer_id", customerId)
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (ordersError) throw ordersError

    // Calculate stats
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const lastOrderDate = orders?.[0]?.created_at || null

    return {
      ...customer,
      orders: orders || [],
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

    const { data, error } = await supabase
      .from("orders")
      .select(`
        customer_id,
        total_amount,
        created_at,
        customer:customers!inner(id, full_name, phone_number, email, created_at)
      `)
      .eq("store_id", storeId)
      .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`, { foreignTable: "customers" })

    if (error) throw error

    // Aggregate customer data
    const customerMap = new Map<string, Customer>()
    
    data?.forEach((order: {
      customer_id: string
      total_amount: number
      created_at: string
      customer: { id: string; full_name: string; phone_number: string; email?: string; created_at: string }[]
    }) => {
      const customerId = order.customer_id
      const customer = order.customer?.[0]
      
      if (!customer) return

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customer.id,
          full_name: customer.full_name,
          phone_number: customer.phone_number,
          email: customer.email,
          created_at: customer.created_at,
          total_orders: 0,
          total_spent: 0,
          last_order_date: order.created_at
        })
      }

      const existingCustomer = customerMap.get(customerId)!
      existingCustomer.total_orders = (existingCustomer.total_orders || 0) + 1
      existingCustomer.total_spent = (existingCustomer.total_spent || 0) + order.total_amount
    })

    return Array.from(customerMap.values())
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}
