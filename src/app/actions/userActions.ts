import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function saveTermsAgreement() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Update the user record in Supabase
  const { error } = await supabase
    .from('User')
    .update({ agreedTerms: true })
    .eq('id', session.user.id)

  if (error) {
    console.error('Supabase update error (terms):', error)
    throw new Error('Failed to save terms agreement')
  }

  revalidatePath('/')
}

export async function saveVerifiedToken(token: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!token.startsWith("REAPER-V-") || token.length < 20) {
    throw new Error("Token inválido!")
  }

  const { error } = await supabase
    .from('User')
    .update({ verifiedToken: token })
    .eq('id', session.user.id)

  if (error) {
    console.error('Supabase update error (token):', error)
    throw new Error('Failed to save verified token')
  }

  revalidatePath('/')
}

