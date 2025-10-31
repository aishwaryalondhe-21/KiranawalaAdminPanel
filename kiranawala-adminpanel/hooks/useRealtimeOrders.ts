import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Order } from '@/types'

export function useRealtimeOrders(storeId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!storeId) return

    // Subscribe to new orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newOrder = payload.new as Order
          
          // Show notification
          toast.success('New Order Received!', {
            description: `Order #${newOrder.id.slice(0, 8)} - ₹${newOrder.total_amount}`,
            duration: 5000,
          })

          // Play notification sound (optional)
          if (typeof window !== 'undefined') {
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {
              // Ignore audio errors
            })
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          // Refresh orders when status changes
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, queryClient])
}
