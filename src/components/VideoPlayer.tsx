"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function VideoPlayer({ src, poster }: { src: string, poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        loop
      />
      
      {/* Custom Controls Overlay */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, left: 0, right: 0, 
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: isPlaying ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}
      className="video-controls"
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = isPlaying ? '0' : '1'}
      >
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '2px', boxShadow: 'var(--glow-red)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={togglePlay} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {isPlaying ? <Pause size={24} color="var(--accent-red)" /> : <Play size={24} color="var(--accent-red)" />}
            </button>
            <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          
          <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Maximize size={24} />
          </button>
        </div>
      </div>

      {/* Play Button Overlay (Big Center) */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            background: 'rgba(138, 31, 36, 0.6)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '50%', width: '80px', height: '80px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(138, 31, 36, 0.5)',
            transition: 'all 0.3s ease'
          }}
          className="hover:scale-110"
        >
          <Play size={40} color="white" style={{ marginLeft: '5px' }} />
        </div>
      )}
    </div>
  );
}
