'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Round } from '@/types/round'

export function useRound(roundId?: string | null) {
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roundId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Fetch initial round state
    supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single()
      .then(({ data }) => {
        if (data) setRound(data as Round)
        setLoading(false)
      })

    // Subscribe to phase changes on this round
    const channel = supabase
      .channel(`round:${roundId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: `id=eq.${roundId}`,
        },
        (payload) => {
          setRound(payload.new as Round)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roundId])

  return { round, loading }
}