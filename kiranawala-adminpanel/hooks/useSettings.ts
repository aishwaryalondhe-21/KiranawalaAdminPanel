import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getStoreSettings,
  updateStoreSettings,
  getStaffMembers,
  addStaffMember,
  updateStaffMember,
  deactivateStaffMember
} from "@/lib/queries/settings"
import { toast } from "sonner"

export function useStoreSettings() {
  return useQuery({
    queryKey: ["storeSettings"],
    queryFn: getStoreSettings,
    staleTime: 300000, // 5 minutes
  })
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] })
      toast.success("Store settings updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update store settings")
    }
  })
}

export function useStaffMembers() {
  return useQuery({
    queryKey: ["staffMembers"],
    queryFn: getStaffMembers,
    staleTime: 60000,
  })
}

export function useAddStaffMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: addStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffMembers"] })
      toast.success("Staff member added successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add staff member")
    }
  })
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ staffId, updates }: { staffId: string; updates: Parameters<typeof updateStaffMember>[1] }) =>
      updateStaffMember(staffId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffMembers"] })
      toast.success("Staff member updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update staff member")
    }
  })
}

export function useDeactivateStaffMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deactivateStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffMembers"] })
      toast.success("Staff member deactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate staff member")
    }
  })
}
