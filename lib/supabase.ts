// Browser-safe re-exports
// Client components and hooks should import createClient from here
// Server components and API routes should import directly from @/lib/supabase/server

export { createClient } from '@/lib/supabase/client'
export { createServiceClient as createServerSupabase } from '@/lib/supabase/server'