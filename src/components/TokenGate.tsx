"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Lock, ShieldAlert, Key } from "lucide-react";
import { saveVerifiedToken } from "@/app/actions/userActions";

export default function TokenGate() {
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await saveVerifiedToken(tokenInput.trim());
    } catch (err: any) {
      setError(err.message || "Token inválido ou revogado pela The Reaper.");
      setTimeout(() => setError(""), 3000);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(138, 31, 36, 0.1)', padding: '20px', borderRadius: '50%', boxShadow: 'var(--glow-red)' }}>
            <Lock size={48} color="var(--accent-red)" />
          </div>
        </div>

        <h2 className="brand-font text-gradient-red" style={{ fontSize: '2rem', marginBottom: '16px' }}>TOKEN DE ACESSO EXIGIDO</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
          Você está logado no Discord, mas seu dispositivo ainda não validou o acesso à Reaper Community.
        </p>

        <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Key size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Cole seu Token gerado (Ex: REAPER-V-...)" 
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              disabled={loading}
              style={{ paddingLeft: '48px', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px' }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: '#ff4b4b', fontSize: '0.9rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '1.1rem', marginTop: '8px', opacity: loading ? 0.5 : 1 }}>
            {loading ? "VALIDANDO..." : "LIBERAR ACESSO"}
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Ainda não fez a verificação pesada antibot?</p>
          <Link href="/verify" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', border: '1px solid var(--accent-purple-light)', color: 'var(--text-primary)' }}>
              IR PARA O SITE DE VERIFICAÇÃO PROFISSIONAL
            </button>
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
