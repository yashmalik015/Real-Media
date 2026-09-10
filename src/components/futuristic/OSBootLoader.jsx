import React, { useEffect, useRef, useState } from 'react';
import { LOGO_URL, COMPANY_NAME } from '../../data/siteData.js';
import { playBootSound } from '../../utils/audio.js';

export function OSBootLoader({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING ASSETS WEBER OS 2045...');
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only boot once per browser session
    if (sessionStorage.getItem('aw_os_booted')) {
      if (onComplete) onComplete();
      return;
    }
    sessionStorage.setItem('aw_os_booted', 'true');

    // Play boot audio
    try {
      playBootSound();
    } catch {
      // audio may be blocked before interaction
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numParticles = 40;
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 250 + 100;
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        targetX: centerX + (Math.random() - 0.5) * 80,
        targetY: centerY + (Math.random() - 0.5) * 80,
        size: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.08 + 0.04,
        color: Math.random() > 0.3 ? '#ff2d55' : '#ffffff',
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render logo particles without costly shadowBlur
      particles.forEach((p) => {
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const steps = [
      { p: 25, msg: 'LOADING HIGH-SPEED ENGINE...' },
      { p: 65, msg: 'SYNCHRONIZING GRAPHICS PIPELINE...' },
      { p: 100, msg: 'SYSTEM ONLINE // ASSETS WEBER READY' }
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
          }, 400);
        }, 300);
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  // If already booted in session, don't render overlay
  if (sessionStorage.getItem('aw_os_booted') && isDone) {
    return null;
  }

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
        transform: isDone ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
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
          backgroundImage: 'linear-gradient(rgba(255, 45, 85, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 45, 85, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          opacity: 0.3
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
          gap: 20,
          padding: '36px 44px',
          background: 'rgba(12, 12, 16, 0.9)',
          border: '1px solid rgba(255, 45, 85, 0.4)',
          borderRadius: 24,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 50px rgba(255, 45, 85, 0.2)',
          maxWidth: 480,
          width: '90%'
        }}
      >
        {/* Telemetry Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
          <span>SYS_STATUS: READY</span>
          <span>FPS: 60</span>
          <span>NODE: AW-OS-2045</span>
        </div>

        {/* Animated Logo Container */}
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <img
            src={LOGO_URL}
            alt={COMPANY_NAME}
            style={{
              width: 84,
              height: 84,
              objectFit: 'contain',
              filter: `drop-shadow(0 0 20px rgba(255, 45, 85, ${0.4 + (percent / 100) * 0.6}))`
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2.2rem',
              letterSpacing: '0.2em',
              color: '#ffffff',
              margin: 0
            }}
          >
            {COMPANY_NAME.toUpperCase()}
          </h1>
          <p style={{ color: '#ff2d55', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '0.2em', marginTop: 4 }}>
            NEXT-GEN CREATIVE & ENGINEERING LAB
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', fontFamily: 'monospace', color: '#ff2d55' }}>
            <span>LOADING</span>
            <span style={{ fontWeight: 'bold' }}>{String(percent).padStart(3, '0')}%</span>
          </div>

          <div
            style={{
              width: '100%',
              height: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff2d55, #ff6b8b)',
                boxShadow: '0 0 10px #ff2d55',
                transition: 'width 0.25s ease'
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
            minHeight: 18,
            textAlign: 'center'
          }}
        >
          {statusText}
        </div>
      </div>
    </div>
  );
}
