import { useQuery } from "@tanstack/react-query"
import { getCustomers, getCustomerDetails, searchCustomers } from "@/lib/queries/customers"

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    staleTime: 60000, // 1 minute
  })
}

export function useCustomerDetails(customerId: string | null) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => customerId ? getCustomerDetails(customerId) : null,
    enabled: !!customerId,
    staleTime: 30000,
  })
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: ["customers", "search", query],
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 2,
    staleTime: 30000,
  })
}
