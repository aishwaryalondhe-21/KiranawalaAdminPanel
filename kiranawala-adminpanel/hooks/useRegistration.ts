import { useMutation } from "@tanstack/react-query"
import { completeRegistration, checkPhoneNumberExists } from "@/lib/queries/registration"
import { toast } from "sonner"

export function useCompleteRegistration() {
  return useMutation({
    mutationFn: async ({
      userId,
      phoneNumber,
      fullName,
      storeName,
      storeAddress,
      storePhone,
    }: {
      userId: string
      phoneNumber: string
      fullName: string
      storeName: string
      storeAddress: string
      storePhone: string
    }) => {
      return completeRegistration(
        userId,
        phoneNumber,
        fullName,
        storeName,
        storeAddress,
        storePhone
      )
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Registration completed successfully!")
      } else {
        toast.error(response.error || "Registration failed")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.")
    },
  })
}

export function useCheckPhoneExists() {
  return useMutation({
    mutationFn: checkPhoneNumberExists,
  })
}
