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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ROUTES } from "@/lib/constants"
import { formatPhoneNumber, isValidIndianPhone } from "@/lib/utils/phone"

const emailLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

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

type EmailFormValues = z.infer<typeof emailLoginSchema>
type PhoneFormValues = z.infer<typeof phoneLoginSchema>
type OtpFormValues = z.infer<typeof otpSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

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

  async function onEmailSubmit(values: EmailFormValues) {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) throw error

      if (data.user) {
        toast.success("Login successful!")
        
        // Check if user has completed registration
        const { data: adminData } = await supabase
          .from("store_admins")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle()
        
        // Force a router refresh to trigger middleware
        if (adminData) {
          router.push(ROUTES.DASHBOARD)
        } else {
          router.push(ROUTES.REGISTER)
        }
        router.refresh()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
        toast.success("Login successful!")
        
        // Check if user has completed registration
        const { data: adminData } = await supabase
          .from("store_admins")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle()
        
        // Force a router refresh to trigger middleware
        if (adminData) {
          router.push(ROUTES.DASHBOARD)
        } else {
          router.push(ROUTES.REGISTER)
        }
        router.refresh()
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
          {otpSent
            ? "Enter OTP sent to your phone"
            : "Sign in to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
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
                        <p className="text-xs text-muted-foreground">
                          Use your email address and password
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            disabled={isLoading}
                            {...field}
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
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
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
            </TabsContent>
          </Tabs>
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
