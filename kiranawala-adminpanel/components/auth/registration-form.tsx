"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase/client"
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
import { toast } from "sonner"
import { formatPhoneNumber, isValidIndianPhone } from "@/lib/utils/phone"
import { StoreSetupForm, type StoreSetupFormValues } from "./store-setup-form"
import { useCompleteRegistration } from "@/hooks/useRegistration"
import { ROUTES } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"

// Step 1: Phone & Name
const phoneInfoSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => isValidIndianPhone(val), {
      message: "Invalid Indian phone number. Must start with 6-9 and be 10 digits",
    }),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
})

// Step 2: OTP
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type PhoneInfoFormValues = z.infer<typeof phoneInfoSchema>
type OtpFormValues = z.infer<typeof otpSchema>

type RegistrationStep = "info" | "otp" | "store"

export function RegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState<RegistrationStep>("info")
  const [isLoading, setIsLoading] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [userId, setUserId] = React.useState<string | null>(null)

  const { mutate: completeRegistration, isPending: isCompleting } = useCompleteRegistration()

  const phoneInfoForm = useForm<PhoneInfoFormValues>({
    resolver: zodResolver(phoneInfoSchema),
    defaultValues: {
      phone: "",
      fullName: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Step 1: Send OTP
  async function onPhoneInfoSubmit(values: PhoneInfoFormValues) {
    setIsLoading(true)

    try {
      const formattedPhone = formatPhoneNumber(values.phone)

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) throw error

      setPhoneNumber(formattedPhone)
      setFullName(values.fullName)
      setCurrentStep("otp")
      toast.success("OTP sent to your phone!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  async function onOtpSubmit(values: OtpFormValues) {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: values.otp,
        type: "sms",
      })

      if (error) throw error

      if (data.user) {
        setUserId(data.user.id)
        setCurrentStep("store")
        toast.success("Phone verified! Now set up your store.")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Complete Registration
  function onStoreSetupSubmit(values: StoreSetupFormValues) {
    if (!userId) {
      toast.error("User ID not found. Please try again.")
      return
    }

    completeRegistration(
      {
        userId,
        phoneNumber,
        fullName,
        storeName: values.storeName,
        storeAddress: values.storeAddress,
        storePhone: formatPhoneNumber(values.storePhone),
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Registration complete! Redirecting to dashboard...")
            // Use window.location for hard navigation to ensure middleware picks up the session
            window.location.href = ROUTES.DASHBOARD
          }
        },
      }
    )
  }

  function handleResendOtp() {
    phoneInfoForm.handleSubmit(onPhoneInfoSubmit)()
  }

  function handleBackToPhone() {
    setCurrentStep("info")
    otpForm.reset()
  }

  function handleBackToOtp() {
    setCurrentStep("otp")
  }

  // Progress calculation
  const progress = currentStep === "info" ? 33 : currentStep === "otp" ? 66 : 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep === "info" ? "1" : currentStep === "otp" ? "2" : "3"} of 3</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Phone & Name */}
      {currentStep === "info" && (
        <Form {...phoneInfoForm}>
          <form onSubmit={phoneInfoForm.handleSubmit(onPhoneInfoSubmit)} className="space-y-4">
            <FormField
              control={phoneInfoForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rahul Sharma"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your full name as it should appear
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={phoneInfoForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
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
                    Enter 10-digit Indian mobile number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === "otp" && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              OTP sent to {phoneNumber}
            </div>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="123456"
                      disabled={isLoading}
                      {...field}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBackToPhone}
                disabled={isLoading}
              >
                Change Number
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Store Setup */}
      {currentStep === "store" && (
        <StoreSetupForm
          onSubmit={onStoreSetupSubmit}
          onBack={handleBackToOtp}
          isLoading={isCompleting}
        />
      )}
    </div>
  )
}
