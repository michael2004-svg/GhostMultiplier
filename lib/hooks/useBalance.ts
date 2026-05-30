'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [flashState, setFlashState] = useState<'green' | 'red' | null>(null)
  const prevBalance = useRef<number>(0)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { balance, flashState }
}