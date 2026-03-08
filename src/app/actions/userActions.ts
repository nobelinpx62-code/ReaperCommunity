"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveTermsAgreement() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { agreedTerms: true }
  })

  revalidatePath("/")
}

export async function saveVerifiedToken(token: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!token.startsWith("REAPER-V-") || token.length < 20) {
    throw new Error("Token inválido!")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { verifiedToken: token }
  })

  revalidatePath("/")
}
