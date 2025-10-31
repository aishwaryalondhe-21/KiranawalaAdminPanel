"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { getStoreHours, updateStoreHours, getDayName, StoreHoursInput } from "@/lib/queries/store-hours"

interface StoreHoursFormProps {
  storeId: string
}

export function StoreHoursForm({ storeId }: StoreHoursFormProps) {
  const queryClient = useQueryClient()
  const [hours, setHours] = useState<StoreHoursInput[]>([])

  const { data: storeHours, isLoading } = useQuery({
    queryKey: ['store-hours', storeId],
    queryFn: () => getStoreHours(storeId),
  })

  useEffect(() => {
    if (storeHours) {
      setHours(
        storeHours.map((h) => ({
          day_of_week: h.day_of_week,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed,
        }))
      )
    }
  }, [storeHours])

  const updateMutation = useMutation({
    mutationFn: () => updateStoreHours(storeId, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-hours', storeId] })
      toast.success('Store hours updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update store hours')
    },
  })

  const handleChange = (
    dayIndex: number,
    field: keyof StoreHoursInput,
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, [field]: value } : h))
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Hours</CardTitle>
        <CardDescription>
          Set your store opening and closing times for each day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hours.map((day, index) => (
            <div
              key={day.day_of_week}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="w-28 font-medium">{getDayName(day.day_of_week)}</div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={!day.is_closed}
                  onCheckedChange={(checked) =>
                    handleChange(index, 'is_closed', !checked)
                  }
                />
                <span className="text-sm text-gray-600">
                  {day.is_closed ? 'Closed' : 'Open'}
                </span>
              </div>

              {!day.is_closed && (
                <>
                  <Input
                    type="time"
                    value={day.open_time || ''}
                    onChange={(e) =>
                      handleChange(index, 'open_time', e.target.value)
                    }
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={day.close_time || ''}
                    onChange={(e) =>
                      handleChange(index, 'close_time', e.target.value)
                    }
                    className="w-32"
                  />
                </>
              )}
            </div>
          ))}

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Store Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
