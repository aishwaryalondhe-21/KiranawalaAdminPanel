"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ROUTES } from "@/lib/constants"
import { formatPhoneNumber, isValidIndianPhone } from "@/lib/utils/phone"

const phoneLoginSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => isValidIndianPhone(val), {
      message: "Invalid Indian phone number. Must start with 6-9 and be 10 digits",
    }),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type PhoneFormValues = z.infer<typeof phoneLoginSchema>
type OtpFormValues = z.infer<typeof otpSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onPhoneSubmit(values: PhoneFormValues) {
    setIsLoading(true)

    try {
      const formattedPhone = formatPhoneNumber(values.phone)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) throw error

      setPhoneNumber(formattedPhone)
      setOtpSent(true)
      toast.success("OTP sent to your phone!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
        // Check if user has completed registration before redirecting
        const { data: adminData } = await supabase
          .from("store_admins")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle()

        toast.success("Login successful!")
        
        // Add small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect based on registration status
        if (adminData) {
          window.location.href = ROUTES.DASHBOARD
        } else {
          window.location.href = ROUTES.REGISTER
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  function handleResendOtp() {
    phoneForm.handleSubmit(onPhoneSubmit)()
  }

  function handleChangePhone() {
    setOtpSent(false)
    otpForm.reset()
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Kiranawala Admin
        </CardTitle>
        <CardDescription>
          {otpSent ? "Enter OTP sent to your phone" : "Sign in with your phone number"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
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
                    <p className="text-xs text-muted-foreground">
                      Enter 10-digit Indian mobile number
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        ) : (
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
                  onClick={handleChangePhone}
                  disabled={isLoading}
                >
                  Change Number
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link 
            href={ROUTES.REGISTER} 
            className="text-primary hover:underline font-medium"
          >
            Register here
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
