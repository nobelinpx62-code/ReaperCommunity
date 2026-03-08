"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export async function promoteToStaff(discordIdOrEmail: string) {
  const session = await auth() as any;
  if (!session?.user?.id) return { error: "Não autorizado" };

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  if (!isDiscordAdmin) return { error: "Apenas Owner" };

  const searchTerm = discordIdOrEmail.trim();

  let user = await prisma.user.findFirst({
    where: { 
      accounts: { some: { providerAccountId: searchTerm } } 
    }
  });

  if (!user) {
    user = await prisma.user.findFirst({ 
      where: { email: { equals: searchTerm } } 
    });
  }
  
  if (!user) {
      user = await prisma.user.findFirst({ 
        where: { name: { contains: searchTerm } } 
      });
  }

  if (!user) {
      return { error: "Usuário não encontrado!" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "STAFF" }
  });

  revalidatePath("/");
  return { success: true, userName: user.name };
}

export async function demoteToUser(userId: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  if (!isDiscordAdmin) throw new Error("Apenas Owner");

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" }
  });

  revalidatePath("/");
}

export async function generateToken() {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const isDiscordAdmin = ADMIN_IDS.includes(session.user.discordId);
  if (!isDiscordAdmin) throw new Error("Apenas Owner");

  const rand = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `REAPER-V-${rand}`;
}
