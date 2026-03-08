"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTermsAgreement } from "@/app/actions/userActions";
import { motion } from "framer-motion";

export default function TermsGate() {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const canProceed = agreedTerms && agreedData;

  const handleAgree = async () => {
    setSaving(true);
    try {
      await saveTermsAgreement();
      window.location.href = "/"; // Revalida a sessão no servidor
    } catch (err) {
      console.error('Error saving terms agreement:', err);
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <motion.div 
        key="terms"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: '40px', maxWidth: '750px', width: '100%', margin: '0 auto' }}
      >
        <h2 className="brand-font text-gradient-purple" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          O PACTO (TERMOS DE ACESSO)
        </h2>
        
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-primary)', margin: 0, padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: 'var(--accent-purple-light)' }}>✓</span>
                <span><strong>Conta Vinculada:</strong> Login detectado.</span>
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              height: '160px', 
              overflowY: 'auto', 
              background: 'rgba(10,10,10,0.8)', 
              padding: '20px', 
              borderRadius: '8px',
              fontSize: '0.95rem',
              color: 'var(--text-muted)'
            }}>
               Este é o pacto de acesso à Reaper Community. Ao prosseguir, você concorda com as regras de conduta e sigilo dos arquivos root. Leak de conteúdo vip resultará em banimento e rastreio de IP.
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              style={{ width: '24px', height: '24px', accentColor: 'var(--accent-red)' }}
            />
            <span>Li e aceito as condições do Pacto.</span>
          </label>
        </div>

        <button 
          className="btn-primary" 
          disabled={!canProceed || saving}
          onClick={handleAgree}
          style={{ width: '100%', padding: '16px', opacity: (!canProceed || saving) ? 0.4 : 1 }}
        >
          {saving ? "FIRMANDO O PACTO..." : "ASSINAR E PROSSEGUIR"}
        </button>
      </motion.div>
    </div>
  );
}
