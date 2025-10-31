import { supabase } from '@/lib/supabase/client'

export type StoreHours = {
  id: string
  store_id: string
  day_of_week: number // 0 = Sunday, 6 = Saturday
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export type StoreHoursInput = Omit<StoreHours, 'id' | 'store_id'>

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export async function getStoreHours(storeId: string): Promise<StoreHours[]> {
  const { data, error } = await supabase
    .from('store_hours')
    .select('*')
    .eq('store_id', storeId)
    .order('day_of_week')

  if (error) throw error

  // If no hours exist, create default hours
  if (!data || data.length === 0) {
    const defaultHours: StoreHoursInput[] = Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      open_time: '09:00',
      close_time: '21:00',
      is_closed: false,
    }))

    const { data: created, error: createError } = await supabase
      .from('store_hours')
      .insert(
        defaultHours.map((h) => ({
          ...h,
          store_id: storeId,
        }))
      )
      .select()

    if (createError) throw createError
    return created
  }

  return data
}

export async function updateStoreHours(
  storeId: string,
  hours: StoreHoursInput[]
): Promise<void> {
  // Delete existing hours
  await supabase.from('store_hours').delete().eq('store_id', storeId)

  // Insert new hours
  const { error } = await supabase.from('store_hours').insert(
    hours.map((h) => ({
      ...h,
      store_id: storeId,
    }))
  )

  if (error) throw error
}

export function getDayName(dayOfWeek: number): string {
  return DAYS_OF_WEEK[dayOfWeek] || 'Unknown'
}
