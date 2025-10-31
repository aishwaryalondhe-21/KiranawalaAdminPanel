export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface Order {
  id: string
  order_number: string
  customer_id: string
  store_id: string
  status: OrderStatus
  total_amount: number
  delivery_address: string
  created_at: string
  updated_at: string
  customer?: Customer
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category: string
  store_id: string
  stock_quantity: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
}

export interface Customer {
  id: string
  full_name: string
  phone_number: string
  email?: string
  created_at: string
  total_orders?: number
  total_spent?: number
  last_order_date?: string
}

export interface Store {
  id: string
  name: string
  owner_id: string
  address: string
  phone_number: string
  is_active: boolean
  created_at: string
}

export interface StoreAdmin {
  id: string
  user_id: string
  phone_number: string
  full_name: string
  store_id: string
  role: "owner" | "manager" | "staff"
  is_active: boolean
  created_at: string
  updated_at: string
  store?: Store
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalCustomers: number
  lowStockProducts: number
}

export interface DateRange {
  from: Date
  to: Date
}

export interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
  growthPercentage: number
  topCategory: string
}

export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

export interface TopProduct {
  id: string
  name: string
  category: string
  totalSales: number
  totalRevenue: number
  orderCount: number
}

export interface CategoryBreakdown {
  category: string
  totalSales: number
  totalRevenue: number
  orderCount: number
  percentage: number
}

export type ReportPeriod = "daily" | "weekly" | "monthly"

export interface ReportData {
  period: ReportPeriod
  startDate: string
  endDate: string
  summary: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    averageOrderValue: number
  }
  topProducts: TopProduct[]
  categoryBreakdown: CategoryBreakdown[]
  orderTrends: TrendDataPoint[]
  revenueTrends: TrendDataPoint[]
}

export interface CustomerDetails extends Customer {
  orders: Order[]
  orderStats: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
  }
}

export interface StaffMember {
  id: string
  user_id: string
  phone_number: string
  full_name: string
  store_id: string
  role: "owner" | "manager" | "staff"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreSettings {
  id: string
  name: string
  owner_id: string
  address: string
  phone_number: string
  is_active: boolean
  created_at: string
  business_hours?: Record<string, { open: string; close: string; closed: boolean }>
  delivery_enabled?: boolean
  min_order_amount?: number
  delivery_fee?: number
  tax_rate?: number
}
