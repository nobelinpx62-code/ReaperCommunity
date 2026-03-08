"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginGate() {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const canProceed = agreedTerms && agreedData;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <motion.div 
        key="login"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', width: '100%', margin: '0 auto' }}
      >
        <motion.h2 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }} 
          transition={{ delay: 0.2, type: 'spring' }} 
          className="brand-font text-gradient-red" 
          style={{ fontSize: '3rem', marginBottom: '24px', letterSpacing: '2px' }}
        >
          ACESSO RESTRITO
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.2rem', lineHeight: '1.6' }}>
          Para acessar a área central de arquivos da <strong>Reaper Community</strong>, identifique-se com sua conta corporativa do Discord.
        </p>
        <form action={loginAction}>
          <button 
            className="btn-discord"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '18px', 
              fontSize: '1.2rem',
              boxShadow: '0 10px 30px rgba(88, 101, 242, 0.4)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(88, 101, 242, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(88, 101, 242, 0.4)';
            }}
          >
            <svg width="28" height="28" viewBox="0 0 127.14 96.36" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.59,67.59,0,0,1-10.87,5.19,77.67,77.67,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
            </svg>
            LOGIN COM DISCORD
          </button>
        </form>
      </motion.div>
    </div>
  );
}
