'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()
let mountCount = 0

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [flashState, setFlashState] = useState<'green' | 'red' | null>(null)
  const prevBalance = useRef<number>(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const applyBalance = useCallback((newBalance: number) => {
    if (newBalance > prevBalance.current) setFlashState('green')
    else if (newBalance < prevBalance.current) setFlashState('red')
    setBalance(newBalance)
    prevBalance.current = newBalance
    setTimeout(() => setFlashState(null), 800)
  }, [])

  useEffect(() => {
    if (!userId) return

    const channelName = `balance:${userId}:${++mountCount}`

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Initial fetch
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

    // Realtime subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload: { new: { balance: number } }) => {
          applyBalance(payload.new.balance ?? 0)
        }
      )
      .subscribe()

    channelRef.current = channel

    // Polling fallback: every 8s re-fetch balance in case realtime misses webhook update
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
      if (data && data.balance !== prevBalance.current) {
        applyBalance(data.balance ?? 0)
      }
    }, 8000)

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [userId, applyBalance])

  return { balance, flashState }
}