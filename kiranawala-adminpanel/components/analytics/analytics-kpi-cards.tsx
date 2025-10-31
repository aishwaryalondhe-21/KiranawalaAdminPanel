"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { AnalyticsData } from "@/types"

interface AnalyticsKPICardsProps {
  data: AnalyticsData | undefined
  isLoading: boolean
}

export function AnalyticsKPICards({ data, isLoading }: AnalyticsKPICardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: data?.totalOrders || 0,
      icon: ShoppingCart,
      description: "Orders in period"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      description: "Revenue generated"
    },
    {
      title: "Total Customers",
      value: data?.totalCustomers || 0,
      icon: Users,
      description: "Unique customers"
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(data?.averageOrderValue || 0),
      icon: TrendingUp,
      description: "Per order average"
    },
    {
      title: "Growth",
      value: `${data?.growthPercentage ? data.growthPercentage.toFixed(1) : 0}%`,
      icon: data && data.growthPercentage >= 0 ? ArrowUp : ArrowDown,
      description: "vs previous period",
      valueColor: data && data.growthPercentage >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Top Category",
      value: data?.topCategory || "N/A",
      icon: Package,
      description: "Best performing"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className={cn("text-2xl font-bold", card.valueColor)}>
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
