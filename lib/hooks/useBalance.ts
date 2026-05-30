'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [flashState, setFlashState] = useState<'green' | 'red' | null>(null)
  const prevBalance = useRef<number>(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // Remove any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Fetch initial balance
    supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setBalance(data.balance ?? 0)
          prevBalance.current = data.balance ?? 0
        }
      })

    // Real-time subscription
    const channel = supabase
      .channel(`balance:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
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
