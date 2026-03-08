"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleLike(postId: string, channelId: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId
      }
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    });
  } else {
    await prisma.like.create({
      data: { postId, userId }
    });
  }

  revalidatePath(`/channel/${channelId}`);
}

export async function addComment(postId: string, channelId: string, text: string) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  if (!text.trim()) return;

  await prisma.comment.create({
    data: {
      text: text.trim(),
      postId,
      userId: session.user.id
    }
  });

  revalidatePath(`/channel/${channelId}`);
}

export async function submitRating(postId: string, channelId: string, stars: number) {
  const session = await auth() as any;
  if (!session?.user?.id) throw new Error("Não autorizado");

  if (stars < 1 || stars > 5) return;

  const userId = session.user.id;

  const existingRating = await prisma.rating.findUnique({
    where: {
      postId_userId: {
        postId,
        userId
      }
    }
  });

  if (existingRating) {
    await prisma.rating.update({
      where: { id: existingRating.id },
      data: { stars }
    });
  } else {
    await prisma.rating.create({
      data: { postId, userId, stars }
    });
  }

  revalidatePath(`/channel/${channelId}`);
}
