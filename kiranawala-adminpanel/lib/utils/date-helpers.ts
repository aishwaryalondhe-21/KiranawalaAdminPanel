import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import type { DateRange } from "@/types"

export function getLast7Days(): DateRange {
  const to = endOfDay(new Date())
  const from = startOfDay(subDays(to, 6))
  return { from, to }
}

export function getLast30Days(): DateRange {
  const to = endOfDay(new Date())
  const from = startOfDay(subDays(to, 29))
  return { from, to }
}

export function getThisWeek(): DateRange {
  const now = new Date()
  return {
    from: startOfWeek(now, { weekStartsOn: 1 }),
    to: endOfWeek(now, { weekStartsOn: 1 })
  }
}

export function getThisMonth(): DateRange {
  const now = new Date()
  return {
    from: startOfMonth(now),
    to: endOfMonth(now)
  }
}

export function formatDateRange(dateRange: DateRange): string {
  return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
}

export function formatISODate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function getDaysBetween(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
