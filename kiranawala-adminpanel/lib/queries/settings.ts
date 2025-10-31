import { supabase } from "@/lib/supabase/client"
import type { StoreSettings, StaffMember } from "@/types"

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getStoreId(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from("store_admins")
    .select("store_id")
    .eq("user_id", user.id)
    .single()

  return admin?.store_id || null
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return null

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single()

    if (error) throw error
    return data as StoreSettings
  } catch (error) {
    console.error("Error fetching store settings:", error)
    return null
  }
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings | null> {
  try {
    const storeId = await getStoreId()
    if (!storeId) throw new Error("Store not found")

    const { data, error } = await supabase
      .from("stores")
      .update(updates)
      .eq("id", storeId)
      .select()
      .single()

    if (error) throw error
    return data as StoreSettings
  } catch (error) {
    console.error("Error updating store settings:", error)
    throw error
  }
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  try {
    const storeId = await getStoreId()
    if (!storeId) return []

    const { data, error } = await supabase
      .from("store_admins")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data || []) as StaffMember[]
  } catch (error) {
    console.error("Error fetching staff members:", error)
    return []
  }
}

export async function getCurrentAdmin() {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("store_admins")
      .select(`
        *,
        store:stores(*)
      `)
      .eq("user_id", user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching current admin:", error)
    return null
  }
}

export async function addStaffMember(staff: {
  phone_number: string
  full_name: string
  role: "manager" | "staff"
}): Promise<StaffMember | null> {
  try {
    const storeId = await getStoreId()
    if (!storeId) throw new Error("Store not found")

    // In a real app, this would create a user account first
    // For now, we'll just create the store_admin record
    const { data, error } = await supabase
      .from("store_admins")
      .insert({
        ...staff,
        store_id: storeId,
        user_id: "", // This would come from user creation
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data as StaffMember
  } catch (error) {
    console.error("Error adding staff member:", error)
    throw error
  }
}

export async function updateStaffMember(
  staffId: string,
  updates: Partial<StaffMember>
): Promise<StaffMember | null> {
  try {
    const { data, error } = await supabase
      .from("store_admins")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", staffId)
      .select()
      .single()

    if (error) throw error
    return data as StaffMember
  } catch (error) {
    console.error("Error updating staff member:", error)
    throw error
  }
}

export async function deactivateStaffMember(staffId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("store_admins")
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", staffId)

    if (error) throw error
  } catch (error) {
    console.error("Error deactivating staff member:", error)
    throw error
  }
}
