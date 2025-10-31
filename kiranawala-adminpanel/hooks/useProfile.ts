"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCurrentAdmin, updateAdminProfile } from "@/lib/queries/profile"
import type { StoreAdmin } from "@/types"
import { toast } from "sonner"

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ["profile", "current"],
    queryFn: getCurrentAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<StoreAdmin>) => updateAdminProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Profile updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })
}
