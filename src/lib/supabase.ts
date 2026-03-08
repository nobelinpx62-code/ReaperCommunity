import { createClient } from '@supabase/supabase-js'

// Prioridade 1: Service Role (Poder Total) -> Salva na Vercel
// Prioridade 2: Publishable/Anon (Limite RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                    'sb_publishable_UBDMxVfXod1V00_YIf1m7w_Y1GMdUNN'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
