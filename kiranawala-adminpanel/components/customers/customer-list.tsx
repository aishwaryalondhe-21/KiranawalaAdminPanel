"use client"

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
import { Eye, Phone, Mail } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Customer } from "@/types"

interface CustomerListProps {
  customers: Customer[]
  isLoading: boolean
  onViewDetails: (customer: Customer) => void
}

export function CustomerList({ customers, isLoading, onViewDetails }: CustomerListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No customers found</h3>
        <p className="text-sm text-muted-foreground">
          Customers will appear here once they place orders
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Total Orders</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Last Order</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.full_name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {customer.phone_number}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{customer.total_orders || 0}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(customer.total_spent || 0)}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {customer.last_order_date ? formatDate(customer.last_order_date) : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(customer)}
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
  )
}
