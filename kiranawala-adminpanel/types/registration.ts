export type RegistrationStep = "phone" | "otp" | "store"

export interface RegistrationFormData {
  // Step 1: Phone & Personal Info
  phone: string
  fullName: string
  
  // Step 2: OTP (handled separately)
  otp?: string
  
  // Step 3: Store Setup
  storeName: string
  storeAddress: string
  storePhone: string
}

export interface StoreSetupData {
  name: string
  address: string
  contact: string // Maps to stores.contact column
  latitude?: number
  longitude?: number
  is_open?: boolean // Maps to stores.is_open column (default: true)
}

export interface AdminSetupData {
  user_id: string
  phone_number: string
  full_name: string
  store_id: string
  role: "owner"
  is_active: boolean
}

export interface RegistrationState {
  currentStep: RegistrationStep
  formData: Partial<RegistrationFormData>
  userId: string | null
  storeId: string | null
  isLoading: boolean
  error: string | null
}

export interface RegistrationResponse {
  success: boolean
  storeId?: string
  adminId?: string
  error?: string
}
