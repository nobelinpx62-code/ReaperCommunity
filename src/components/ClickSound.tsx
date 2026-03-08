"use client";

import { useEffect } from "react";

export default function ClickSound() {
  useEffect(() => {
    let audioCtx: AudioContext | null = null;

    const playClick = () => {
      try {
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          }

          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(500, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);
          
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + 0.05);
      } catch(e) { /* ignore web audio api issues on some browsers */ }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      if(e.button !== 0) return; // Only left clicks
      playClick();
    };

    window.addEventListener("mousedown", handleGlobalClick);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      if(audioCtx) {
          audioCtx.close().catch(() => {});
      }
    };
  }, []);

  return null;
}
