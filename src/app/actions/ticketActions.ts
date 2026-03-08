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

export async function createTicket(reason: string) {
  try {
    const { supabase, session, discordId } = await getAuth();
    if (!reason.trim()) return;

    await supabase.from('Ticket').insert({
      user_id: session.user.id,
      discord_id: discordId,
      reason: reason.trim(),
      status: 'OPEN'
    });

    revalidatePath("/");
  } catch (e: any) {
    console.error("Ticket error:", e.message);
  }
}

export async function addTicketMessage(ticketId: string, text: string) {
  try {
    const { supabase, session, isIdAdmin } = await getAuth();
    
    const { data: ticket } = await supabase.from('Ticket').select('user_id').eq('id', ticketId).single();
    if (!ticket) return;

    // Busca Cargo Staff (opcional)
    const { data: dbUser } = await supabase.from('User').select('role').eq('id', session.user.id).maybeSingle();
    const isStaff = isIdAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

    if (!isStaff && ticket.user_id !== session.user.id) return;

    await supabase.from('TicketMessage').insert({
      ticket_id: ticketId,
      user_id: session.user.id,
      text: text.trim(),
      is_staff: isStaff
    });

    revalidatePath("/");
  } catch (e: any) {
    console.error("Message error:", e.message);
  }
}

export async function closeTicket(ticketId: string) {
  try {
    const { supabase, session, isIdAdmin } = await getAuth();

    const { data: ticket } = await supabase.from('Ticket').select('user_id').eq('id', ticketId).single();
    if (!ticket) return;

    const { data: dbUser } = await supabase.from('User').select('role').eq('id', session.user.id).maybeSingle();
    const isStaff = isIdAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

    if (!isStaff && ticket.user_id !== session.user.id) return;

    await supabase.from('Ticket').update({ status: "CLOSED" }).eq('id', ticketId);

    revalidatePath("/");
  } catch (e: any) {
    console.error("Close error:", e.message);
  }
}
