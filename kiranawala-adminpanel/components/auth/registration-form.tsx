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
import { User } from "@supabase/supabase-js"

// Step 0: Choose Auth Method
const methodSchema = z.object({
  method: z.enum(["email", "phone"]),
})

// Step 1: Email & Name
const emailInfoSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

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

type MethodFormValues = z.infer<typeof methodSchema>
type EmailInfoFormValues = z.infer<typeof emailInfoSchema>
type PhoneInfoFormValues = z.infer<typeof phoneInfoSchema>
type OtpFormValues = z.infer<typeof otpSchema>

type RegistrationStep = "method" | "info" | "otp" | "store"
type AuthMethod = "email" | "phone"

export function RegistrationForm({ user }: { user: User | null }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState<RegistrationStep>("method")
  const [authMethod, setAuthMethod] = React.useState<AuthMethod>("email")
  const [isLoading, setIsLoading] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [userId, setUserId] = React.useState<string | null>(null)

  const { mutate: completeRegistration, isPending: isCompleting } = useCompleteRegistration()

  React.useEffect(() => {
    if (user) {
      setUserId(user.id)
      setEmail(user.email || "")
      setPhoneNumber(user.phone || "")
      setCurrentStep("store")
    }
  }, [user])

  const methodForm = useForm<MethodFormValues>({
    resolver: zodResolver(methodSchema),
    defaultValues: {
      method: "email",
    },
  })

  const emailInfoForm = useForm<EmailInfoFormValues>({
    resolver: zodResolver(emailInfoSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
    },
  })

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

  // Step 1: Method selection
  function onMethodSelect(values: MethodFormValues) {
    setAuthMethod(values.method)
    if (values.method === "email") {
      setCurrentStep("info")
      setCurrentStep("store") // Skip OTP for email
    } else {
      setCurrentStep("info")
    }
  }

  // Step 2: Email registration (direct signup)
  async function onEmailInfoSubmit(values: EmailInfoFormValues) {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (error) throw error

      if (data.user) {
        setUserId(data.user.id)
        setEmail(values.email)
        setFullName(values.fullName)
        setCurrentStep("store")
        toast.success("Account created! Now set up your store.")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Send OTP
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
        phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : undefined,
        email: email || undefined,
        fullName,
        storeName: values.storeName,
        storeAddress: values.storeAddress,
        storePhone: formatPhoneNumber(values.storePhone),
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Registration complete!")
            
            // Navigate to dashboard after successful registration
            router.push(ROUTES.DASHBOARD)
            router.refresh()
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
  const progress = currentStep === "method" ? 25 : currentStep === "info" ? 50 : currentStep === "otp" ? 75 : 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep === "method" ? "1" : currentStep === "info" ? "2" : currentStep === "otp" ? "3" : "4"} of 4</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Choose Auth Method */}
      {currentStep === "method" && (
        <Form {...methodForm}>
          <form onSubmit={methodForm.handleSubmit(onMethodSelect)} className="space-y-4">
            <FormField
              control={methodForm.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Authentication Method</FormLabel>
                  <FormControl>
                    <div className="grid gap-3">
                      <div
                        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          field.value === "email" ? "border-primary bg-primary/5" : "hover:bg-muted"
                        }`}
                        onClick={() => field.onChange("email")}
                      >
                        <input
                          type="radio"
                          checked={field.value === "email"}
                          onChange={() => field.onChange("email")}
                          className="h-4 w-4 text-primary"
                        />
                        <div>
                          <div className="font-medium">Email & Password</div>
                          <div className="text-sm text-muted-foreground">
                            Recommended for development and testing
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          field.value === "phone" ? "border-primary bg-primary/5" : "hover:bg-muted"
                        }`}
                        onClick={() => field.onChange("phone")}
                      >
                        <input
                          type="radio"
                          checked={field.value === "phone"}
                          onChange={() => field.onChange("phone")}
                          className="h-4 w-4 text-primary"
                        />
                        <div>
                          <div className="font-medium">Phone Number & OTP</div>
                          <div className="text-sm text-muted-foreground">
                            SMS-based authentication
                          </div>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: Email & Name */}
      {currentStep === "info" && authMethod === "email" && (
        <Form {...emailInfoForm}>
          <form onSubmit={emailInfoForm.handleSubmit(onEmailInfoSubmit)} className="space-y-4">
            <FormField
              control={emailInfoForm.control}
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
              control={emailInfoForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be used for login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={emailInfoForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter a secure password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 6 characters
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
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: Phone & Name */}
      {currentStep === "info" && authMethod === "phone" && (
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