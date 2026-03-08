"use client"

import { supabase } from "@/lib/supabase"
import { Shield, Sparkles } from "lucide-react"

export default function LoginGate() {
  const handleLogin = async () => {
    // LOGIN DIRETO PELO SUPABASE (Sem NextAuth)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin // Volta para a home após o login
      }
    })

    if (error) console.error("Erro no login:", error.message)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-10 text-center animate-scale-up border-glow">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-accent-purple/20 border border-accent-purple/50 animate-pulse-slow">
            <Shield size={64} className="text-accent-purple-light" />
          </div>
        </div>
        
        <h1 className="brand-font text-3xl mb-4 tracking-tighter text-gradient-purple">
          REAPER COMMUNITY
        </h1>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          Para acessar o servidor root de arquivos e ferramentas exclusivas, 
          identifique-se com sua conta root.
        </p>

        <button 
          onClick={handleLogin}
          className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg font-bold group"
        >
          <Sparkles className="group-hover:rotate-12 transition-transform" />
          ENTRAR COM DISCORD
        </button>

        <p className="mt-8 text-xs text-text-muted uppercase tracking-widest">
            Acesso Restrito & Criptografado
        </p>
      </div>
    </div>
  )
}
