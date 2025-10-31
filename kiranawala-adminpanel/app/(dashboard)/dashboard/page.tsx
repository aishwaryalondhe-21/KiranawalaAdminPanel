"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { useDashboardStats, useRecentOrders } from "@/hooks/useDashboard"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const { admin } = useAuth()
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(10)
  
  // Enable realtime order notifications
  useRealtimeOrders(admin?.store_id || null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your store management panel
        </p>
      </div>

      {statsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Failed to load dashboard statistics. Please check your database connection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          description="All time orders"
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          description="Awaiting confirmation"
          icon={TrendingUp}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          description="Unique customers"
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          description="All time revenue"
          icon={DollarSign}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.completedOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : "View all"}
            </div>
            <p className="text-xs text-muted-foreground">
              Manage your inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? "..." : stats?.lowStockProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Products below 10 units
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable 
            orders={recentOrders || []} 
            isLoading={ordersLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
