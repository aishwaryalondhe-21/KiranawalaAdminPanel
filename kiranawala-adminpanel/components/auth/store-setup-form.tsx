"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isValidIndianPhone } from "@/lib/utils/phone"

const storeSetupSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeAddress: z.string().min(10, "Please enter a complete address"),
  storePhone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => isValidIndianPhone(val), {
      message: "Invalid Indian phone number. Must start with 6-9 and be 10 digits",
    }),
})

export type StoreSetupFormValues = z.infer<typeof storeSetupSchema>

interface StoreSetupFormProps {
  onSubmit: (values: StoreSetupFormValues) => void
  onBack: () => void
  isLoading?: boolean
  defaultValues?: Partial<StoreSetupFormValues>
}

export function StoreSetupForm({ 
  onSubmit, 
  onBack, 
  isLoading = false,
  defaultValues 
}: StoreSetupFormProps) {
  const form = useForm<StoreSetupFormValues>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: defaultValues || {
      storeName: "",
      storeAddress: "",
      storePhone: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sharma Kirana Store"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your store or business name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storeAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Shop No. 12, Main Market, Near City Mall, Mumbai - 400001"
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your complete store address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storePhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Contact Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  disabled={isLoading}
                  {...field}
                  maxLength={10}
                />
              </FormControl>
              <FormDescription>
                Store contact number for customer inquiries
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating Store..." : "Complete Registration"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
