"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from "next/cache"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

async function getAuth() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Não autorizado");
  
  const discordId = session.user.user_metadata?.provider_id || session.user.id
  const isIdAdmin = ADMIN_IDS.includes(discordId)
  
  return { supabase, session, discordId, isIdAdmin };
}

export async function saveTermsAgreement() {
  try {
    const { supabase, session } = await getAuth();

    // Primeiro tentamos atualizar
    const { error: updateError } = await supabase
        .from('User')
        .update({ agreed_terms: true })
        .eq('discord_id', session.user.user_metadata?.provider_id || session.user.id);

    if (updateError) throw updateError;

    revalidatePath('/');
  } catch (e: any) {
    console.error('Terms error:', e.message);
    throw new Error('Falha ao salvar pacto');
  }
}

export async function saveVerifiedToken(token: string) {
  try {
    const { supabase, session } = await getAuth();

    if (!token.startsWith("REAPER-V-") || token.length < 20) {
      throw new Error("Token inválido!")
    }

    const { error } = await supabase
      .from('User')
      .update({ verified_token: token })
      .eq('discord_id', session.user.user_metadata?.provider_id || session.user.id);

    if (error) throw error;

    revalidatePath('/');
  } catch (e: any) {
    console.error('Token error:', e.message);
    throw new Error(e.message || 'Falha ao salvar token');
  }
}
