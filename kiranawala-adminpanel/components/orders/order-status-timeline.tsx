"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Circle } from "lucide-react"

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

interface OrderStatusTimelineProps {
  history: StatusHistoryItem[]
  isLoading?: boolean
}

export function OrderStatusTimeline({ history, isLoading }: OrderStatusTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative">
                <Circle className="h-4 w-4 fill-primary text-primary" />
                {index < history.length - 1 && (
                  <div className="absolute left-2 top-4 bottom-0 w-px bg-border -mb-4" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium capitalize">
                    {item.to_status.replace(/_/g, " ")}
                  </p>
                  {item.from_status && (
                    <span className="text-xs text-muted-foreground">
                      from {item.from_status.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  {item.changed_by && ` by ${item.changed_by.full_name}`}
                </p>
                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
