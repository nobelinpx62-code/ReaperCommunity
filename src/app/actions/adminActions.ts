"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// IDs Administradores CONFIRMADOS
const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

async function checkAdmin() {
  const session = await auth() as any;
  const discordId = session?.user?.discordId;
  const isIdAdmin = discordId && ADMIN_IDS.includes(discordId);
  
  if (!isIdAdmin) {
    console.error("Tentativa de ação admin negada para:", discordId);
    throw new Error("Acesso Negado: Você não é um administrador root.");
  }
  return session;
}

export async function createCategory(name: string, iconUrl?: string) {
  const session = await checkAdmin();

  const { data, error } = await supabase.from('Category').insert({ 
    id: crypto.randomUUID(),
    name: name.trim(), 
    icon: iconUrl?.trim() || null 
  }).select();
  
  if (error) {
    console.error("ERRO SUPABASE (Category):", error.message);
    throw new Error(error.message);
  }
  
  revalidatePath("/");
  return data;
}

export async function deleteCategory(id: string) {
    await checkAdmin();
    await supabase.from('Category').delete().eq('id', id);
    revalidatePath("/");
}

export async function createChannel(categoryId: string, name: string) {
    await checkAdmin();
  
    const { data, error } = await supabase.from('Channel').insert({ 
      id: crypto.randomUUID(),
      name: name.trim().toLowerCase().replace(/\s+/g, '-'), 
      categoryId 
    }).select();

    if (error) {
       console.error("ERRO SUPABASE (Channel):", error.message);
       throw new Error(error.message);
    }
    
    revalidatePath("/");
    return data;
}

export async function deleteChannel(id: string) {
    await checkAdmin();
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
    const session = await checkAdmin();
  
    const { error } = await supabase.from('Post').insert({
        id: crypto.randomUUID(),
        ...data,
        authorId: session.user.id
    });

    if (error) console.error("Error creating post:", error);
    revalidatePath(`/channel/${data.channelId}`);
}
