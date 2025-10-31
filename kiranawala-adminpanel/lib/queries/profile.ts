import { supabase } from "@/lib/supabase/client"
import type { StoreAdmin } from "@/types"

export async function getCurrentAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("store_admins")
      .select(`
        *,
        store:stores(*)
      `)
      .eq("user_id", user.id)
      .single()

    if (error) throw error
    return data as StoreAdmin
  } catch (error) {
    console.error("Error fetching current admin:", error)
    throw error
  }
}

export async function getAdminByPhone(phoneNumber: string) {
  try {
    const { data, error } = await supabase
      .from("store_admins")
      .select(`
        *,
        store:stores(*)
      `)
      .eq("phone_number", phoneNumber)
      .single()

    if (error) throw error
    return data as StoreAdmin
  } catch (error) {
    console.error("Error fetching admin by phone:", error)
    throw error
  }
}

export async function updateAdminProfile(updates: Partial<StoreAdmin>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("store_admins")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating admin profile:", error)
    throw error
  }
}
