import { createClient } from '@supabase/supabase-js'

// COMUNICAÇÃO PADRÃO SUPABASE (Sem prefixos Next)
const SUPABASE_URL = 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_UBDMxVfXod1V00_YIf1m7w_Y1GMdUNN'

// Instalação do Cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Função de Autenticação Direta com o Provedor Supabase
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return null
    return session
}
