"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const ADMIN_IDS = ["1313535117792378891", "1144048134109003816"];

export async function createCategory(name: string, iconUrl?: string) {
  const session = await auth() as any;
  if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");

  await prisma.category.create({
    data: { name, icon: iconUrl || null }
  });
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await prisma.category.delete({ where: { id } });
    revalidatePath("/");
}

export async function createChannel(categoryId: string, name: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await prisma.channel.create({
      data: { name, categoryId }
    });
    revalidatePath("/");
}

export async function deleteChannel(id: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await prisma.channel.delete({ where: { id } });
    revalidatePath("/");
}

export async function createPost(data: {
    channelId: string,
    title: string,
    content: string,
    banner?: string,
    video?: string,
    ownerName?: string,
    externalLink?: string,
    fileUrl?: string,
    imageSize?: string,
    isSpoiler?: boolean
}) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await prisma.post.create({
      data: {
        ...data,
        authorId: session.user.id // Keep Prisma CUID here as mapping to the DB relationship
      }
    });
    revalidatePath(`/channel/${data.channelId}`);
}

export async function deletePost(id: string, channelId: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await prisma.post.delete({ where: { id } });
    revalidatePath(`/channel/${channelId}`);
}
