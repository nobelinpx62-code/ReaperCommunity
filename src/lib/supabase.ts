import { createClient } from '@supabase/supabase-js'

// CONFIGURAÇÃO BÁSICA E DIRETA (Conforme solicitado)
const supabaseUrl = 'https://qpuwacxpxlnzowfcyomg.supabase.co'
const supabaseKey = 'sb_publishable_UBDMxVfXod1V00_YIf1m7w_Y1GMdUNN'

export const supabase = createClient(supabaseUrl, supabaseKey)
