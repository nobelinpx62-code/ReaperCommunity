"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

async function checkAdmin() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error("Não autenticado");
  
  const discordId = session.user.user_metadata?.provider_id || session.user.id
  const isAdmin = ADMIN_IDS.includes(discordId)
  
  if (!isAdmin) throw new Error("Acesso Negado: Apenas Root Admin");
  return { supabase, session, discordId };
}

export async function promoteToStaff(searchTerm: string) {
  try {
    const { supabase } = await checkAdmin();
    const query = searchTerm.trim();

    // Busca usuário no Supabase por discord_id ou email
    const { data: user, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .or(`discord_id.eq.${query},email.eq.${query}`)
      .maybeSingle();

    if (!user) return { error: "Usuário não encontrado!" };

    const { error: updateError } = await supabase
      .from('User')
      .update({ role: "STAFF" })
      .eq('id', user.id);

    if (updateError) throw updateError;

    revalidatePath("/");
    return { success: true, userName: user.name };
  } catch (e: any) {
    console.error("Promote error:", e.message);
    return { error: e.message };
  }
}

export async function demoteToUser(userId: string) {
  try {
    const { supabase } = await checkAdmin();
    await supabase.from('User').update({ role: "USER" }).eq('id', userId);
    revalidatePath("/");
  } catch (e: any) {
    console.error("Demote error:", e.message);
  }
}

export async function generateToken() {
  try {
    await checkAdmin();
    const rand = crypto.randomBytes(6).toString("hex").toUpperCase();
    return `REAPER-V-${rand}`;
  } catch (e: any) {
    console.error("Token gen error:", e.message);
    throw e;
  }
}
