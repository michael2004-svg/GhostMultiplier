'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'

type UserRow = { balance: number }

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [flashState, setFlashState] = useState<'green' | 'red' | null>(null)
  const prevBalance = useRef<number>(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Remove any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()
      .then(({ data }: { data: UserRow | null }) => {
        if (data) {
          setBalance(data.balance ?? 0)
          prevBalance.current = data.balance ?? 0
        }
      })

    const channel = supabase
      .channel(`balance:${userId}`)
      .on<UserRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload: RealtimePostgresUpdatePayload<UserRow>) => {
          const newBalance = payload.new.balance ?? 0
          if (newBalance > prevBalance.current) setFlashState('green')
          else if (newBalance < prevBalance.current) setFlashState('red')
          setBalance(newBalance)
          prevBalance.current = newBalance
          setTimeout(() => setFlashState(null), 600)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [userId])

  return { balance, flashState }
}
