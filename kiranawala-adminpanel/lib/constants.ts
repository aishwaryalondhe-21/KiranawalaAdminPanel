export const APP_NAME = "Kiranawala Admin Panel"
export const APP_DESCRIPTION = "Manage your store orders and inventory"

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const

export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  out_for_delivery: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
} as const

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ORDERS: "/dashboard/orders",
  PRODUCTS: "/dashboard/products",
  CUSTOMERS: "/dashboard/customers",
  ANALYTICS: "/dashboard/analytics",
  REPORTS: "/dashboard/reports",
  SETTINGS: "/dashboard/settings",
} as const

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    SESSION: "/api/auth/session",
  },
} as const
