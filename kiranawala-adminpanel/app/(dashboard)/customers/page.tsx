"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CustomerList } from "@/components/customers/customer-list"
import { CustomerDetailsModal } from "@/components/customers/customer-details-modal"
import { useCustomers, useSearchCustomers } from "@/hooks/useCustomers"
import { Search, RefreshCw, Users } from "lucide-react"
import type { Customer } from "@/types"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  const { data: allCustomers, isLoading, refetch } = useCustomers()
  const { data: searchResults, isLoading: isSearching } = useSearchCustomers(searchQuery)

  const customers = searchQuery.length >= 2 ? searchResults : allCustomers

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setTimeout(() => setSelectedCustomer(null), 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer base
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{allCustomers?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                {allCustomers?.filter(c => {
                  if (!c.last_order_date) return false
                  const lastOrder = new Date(c.last_order_date)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return lastOrder >= thirtyDaysAgo
                }).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Orders per Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">
                {allCustomers && allCustomers.length > 0
                  ? (allCustomers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / allCustomers.length).toFixed(1)
                  : "0"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Search and view detailed information about your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                {isSearching ? "Searching..." : `Found ${customers?.length || 0} customer(s)`}
              </p>
            )}
          </div>

          <CustomerList
            customers={customers || []}
            isLoading={isLoading || (searchQuery.length >= 2 && isSearching)}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <CustomerDetailsModal
        customer={selectedCustomer}
        open={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  )
}
