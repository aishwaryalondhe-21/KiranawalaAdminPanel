"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders, useOrderById, useUpdateOrderStatus, useOrderStatusHistory } from "@/hooks/useOrders"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderDetailsModal } from "@/components/orders/order-details-modal"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { OrderStatus } from "@/types"
import { Eye, RefreshCw, AlertCircle } from "lucide-react"
import { displayPhoneNumber } from "@/lib/utils/phone"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const { data: orders, isLoading, error, refetch } = useOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
    searchQuery: searchQuery || undefined,
  })

  const { data: selectedOrder } = useOrderById(selectedOrderId || "")
  const { data: statusHistory, isLoading: isLoadingHistory } = useOrderStatusHistory(selectedOrderId || "")
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus()

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
  }

  const handleCloseModal = () => {
    setSelectedOrderId(null)
  }

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateStatus({ orderId, status }, {
      onSuccess: () => {
        // Modal will automatically show updated status via react-query refetch
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your customer orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Failed to load orders. Please check your connection and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders List</CardTitle>
            {!isLoading && orders && (
              <p className="text-sm text-muted-foreground">
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer?.full_name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer?.phone_number ? displayPhoneNumber(order.customer.phone_number) : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter !== "all" || searchQuery
                  ? "Try adjusting your filters"
                  : "Orders will appear here once customers place them"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal
        order={selectedOrder || null}
        isOpen={!!selectedOrderId}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
        statusHistory={statusHistory}
        isLoadingHistory={isLoadingHistory}
        isUpdatingStatus={isUpdatingStatus}
      />
    </div>
  )
}
