"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from "next/cache"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

async function checkAdmin() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error("Não autenticado");
  
  const discordId = session.user.user_metadata?.provider_id || session.user.id
  const isAdmin = ADMIN_IDS.includes(discordId)
  
  if (!isAdmin) throw new Error("Acesso Negado: Você não é Root Admin");
  return { supabase, session, discordId };
}

export async function createCategoryAction(formData: FormData) {
    try {
        const { supabase } = await checkAdmin();
        const name = formData.get("name") as string;
        const icon = formData.get("icon") as string;
        if (!name) return;

        const { error } = await supabase.from('Category').insert({ 
            name: name.trim(), 
            icon: icon?.trim() || null 
        });

        if (error) throw error;
        revalidatePath("/");
    } catch (e: any) {
        console.error("Action error:", e.message);
    }
}

export async function deleteCategoryAction(id: string) {
    try {
        const { supabase } = await checkAdmin();
        await supabase.from('Category').delete().eq('id', id);
        revalidatePath("/");
    } catch (e: any) {
        console.error("Action error:", e.message);
    }
}

export async function createChannelAction(formData: FormData) {
    try {
        const { supabase } = await checkAdmin();
        const name = formData.get("name") as string;
        const categoryId = formData.get("categoryId") as string;
        if (!name || !categoryId) return;

        const { error } = await supabase.from('Channel').insert({ 
            name: name.trim().toLowerCase().replace(/\s+/g, '-'), 
            category_id: categoryId 
        });

        if (error) throw error;
        revalidatePath("/");
    } catch (e: any) {
        console.error("Action error:", e.message);
    }
}

export async function deleteChannelAction(id: string) {
    try {
        const { supabase } = await checkAdmin();
        await supabase.from('Channel').delete().eq('id', id);
        revalidatePath("/");
    } catch (e: any) {
        console.error("Action error:", e.message);
    }
}

export async function createPost(data: any) {
    try {
        const { supabase, session } = await checkAdmin();
        
        // Mapeia os campos para o novo banco (Snake Case)
        const postData = {
            channel_id: data.channelId,
            author_id: session.user.id, // ID interno do Supabase
            title: data.title,
            content: data.content,
            banner: data.banner,
            video_url: data.video,
            owner_name: data.ownerName,
            external_link: data.externalLink,
            file_url: data.fileUrl,
            image_size: data.imageSize || 'normal',
            is_spoiler: data.isSpoiler || false
        };

        const { error } = await supabase.from('Post').insert(postData);
        if (error) throw error;

        revalidatePath(`/channel/${data.channelId}`);
        revalidatePath("/");
    } catch (e: any) {
        console.error("Action error:", e.message);
        throw e;
    }
}
