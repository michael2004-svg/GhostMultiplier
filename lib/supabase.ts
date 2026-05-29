// lib/supabase.ts
import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/server'

export const supabase = createClient()
export const createServerSupabase = createServiceClient
