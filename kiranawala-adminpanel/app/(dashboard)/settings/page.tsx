"use client"

import { StoreInfoForm } from "@/components/settings/store-info-form"
import { StaffManagement } from "@/components/settings/staff-management"
import { StoreHoursForm } from "@/components/settings/store-hours-form"
import { Card, CardContent } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { admin } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <SettingsIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Store Configuration</h3>
              <p className="text-sm text-blue-800 mt-1">
                Keep your store information up to date to ensure smooth operations. Changes to store status 
                will immediately affect whether new orders can be placed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <StoreInfoForm />
        {admin?.store_id && <StoreHoursForm storeId={admin.store_id} />}
        <StaffManagement />
      </div>
    </div>
  )
}
