"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "@/lib/queries/products"
import type { Product } from "@/types"
import { toast } from "sonner"

interface ProductFilters {
  categoryId?: string
  searchQuery?: string
  isAvailable?: boolean
  lowStock?: boolean
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    refetchOnWindowFocus: true,
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: Omit<Product, "id" | "created_at" | "updated_at">) =>
      createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Product created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product")
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: Partial<Product> }) =>
      updateProduct(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Product updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product")
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast.success("Product deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product")
    },
  })
}
