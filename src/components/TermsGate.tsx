"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { saveTermsAgreement } from "@/app/actions/userActions";
import { motion } from "framer-motion";

export default function TermsGate() {
  const { data: session, status } = useSession();
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.agreedTerms) {
      router.replace("/");
    }
  }, [session, status, router]);

  const canProceed = agreedTerms && agreedData;

  const handleAgree = async () => {
    setSaving(true);
    try {
      await saveTermsAgreement();
      // Hard refresh to ensure session cookie is updated
      window.location.href = "/";
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
                <span style={{ color: 'var(--accent-purple-light)', fontSize: '1.5rem', lineHeight: '1' }}>✓</span>
                <span style={{ lineHeight: '1.5' }}><strong>Conta Vinculada:</strong> Detectamos o seu login pelo Discord com sucesso. Mas você precisa aceitar assinar o pacto.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: 'var(--accent-red)', fontSize: '1.5rem', lineHeight: '1' }}>🔑</span>
                <span style={{ lineHeight: '1.5' }}><strong>Verificação Final:</strong> Após assinar as regras da comunidade, você precisará provar que é um alvo humano e gerar a chave de Token de Acesso.</span>
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
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              border: '1px solid rgba(255,255,255,0.02)'
            }}>
              <p style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
                Ao adentrar a <strong>Reaper Community</strong> construída através da tutela da <strong>K-DEV</strong>, você aceita de forma unânime e irrevogável que:
              </p>
              <p style={{ marginBottom: '12px' }}>
                1. <strong>Confidencialidade Absoluta:</strong> Todo o conteúdo vip compartilhado nesta plataforma — incluindo mas não limitado a Mocks, Texturas, Projetos 3D, Pacotes VSFX e afins — é de exclusividade dos membros autorizados. A distribuição não autorizada (vazamento) resultará em banimento permanente e medidas cabíveis através dos logs do Token.
              </p>
              <p style={{ marginBottom: '12px' }}>
                2. <strong>Integridade da K-DEV:</strong> A K-DEV, como desenvolvedora do sistema, garante o design, a segurança e a Hype Experience. Não nos responsabilizamos por malwares adicionados em links externos postados no servidor pela comunidade.
              </p>
              <p style={{ marginBottom: '12px' }}>
                3. <strong>Conduta no Feed:</strong> O chat e as publicações requerem hype, mas com respeito mútuo. Membros com atitudes de toxicidade vazia serão silenciados ou expurgados do sistema pela moderação.
              </p>
              <p>
                4. A sua presença na plataforma sela o pacto. Assinale as caixas abaixo para confirmar a sua submissão perante as diretrizes. Hype never dies.
              </p>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              style={{ width: '24px', height: '24px', accentColor: 'var(--accent-red)', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ color: agreedTerms ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1.05rem', userSelect: 'none', transition: 'color 0.3s ease' }}>
              Li, compreendi cada letra e concordo em assinar O Pacto da Reaper Community.
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={agreedData}
              onChange={(e) => setAgreedData(e.target.checked)}
              style={{ width: '24px', height: '24px', accentColor: 'var(--accent-red)', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ color: agreedData ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1.05rem', userSelect: 'none', transition: 'color 0.3s ease' }}>
              Confirmo que minha conta Discord é verificada e assumo os riscos da geração do Token.
            </span>
          </label>
        </div>

        <button 
          className="btn-primary" 
          disabled={!canProceed || saving}
          onClick={handleAgree}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '1.2rem',
            opacity: (!canProceed || saving) ? 0.4 : 1,
            cursor: (!canProceed || saving) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: canProceed ? 'var(--glow-red)' : 'none'
          }}
        >
          {saving ? "FIRMANDO O PACTO..." : "ASSINAR E PROSSEGUIR"}
        </button>
      </motion.div>
    </div>
  );
}
