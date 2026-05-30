'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()
let mountCount = 0

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [flashState, setFlashState] = useState<'green' | 'red' | null>(null)
  const prevBalance = useRef<number>(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // Unique channel name per mount prevents "after subscribe()" collision
    // when React strict mode double-fires the effect
    const channelName = `balance:${userId}:${++mountCount}`

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
      .then(({ data }: { data: { balance: number } | null }) => {
        if (data) {
          setBalance(data.balance ?? 0)
          prevBalance.current = data.balance ?? 0
        }
      })

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload: { new: { balance: number } }) => {
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
