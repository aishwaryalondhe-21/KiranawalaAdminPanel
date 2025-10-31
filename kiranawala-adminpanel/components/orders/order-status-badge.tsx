import { Badge } from "@/components/ui/badge"
import { OrderStatus } from "@/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  preparing: { label: "Preparing", variant: "secondary" },
  out_for_delivery: { label: "Out for Delivery", variant: "default" },
  delivered: { label: "Delivered", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  )
}
