"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const ADMIN_IDS = ["1313535117792378891", "1144048134109003816"];

export async function createCategory(name: string, iconUrl?: string) {
  const session = await auth() as any;
  if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");

  const { error } = await supabase.from('Category').insert({ 
    id: crypto.randomUUID(),
    name, 
    icon: iconUrl || null 
  });
  
  if (error) console.error("Error creating category:", error);
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await supabase.from('Category').delete().eq('id', id);
    revalidatePath("/");
}

export async function createChannel(categoryId: string, name: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    const { error } = await supabase.from('Channel').insert({ 
      id: crypto.randomUUID(),
      name, 
      categoryId 
    });

    if (error) console.error("Error creating channel:", error);
    revalidatePath("/");
}

export async function deleteChannel(id: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await supabase.from('Channel').delete().eq('id', id);
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
  
    const { error } = await supabase.from('Post').insert({
        id: crypto.randomUUID(),
        ...data,
        authorId: session.user.id
    });

    if (error) console.error("Error creating post:", error);
    revalidatePath(`/channel/${data.channelId}`);
}

export async function deletePost(id: string, channelId: string) {
    const session = await auth() as any;
    if (!session?.user?.discordId || !ADMIN_IDS.includes(session.user.discordId)) throw new Error("Acesso Negado");
  
    await supabase.from('Post').delete().eq('id', id);
    revalidatePath(`/channel/${channelId}`);
}
