import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabase()
  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .not('phase', 'eq', 'IDLE')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json(round)
}