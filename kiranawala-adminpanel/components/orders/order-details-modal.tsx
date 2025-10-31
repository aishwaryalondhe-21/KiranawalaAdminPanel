"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Order, OrderStatus } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderStatusTimeline } from "./order-status-timeline"
import { MapPin, Phone, User, Package, Calendar } from "lucide-react"
import { useState } from "react"
import { displayPhoneNumber } from "@/lib/utils/phone"
import Image from "next/image"

interface StatusHistoryItem {
  id: string
  from_status: string | null
  to_status: string
  created_at: string
  notes?: string
  changed_by?: {
    full_name: string
  }
}

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: string, status: OrderStatus) => void
  statusHistory?: StatusHistoryItem[]
  isLoadingHistory?: boolean
  isUpdatingStatus?: boolean
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  statusHistory = [],
  isLoadingHistory = false,
  isUpdatingStatus = false,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(order?.status || "")

  if (!order) return null

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== order.status) {
      onStatusUpdate(order.id, selectedStatus)
    }
  }

  const canUpdateStatus = selectedStatus && selectedStatus !== order.status

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Order Information</span>
                  <OrderStatusBadge status={order.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Placed:</span>
                  <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.customer?.full_name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer?.phone_number ? displayPhoneNumber(order.customer.phone_number) : "N/A"}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="flex-1">{order.delivery_address || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.product?.image_url && (
                          <div className="h-12 w-12 rounded border overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items</p>
                  )}
                  
                  {order.order_items && order.order_items.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Update Status */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Update Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={!canUpdateStatus || isUpdatingStatus}
                    className="w-full"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update Status"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div>
            <OrderStatusTimeline history={statusHistory} isLoading={isLoadingHistory} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
