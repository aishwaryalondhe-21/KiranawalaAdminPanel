import { supabase } from "@/lib/supabase/client"
import type { AnalyticsData, TrendDataPoint, TopProduct, CategoryBreakdown, DateRange, ReportData, ReportPeriod } from "@/types"
import { format } from "date-fns"

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

export async function getAnalyticsData(dateRange: DateRange): Promise<AnalyticsData> {
  try {
    const storeId = await getStoreId()
    if (!storeId) throw new Error("Store not found")

    const fromDate = format(dateRange.from, "yyyy-MM-dd")
    const toDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

    // Get orders in date range
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, customer_id, created_at")
      .eq("store_id", storeId)
      .gte("created_at", fromDate)
      .lte("created_at", toDate)

    if (ordersError) throw ordersError

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const uniqueCustomers = new Set(orders?.map(o => o.customer_id) || []).size
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth percentage (comparing to previous period)
    const periodLength = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    const prevFromDate = format(new Date(dateRange.from.getTime() - periodLength * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
    const prevToDate = format(new Date(dateRange.to.getTime() - periodLength * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'23:59:59")

    const { data: prevOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("store_id", storeId)
      .gte("created_at", prevFromDate)
      .lte("created_at", prevToDate)

    const prevRevenue = prevOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const growthPercentage = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    // Get top category
    const { data: categoryData } = await supabase
      .from("order_items")
      .select(`
        quantity,
        order:orders!inner(store_id, created_at),
        product:products!inner(category)
      `)
      .eq("order.store_id", storeId)
      .gte("order.created_at", fromDate)
      .lte("order.created_at", toDate)

    const categoryMap = new Map<string, number>()
    categoryData?.forEach((item: { quantity: number; product: { category: string }[] }) => {
      const category = item.product?.[0]?.category || "Unknown"
      categoryMap.set(category, (categoryMap.get(category) || 0) + item.quantity)
    })

    let topCategory = "N/A"
    let maxQuantity = 0
    categoryMap.forEach((quantity, category) => {
      if (quantity > maxQuantity) {
        maxQuantity = quantity
        topCategory = category
      }
    })

    return {
      totalOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers,
      averageOrderValue,
      growthPercentage,
      topCategory
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      growthPercentage: 0,
      topCategory: "N/A"
    }
  }
}

export async function getOrderTrends(dateRange: DateRange): Promise<TrendDataPoint[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    const fromDate = format(dateRange.from, "yyyy-MM-dd")
    const toDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

    const { data: orders, error } = await supabase
      .from("orders")
      .select("created_at")
      .eq("store_id", storeId)
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at")

    if (error) throw error

    // Group by date
    const dateMap = new Map<string, number>()
    orders?.forEach(order => {
      const date = format(new Date(order.created_at), "yyyy-MM-dd")
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    // Fill in missing dates with 0
    const trends: TrendDataPoint[] = []
    const currentDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      trends.push({
        date: dateStr,
        value: dateMap.get(dateStr) || 0,
        label: format(currentDate, "MMM d")
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  } catch (error) {
    console.error("Error fetching order trends:", error)
    return []
  }
}

export async function getRevenueTrends(dateRange: DateRange): Promise<TrendDataPoint[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    const fromDate = format(dateRange.from, "yyyy-MM-dd")
    const toDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

    const { data: orders, error } = await supabase
      .from("orders")
      .select("created_at, total_amount")
      .eq("store_id", storeId)
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at")

    if (error) throw error

    // Group by date
    const dateMap = new Map<string, number>()
    orders?.forEach(order => {
      const date = format(new Date(order.created_at), "yyyy-MM-dd")
      dateMap.set(date, (dateMap.get(date) || 0) + order.total_amount)
    })

    // Fill in missing dates with 0
    const trends: TrendDataPoint[] = []
    const currentDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      trends.push({
        date: dateStr,
        value: dateMap.get(dateStr) || 0,
        label: format(currentDate, "MMM d")
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  } catch (error) {
    console.error("Error fetching revenue trends:", error)
    return []
  }
}

export async function getTopProducts(dateRange: DateRange, limit = 5): Promise<TopProduct[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    const fromDate = format(dateRange.from, "yyyy-MM-dd")
    const toDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

    const { data, error } = await supabase
      .from("order_items")
      .select(`
        product_id,
        quantity,
        price,
        order:orders!inner(store_id, created_at),
        product:products!inner(name, category)
      `)
      .eq("order.store_id", storeId)
      .gte("order.created_at", fromDate)
      .lte("order.created_at", toDate)

    if (error) throw error

    // Aggregate by product
    const productMap = new Map<string, {
      id: string
      name: string
      category: string
      totalSales: number
      totalRevenue: number
      orderCount: number
    }>()

    data?.forEach((item: { product_id: string; quantity: number; price: number; product: { name: string; category: string }[] }) => {
      const productId = item.product_id
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: item.product?.[0]?.name || "Unknown",
          category: item.product?.[0]?.category || "Unknown",
          totalSales: 0,
          totalRevenue: 0,
          orderCount: 0
        })
      }
      const product = productMap.get(productId)!
      product.totalSales += item.quantity
      product.totalRevenue += item.quantity * item.price
      product.orderCount += 1
    })

    // Sort by total revenue and take top N
    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching top products:", error)
    return []
  }
}

export async function getCategoryBreakdown(dateRange: DateRange): Promise<CategoryBreakdown[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    const fromDate = format(dateRange.from, "yyyy-MM-dd")
    const toDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

    const { data, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        order:orders!inner(store_id, created_at),
        product:products!inner(category)
      `)
      .eq("order.store_id", storeId)
      .gte("order.created_at", fromDate)
      .lte("order.created_at", toDate)

    if (error) throw error

    // Aggregate by category
    const categoryMap = new Map<string, {
      totalSales: number
      totalRevenue: number
      orderCount: number
    }>()

    data?.forEach((item: { quantity: number; price: number; product: { category: string }[] }) => {
      const category = item.product?.[0]?.category || "Unknown"
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          totalSales: 0,
          totalRevenue: 0,
          orderCount: 0
        })
      }
      const cat = categoryMap.get(category)!
      cat.totalSales += item.quantity
      cat.totalRevenue += item.quantity * item.price
      cat.orderCount += 1
    })

    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.totalRevenue, 0)

    // Convert to array and add percentage
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalSales: data.totalSales,
        totalRevenue: data.totalRevenue,
        orderCount: data.orderCount,
        percentage: totalRevenue > 0 ? (data.totalRevenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  } catch (error) {
    console.error("Error fetching category breakdown:", error)
    return []
  }
}

export async function getReportData(period: ReportPeriod): Promise<ReportData> {
  try {
    let dateRange: DateRange
    const now = new Date()

    switch (period) {
      case "daily":
        dateRange = {
          from: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
          to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        }
        break
      case "weekly":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        dateRange = { from: weekStart, to: now }
        break
      case "monthly":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        dateRange = { from: monthStart, to: now }
        break
    }

    const [analytics, topProducts, categoryBreakdown, orderTrends, revenueTrends] = await Promise.all([
      getAnalyticsData(dateRange),
      getTopProducts(dateRange, 10),
      getCategoryBreakdown(dateRange),
      getOrderTrends(dateRange),
      getRevenueTrends(dateRange)
    ])

    return {
      period,
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
      summary: {
        totalOrders: analytics.totalOrders,
        totalRevenue: analytics.totalRevenue,
        totalCustomers: analytics.totalCustomers,
        averageOrderValue: analytics.averageOrderValue
      },
      topProducts,
      categoryBreakdown,
      orderTrends,
      revenueTrends
    }
  } catch (error) {
    console.error("Error generating report data:", error)
    throw error
  }
}
