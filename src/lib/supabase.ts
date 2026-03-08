import { createClient } from '@supabase/supabase-js'

// Prioridade 1: Service Role (Poder Total) -> Deve estar na Vercel
// Prioridade 2: Publishable/Anon (Limite RLS) -> Usado se Service Role faltar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing! Communication will fail.");
}

// Configuração extra para garantir que o cliente não tenha cache chato
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
