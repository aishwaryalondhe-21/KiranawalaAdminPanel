"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { StoreAdmin } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<StoreAdmin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch current session and admin data
    const fetchAuthData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch admin data with store info
        const { data: adminData } = await supabase
          .from("store_admins")
          .select(`
            *,
            store:stores(*)
          `)
          .eq("user_id", session.user.id)
          .single()

        setAdmin(adminData as StoreAdmin || null)
      } else {
        setAdmin(null)
      }

      setLoading(false)
    }

    fetchAuthData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(true)
      if (session?.user) {
        // Re-fetch admin data on auth change
        supabase
          .from("store_admins")
          .select(`
            *,
            store:stores(*)
          `)
          .eq("user_id", session.user.id)
          .single()
          .then(({ data: adminData }) => {
            setAdmin(adminData as StoreAdmin || null)
            setLoading(false)
          })
      } else {
        setAdmin(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, admin, loading }
}
