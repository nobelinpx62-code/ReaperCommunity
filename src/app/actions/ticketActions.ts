"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export async function createTicket(reason: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  if (!reason.trim()) return;

  await prisma.ticket.create({
    data: {
      userId: session.user.id,
      reason: reason.trim()
    }
  });

  revalidatePath("/");
}

export async function addTicketMessage(ticketId: string, text: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isStaff = isDiscordAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

  if (!isStaff && ticket.userId !== session.user.id) return; // Only owner or staff

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId: session.user.id,
      text: text.trim(),
      isStaff: isStaff
    }
  });

  revalidatePath("/");
}

export async function closeTicket(ticketId: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isStaff = isDiscordAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;

  if (!isStaff && ticket.userId !== session.user.id) return;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" }
  });

  revalidatePath("/");
}
