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

    supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single()
      .then(({ data }: { data: Round | null }) => {
        if (data) setRound(data)
        setLoading(false)
      })

    const channel = supabase
      .channel(`round:${roundId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: `id=eq.${roundId}`,
        },
        (payload: { new: Round }) => {
          setRound(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roundId])

  return { round, loading }
}
