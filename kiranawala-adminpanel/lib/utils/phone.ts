/**
 * Display phone number in a user-friendly format
 * Converts +919876543210 to +91 98765 43210
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone) return ""
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")
  
  // Check if it's an Indian number starting with +91
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    // Format: +91 XXXXX XXXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`
  }
  
  // Return as is for other formats
  return cleaned
}

/**
 * Format phone number to E.164 standard (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")
  
  // If starts with 91, add +
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`
  }
  
  // If 10 digits, add +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }
  
  // If 11 digits starting with 0, remove 0 and add +91
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+91${cleaned.slice(1)}`
  }
  
  return phone
}

/**
 * Validate Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  
  // Check if it's 10 digits and starts with 6-9
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return true
  }
  
  // Check if it's 12 digits starting with 91 followed by 6-9
  if (cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned)) {
    return true
  }
  
  return false
}
