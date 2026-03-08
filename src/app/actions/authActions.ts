"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect("/")
}

export async function loginAction() {
  // Login de servidor geralmente redireciona para a página que inicia o OAuth no cliente
  // Ou podemos usar o signInWithOAuth aqui se configurado corretamente
  // Mas o LoginGate já faz isso no cliente.
  redirect("/")
}
