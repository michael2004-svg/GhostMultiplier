'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Round } from '@/types/round'

export function useRound(roundId?: string | null) {
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roundId) { setLoading(false); return }

    // Fetch initial round
    supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single()
      .then(({ data }) => {
        if (data) setRound(data)
        setLoading(false)
      })

    // Subscribe to phase changes
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
        (payload) => setRound(payload.new as Round)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roundId])

  return { round, loading }
}