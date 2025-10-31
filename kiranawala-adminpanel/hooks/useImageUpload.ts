import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadImage, deleteImage } from '@/lib/utils/storage'
import { toast } from 'sonner'

type Bucket = 'product-images' | 'store-images'

export function useImageUpload(bucket: Bucket, folder?: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await uploadImage(file, bucket, folder)
    },
    onSuccess: (data) => {
      setImageUrl(data.url)
      setImagePath(data.path)
      toast.success('Image uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (path: string) => {
      return await deleteImage(path, bucket)
    },
    onSuccess: () => {
      setImageUrl(null)
      setImagePath(null)
      toast.success('Image removed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove image')
    },
  })

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file)
  }

  const handleRemove = () => {
    if (imagePath) {
      deleteMutation.mutate(imagePath)
    }
  }

  return {
    imageUrl,
    imagePath,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleUpload,
    handleRemove,
    setImageUrl,
    setImagePath,
  }
}
