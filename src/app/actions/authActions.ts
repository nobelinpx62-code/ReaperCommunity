"use server"
import { signIn, signOut } from "@/auth"

export async function loginAction() {
  await signIn("discord", { redirectTo: "/" })
}

export async function logoutAction() {
  await signOut()
}
