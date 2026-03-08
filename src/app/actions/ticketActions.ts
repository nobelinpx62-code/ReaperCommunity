"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export async function createTicket(reason: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  if (!reason.trim()) return;

  const { error } = await supabase.from('Ticket').insert({
    id: crypto.randomUUID(),
    userId: session.user.id,
    reason: reason.trim(),
    status: 'OPEN'
  });

  if (error) console.error("Error creating ticket:", error);
  revalidatePath("/");
}

export async function addTicketMessage(ticketId: string, text: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const { data: ticket } = await supabase.from('Ticket').select('userId').eq('id', ticketId).single();
  if (!ticket) return;

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  const { data: dbUser } = await supabase.from('User').select('role').eq('id', session.user.id).single();
  const isStaff = isDiscordAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

  if (!isStaff && ticket.userId !== session.user.id) return;

  const { error } = await supabase.from('TicketMessage').insert({
    id: crypto.randomUUID(),
    ticketId,
    userId: session.user.id,
    text: text.trim(),
    isStaff: isStaff
  });

  if (error) console.error("Error adding message:", error);
  revalidatePath("/");
}

export async function closeTicket(ticketId: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  const { data: dbUser } = await supabase.from('User').select('role').eq('id', session.user.id).single();
  const isStaff = isDiscordAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

  const { data: ticket } = await supabase.from('Ticket').select('userId').eq('id', ticketId).single();
  if (!ticket) return;

  if (!isStaff && ticket.userId !== session.user.id) return;

  await supabase.from('Ticket').update({ status: "CLOSED" }).eq('id', ticketId);

  revalidatePath("/");
}
