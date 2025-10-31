"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm, ProductFormValues } from "./product-form"
import { useUpdateProduct } from "@/hooks/useProducts"
import { Category, Product } from "@/types"

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  categories,
}: EditProductModalProps) {
  const { mutate: updateProduct, isPending } = useUpdateProduct()

  if (!product) return null

  const handleSubmit = (values: ProductFormValues) => {
    updateProduct(
      {
        productId: product.id,
        updates: values,
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
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
