import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/types"

interface ProductFilters {
  categoryId?: string
  searchQuery?: string
  isAvailable?: boolean
  lowStock?: boolean
}

export async function getProducts(filters?: ProductFilters) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data: admin } = await supabase
      .from("store_admins")
      .select("store_id")
      .eq("user_id", user.id)
      .single()

    if (!admin?.store_id) return []

    let query = supabase
      .from("products")
      .select(`*`)
      .eq("store_id", admin.store_id)
      .order("created_at", { ascending: false })

    if (filters?.categoryId) {
      query = query.eq("category", filters.categoryId)
    }

    if (filters?.searchQuery) {
      query = query.ilike("name", `%${filters.searchQuery}%`)
    }

    if (filters?.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable)
    }

    if (filters?.lowStock) {
      query = query.lt("stock_quantity", 10)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductById(productId: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`*`)
      .eq("id", productId)
      .single()

    if (error) throw error
    return data as Product
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
