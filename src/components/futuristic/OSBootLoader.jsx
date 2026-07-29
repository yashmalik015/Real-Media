import React, { useEffect, useRef, useState } from 'react';
import { LOGO_URL, COMPANY_NAME } from '../../data/siteData.js';
import { playBootSound } from '../../utils/audio.js';

export function OSBootLoader({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING ASSETS WEBER OS v2045.7...');
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Play boot audio
    playBootSound();

    // Particle assembly canvas setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numParticles = 180;
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 350 + 150;
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        targetX: centerX + (Math.random() - 0.5) * 120,
        targetY: centerY + (Math.random() - 0.5) * 120,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.05 + 0.02,
        color: Math.random() > 0.3 ? '#ff2d55' : '#ffffff',
        alpha: Math.random() * 0.8 + 0.2
      });
    }

    let animId;
    let scanY = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(2, 2, 2, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw digital laser scanline
      scanY = (scanY + 4) % canvas.height;
      ctx.strokeStyle = 'rgba(255, 45, 85, 0.35)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff2d55';
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Render & assemble logo particles
      particles.forEach((p) => {
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Percentage counter step
    const steps = [
      { p: 15, msg: 'LOADING CORE GRAPHICS ENGINE...' },
      { p: 38, msg: 'SYNCHRONIZING SCENIC LIGHTING & SHADERS...' },
      { p: 64, msg: 'CONNECTING 2045 FUI HUD MATRIX...' },
      { p: 89, msg: 'INITIALIZING HIGH-PRECISION AUDIO SYNTHESIS...' },
      { p: 100, msg: 'SYSTEM ONLINE // ASSETS WEBER OPERATING SYSTEM READY' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setPercent(steps[currentStep].p);
        setStatusText(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
        }, 500);
      }
    }, 450);

    return () => {
      clearInterval(interval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#020202',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDone ? 0 : 1,
        transform: isDone ? 'scale(1.08)' : 'scale(1)',
        filter: isDone ? 'blur(10px)' : 'none',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease',
        pointerEvents: isDone ? 'none' : 'all',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Cyber Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 45, 85, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 45, 85, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          opacity: 0.4
        }}
      />

      {/* Center OS Assembly Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '40px 50px',
          background: 'rgba(12, 12, 16, 0.8)',
          border: '1px solid rgba(255, 45, 85, 0.4)',
          borderRadius: 24,
          backdropFilter: 'blur(30px)',
          boxShadow: '0 0 60px rgba(255, 45, 85, 0.25), inset 0 0 30px rgba(255, 45, 85, 0.1)',
          maxWidth: 520,
          width: '90%'
        }}
      >
        {/* Telemetry Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
          <span>SYS_STATUS: BOOTING</span>
          <span>FPS: 60</span>
          <span>NODE: AW-OS-2045</span>
        </div>

        {/* Animated Logo Container */}
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <img
            src={LOGO_URL}
            alt={COMPANY_NAME}
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              filter: `drop-shadow(0 0 25px rgba(255, 45, 85, ${0.4 + (percent / 100) * 0.6}))`,
              transform: `scale(${0.9 + (percent / 100) * 0.1})`,
              transition: 'transform 0.3s ease, filter 0.3s ease'
            }}
          />
          {/* Laser scanning sweep circle */}
          <div
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              border: '2px dashed rgba(255, 45, 85, 0.6)',
              animation: 'spin 6s linear infinite'
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2.4rem',
              letterSpacing: '0.25em',
              color: '#ffffff',
              margin: 0,
              textShadow: '0 0 20px rgba(255, 45, 85, 0.5)'
            }}
          >
            {COMPANY_NAME.toUpperCase()} OS
          </h1>
          <p style={{ color: '#ff2d55', fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.2em', marginTop: 4 }}>
            NEXT-GEN CREATIVE & ENGINEERING PLATFORM
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem', fontFamily: 'monospace', color: '#ff2d55' }}>
            <span>PROGRESS</span>
            <span style={{ fontWeight: 'bold' }}>{String(percent).padStart(3, '0')}%</span>
          </div>

          <div
            style={{
              width: '100%',
              height: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff2d55, #ff6b8b)',
                boxShadow: '0 0 15px #ff2d55',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.08em',
            minHeight: 20,
            textAlign: 'center'
          }}
        >
          {statusText}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
