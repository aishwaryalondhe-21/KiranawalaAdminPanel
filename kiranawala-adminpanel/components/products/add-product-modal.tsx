"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm, ProductFormValues } from "./product-form"
import { useCreateProduct } from "@/hooks/useProducts"
import { Category } from "@/types"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

export function AddProductModal({
  isOpen,
  onClose,
  categories,
}: AddProductModalProps) {
  const { mutate: createProduct, isPending } = useCreateProduct()
  const [storeId, setStoreId] = useState<string>("")

  useEffect(() => {
    const getStoreId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: admin } = await supabase
        .from("store_admins")
        .select("store_id")
        .eq("user_id", user.id)
        .single()

      if (admin?.store_id) {
        setStoreId(admin.store_id)
      }
    }

    if (isOpen) {
      getStoreId()
    }
  }, [isOpen])

  const handleSubmit = (values: ProductFormValues) => {
    if (!storeId) {
      console.error("Store ID not found")
      return
    }

    createProduct(
      {
        ...values,
        store_id: storeId,
        description: values.description || "",
        image_url: values.image_url || "",
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product in your inventory
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
