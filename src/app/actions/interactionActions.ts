"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from "next/cache"

async function getAuth() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Não autorizado");
  return { supabase, session };
}

export async function toggleLike(postId: string, channelId: string) {
  try {
    const { supabase, session } = await getAuth();
    const userId = session.user.id;

    const { data: existingLike } = await supabase
      .from('Like')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      await supabase.from('Like').delete().eq('id', existingLike.id);
    } else {
      await supabase.from('Like').insert({ post_id: postId, user_id: userId });
    }

    revalidatePath(`/channel/${channelId}`);
    revalidatePath("/");
  } catch (e: any) {
    console.error("Like error:", e.message);
  }
}

export async function addComment(postId: string, channelId: string, text: string) {
  try {
    const { supabase, session } = await getAuth();
    if (!text.trim()) return;

    await supabase.from('Comment').insert({
      text: text.trim(),
      post_id: postId,
      user_id: session.user.id
    });

    revalidatePath(`/channel/${channelId}`);
    revalidatePath("/");
  } catch (e: any) {
    console.error("Comment error:", e.message);
  }
}

export async function submitRating(postId: string, channelId: string, stars: number) {
  try {
    const { supabase, session } = await getAuth();
    if (stars < 1 || stars > 5) return;

    const userId = session.user.id;

    const { data: existingRating } = await supabase
      .from('Rating')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRating) {
      await supabase.from('Rating').update({ stars }).eq('id', existingRating.id);
    } else {
      await supabase.from('Rating').insert({ post_id: postId, user_id: userId, stars });
    }

    revalidatePath(`/channel/${channelId}`);
    revalidatePath("/");
  } catch (e: any) {
    console.error("Rating error:", e.message);
  }
}
