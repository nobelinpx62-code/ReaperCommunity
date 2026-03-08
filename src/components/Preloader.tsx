"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Phase 1 -> Phase 2 (Welcome -> K-DEV)
    const timer1 = setTimeout(() => {
      setPhase(2);
    }, 2800);

    // Phase 2 -> Finished (K-DEV -> App)
    const timer2 = setTimeout(() => {
      setPhase(3);
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="phase-1"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "var(--bg-primary)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="brand-font text-gradient-red"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", textAlign: "center", padding: "0 20px" }}
            >
              BEM VINDO A REAPER COMMUNITY
            </motion.h1>
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5, duration: 1 }}
               style={{ 
                 marginTop: '30px', 
                 width: '250px', 
                 height: '2px', 
                 background: 'rgba(255,255,255,0.05)', 
                 position: 'relative', 
                 overflow: 'hidden',
                 borderRadius: '2px'
               }}
            >
               <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  style={{ 
                    width: '40%', 
                    height: '100%', 
                    background: 'var(--accent-red)', 
                    boxShadow: 'var(--glow-red)' 
                  }}
               />
            </motion.div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="phase-2"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 1.2 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.4 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "var(--bg-primary)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               style={{ textAlign: 'center' }}
            >
              <h2 className="brand-font text-gradient-purple" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", letterSpacing: "2px", marginBottom: "8px" }}>
                CRIADO PELA K-DEV
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", letterSpacing: "4px", textTransform: "uppercase" }}>
                Reaper Community
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {phase === 3 && children}
    </>
  );
}
