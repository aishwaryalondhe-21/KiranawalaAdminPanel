import { supabase } from "@/lib/supabase/client"
import type { StoreSetupData, AdminSetupData, RegistrationResponse } from "@/types/registration"

/**
 * Check if a phone number is already registered
 */
export async function checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("store_admins")
      .select("id")
      .eq("phone_number", phoneNumber)
      .maybeSingle()

    if (error) {
      console.error("Error checking phone number:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }
    return !!data
  } catch (error) {
    console.error("Error checking phone number:", error)
    throw error
  }
}

/**
 * Create a new store
 */
export async function createStore(storeData: StoreSetupData): Promise<string> {
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("You must be logged in to create a store")
    }

    const { data, error } = await supabase
      .from("stores")
      .insert({
        name: storeData.name,
        address: storeData.address,
        contact: storeData.contact,
        latitude: storeData.latitude || 0,
        longitude: storeData.longitude || 0,
        is_open: storeData.is_open ?? true,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating store:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || "Failed to create store. Please ensure you have permission.")
    }
    
    if (!data) {
      throw new Error("Failed to create store - no data returned")
    }

    return data.id
  } catch (error) {
    console.error("Error creating store:", error)
    throw error
  }
}

/**
 * Create a store admin record
 */
export async function createStoreAdmin(adminData: AdminSetupData): Promise<string> {
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("You must be logged in to create an admin record")
    }

    // Ensure user_id matches authenticated user
    if (adminData.user_id !== user.id) {
      throw new Error("You can only create an admin record for yourself")
    }

    // Prepare insert data
    const insertData: any = {
      user_id: adminData.user_id,
      full_name: adminData.full_name,
      store_id: adminData.store_id,
      role: adminData.role,
      is_active: adminData.is_active,
    }

    // Add either phone_number or email (at least one required)
    if (adminData.phone_number) {
      insertData.phone_number = adminData.phone_number
    }
    if (adminData.email) {
      insertData.email = adminData.email
    }

    const { data, error } = await supabase
      .from("store_admins")
      .insert(insertData)
      .select("id")
      .single()

    if (error) {
      console.error("Error creating store admin:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(error.message || "Failed to create admin record. Please ensure you have permission.")
    }

    if (!data) {
      throw new Error("Failed to create admin record - no data returned")
    }

    return data.id
  } catch (error) {
    console.error("Error creating store admin:", error)
    throw error
  }
}

/**
 * Complete registration: Create store and admin in a transaction-like manner
 */
export async function completeRegistration(
  userId: string,
  phoneNumber: string | undefined,
  fullName: string,
  storeName: string,
  storeAddress: string,
  storePhone: string,
  email?: string
): Promise<RegistrationResponse> {
  try {
    // Step 0: Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("You must be logged in to complete registration")
    }

    if (user.id !== userId) {
      throw new Error("Authentication mismatch. Please try logging in again.")
    }

    // Step 1: Check if phone number or email already exists
    if (phoneNumber) {
      const phoneExists = await checkPhoneNumberExists(phoneNumber)
      if (phoneExists) {
        return {
          success: false,
          error: "This phone number is already registered. Please login instead.",
        }
      }
    }

    // Step 2: Create the store
    const storeData: StoreSetupData = {
      name: storeName,
      address: storeAddress,
      contact: storePhone,
      latitude: 0, // Will be updated later when store sets location
      longitude: 0,
      is_open: true,
    }

    let storeId: string
    try {
      storeId = await createStore(storeData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create store"
      console.error("Store creation failed:", error)
      return {
        success: false,
        error: `Store creation failed: ${errorMessage}. Please check your permissions and try again.`,
      }
    }

    // Step 3: Create the admin record
    const adminData: AdminSetupData = {
      user_id: userId,
      phone_number: phoneNumber,
      email: email,
      full_name: fullName,
      store_id: storeId,
      role: "owner",
      is_active: true,
    }

    let adminId: string
    try {
      adminId = await createStoreAdmin(adminData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create admin record"
      console.error("Admin creation failed:", error)

      // Attempt to clean up the orphaned store
      try {
        await supabase.from("stores").delete().eq("id", storeId)
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned store:", cleanupError)
      }

      return {
        success: false,
        error: `Admin profile creation failed: ${errorMessage}. Please check your permissions and try again.`,
      }
    }

    return {
      success: true,
      storeId,
      adminId,
    }
  } catch (error) {
    console.error("Error completing registration:", error)

    const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again."

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Check if user has completed registration (has store_admin record)
 */
export async function checkRegistrationComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("store_admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error("Error checking registration status:", error)
    return false
  }
}
