import { createClient } from '@supabase/supabase-js'

// Usando as chaves que você forneceu para garantir conexão direta
const supabaseUrl = 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    'sb_publishable_UBDMxVfXod1V00_YIf1m7w_Y1GMdUNN'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
