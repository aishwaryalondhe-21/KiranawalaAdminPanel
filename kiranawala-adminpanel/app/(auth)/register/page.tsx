"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RegistrationForm } from "@/components/auth/registration-form"
import { ROUTES } from "@/lib/constants"
import { useAuth } from "@/hooks/useAuth"

export default function RegisterPage() {
  const { user } = useAuth()

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Create Your Store Account
        </CardTitle>
        <CardDescription>
          Register your store and start managing your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegistrationForm user={user} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link 
            href={ROUTES.LOGIN} 
            className="text-primary hover:underline font-medium"
          >
            Login here
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
