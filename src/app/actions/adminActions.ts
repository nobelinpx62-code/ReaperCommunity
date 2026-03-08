"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

async function checkAdmin() {
  const session = await auth() as any;
  const discordId = session?.user?.discordId;
  const isAdmin = discordId && ADMIN_IDS.includes(discordId);
  if (!isAdmin) throw new Error("Acesso Negado.");
  return session;
}

export async function createCategory(name: string, iconUrl?: string) {
  await checkAdmin();
  const { error } = await supabase.from('Category').insert({ 
    name: name.trim(), 
    icon: iconUrl?.trim() || null 
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
    await checkAdmin();
    await supabase.from('Category').delete().eq('id', id);
    revalidatePath("/");
}

export async function createChannel(categoryId: string, name: string) {
    await checkAdmin();
    const { error } = await supabase.from('Channel').insert({ 
      name: name.trim().toLowerCase().replace(/\s+/g, '-'), 
      categoryId 
    });
    if (error) throw new Error(error.message);
    revalidatePath("/");
}

export async function deleteChannel(id: string) {
    await checkAdmin();
    await supabase.from('Channel').delete().eq('id', id);
    revalidatePath("/");
}

export async function createPost(data: any) {
    const session = await checkAdmin();
    const { error } = await supabase.from('Post').insert({
        ...data,
        authorId: session.user.id
    });
    if (error) throw new Error(error.message);
    revalidatePath(`/channel/${data.channelId}`);
}
