"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import type { Order } from "@/types"

interface RecentOrdersTableProps {
  orders: Order[]
  isLoading?: boolean
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-500"
    case "confirmed":
      return "bg-blue-500"
    case "preparing":
      return "bg-purple-500"
    case "out_for_delivery":
      return "bg-indigo-500"
    case "delivered":
      return "bg-green-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function RecentOrdersTable({ orders, isLoading }: RecentOrdersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No orders yet. Orders will appear here once customers start placing them.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.customer?.full_name || "Unknown"}</div>
                {order.customer?.phone_number && (
                  <div className="text-xs text-muted-foreground">{order.customer.phone_number}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(order.status)}>
                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(order.total_amount)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatRelativeTime(order.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
