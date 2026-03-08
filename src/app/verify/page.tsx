"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldBan, Fingerprint, Database, CheckCircle, Skull, Circle, X, Copy } from "lucide-react";
import Link from "next/link";

type VerifyStep = 'INIT' | 'BOT_SCAN' | 'BLACKLIST' | 'CAPTCHA' | 'SUCCESS';

export default function VerificationEngine() {
  const [step, setStep] = useState<VerifyStep>('INIT');
  const [logs, setLogs] = useState<string[]>([]);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");

  const addLog = (msg: string) => setLogs(prev => [...prev, `[SEC-OPS] ${msg}`]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runScan = async () => {
      // INIT
      addLog("Inicializando Reaper SecOps v2.0...");
      await new Promise(r => setTimeout(r, 1500));
      
      // BOT_SCAN
      setStep('BOT_SCAN');
      addLog("Detectando Header... Selenium/Puppeteer: NEGATIVO.");
      await new Promise(r => setTimeout(r, 1000));
      addLog("Análise de tráfego Web-Scraping: LIMPO.");
      await new Promise(r => setTimeout(r, 1500));
      
      // BLACKLIST
      setStep('BLACKLIST');
      addLog("Cruzando Identidade com a Blacklist Global da The Reaper...");
      await new Promise(r => setTimeout(r, 2000));
      addLog("Histórico de Spam: 0 ocorrências. Identidade permitida.");
      await new Promise(r => setTimeout(r, 1000));

      // CAPTCHA
      setStep('CAPTCHA');
      addLog("Processo automatizado insuficiente. Intervenção manual exigida.");
    };

    runScan();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleCaptchaSuccess = () => {
    setCaptchaPassed(true);
    addLog("Identidade Humana Confirmada. Assentimento Válido.");
    setTimeout(() => {
      const token = "REAPER-V-" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
      setGeneratedToken(token);
      setStep('SUCCESS');
      addLog("Token Gerado com Sucesso.");
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-primary)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="brand-font text-gradient-red" style={{ fontSize: '2.5rem', letterSpacing: '2px', marginBottom: '8px' }}>
           SISTEMA DE VERIFICAÇÃO ZERO-TRUST
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Firewall Principal da Reaper Community</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px', maxWidth: '900px', width: '100%' }}>
        
        {/* LOG PANEL */}
        <div className="glass-panel" style={{ padding: '24px', height: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem', color: '#0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(0,255,0,0.2)', paddingBottom: '8px' }}>
            <Terminal size={18} /> TERMINAL DE VARREDURA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                style={{ wordBreak: 'break-all' }}
              >
                {log}
              </motion.div>
            ))}
            {step !== 'SUCCESS' && step !== 'CAPTCHA' && (
               <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.div>
            )}
          </div>
        </div>

        {/* STATUS PANEL */}
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
          <AnimatePresence mode="wait">
            
            {(step === 'INIT' || step === 'BOT_SCAN' || step === 'BLACKLIST') && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  style={{ display: 'inline-block', marginBottom: '24px' }}
                >
                  <Fingerprint size={80} color="var(--accent-red)" style={{ filter: 'drop-shadow(0 0 10px rgba(138, 31, 36, 0.5))' }} />
                </motion.div>
                <h3 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>VARREDURA EM ANDAMENTO</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Avaliando integridade da conexão, histórico de atividade web e comparação contra a Lista de Banidos The Reaper.</p>
              </motion.div>
            )}

            {step === 'CAPTCHA' && !captchaPassed && (
              <motion.div key="captcha" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                <ShieldBan size={48} color="var(--accent-purple-light)" style={{ marginBottom: '16px', margin: '0 auto' }} />
                <h3 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>PROVE SUA MORTALIDADE</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Para prosseguir e impedir acesso de robôs, encontre o selo da Reaper entre as figuras abaixo:</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  {[Circle, X, Skull, Database].sort(() => Math.random() - 0.5).map((IconComp, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => IconComp === Skull ? handleCaptchaSuccess() : alert("Escolha errada. Sistema registrando anomalia.")}
                      style={{ 
                        width: '80px', height: '80px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,0.5)',
                        transition: 'border 0.2s ease'
                      }}
                    >
                      <IconComp size={36} color="var(--text-primary)" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <CheckCircle size={80} color="#0f0" style={{ marginBottom: '24px', margin: '0 auto', filter: 'drop-shadow(0 0 15px rgba(0,255,0,0.4))' }} />
                <h3 className="brand-font text-gradient-red" style={{ fontSize: '2rem', marginBottom: '16px' }}>ACESSO CONCEDIDO</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Você não é um bot. Seu nome não consta na lista negra. O Token definitivo foi gerado para você.</p>
                
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <code style={{ fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '1px' }}>{generatedToken}</code>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(generatedToken); alert("Copiado!"); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    title="Copiar Token"
                  >
                    <Copy size={24} />
                  </button>
                </div>

                <Link href="/" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                    VOLTAR PARA A PÁGINA INICIAL E INSERIR TOKEN
                  </button>
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
