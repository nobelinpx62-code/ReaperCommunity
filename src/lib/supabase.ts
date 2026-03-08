import { createClient } from '@supabase/supabase-js'

// Chaves de Comunicação Supabase (Suporte para múltiplos nomes de variáveis)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing! Communication will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

