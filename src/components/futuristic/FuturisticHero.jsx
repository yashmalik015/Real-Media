import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { COMPANY_NAME, LOGO_URL } from '../../data/siteData.js';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedHeroTitle, AnimatedParagraph, AnimatedButtonText, AnimatedCounter } from './CinematicTypography.jsx';

export function FuturisticHero({ onStartProject, onExploreServices, onLearningClick }) {
  const containerRef = useRef(null);
  const coreCanvasRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Mouse perspective movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * -20;
      setTilt({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D HUD Core Canvas Effect
  useEffect(() => {
    const canvas = coreCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Glass Ring Particles
    const particles = [];
    const num = 120;
    for (let i = 0; i < num; i++) {
      particles.push({
        angle: (i / num) * Math.PI * 2,
        radius: 120 + Math.random() * 60,
        speed: 0.005 + Math.random() * 0.008,
        size: Math.random() * 2.5 + 1,
        z: Math.random() * 200 - 100
      });
    }

    let animId;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotation += 0.008;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw glowing central orb
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 140);
      orbGrad.addColorStop(0, 'rgba(255, 45, 85, 0.4)');
      orbGrad.addColorStop(0.5, 'rgba(255, 45, 85, 0.1)');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
      ctx.fill();

      // Render rotating 3D particle torus ring
      particles.forEach((p) => {
        p.angle += p.speed;
        const currentAngle = p.angle + rotation;

        const x3d = Math.cos(currentAngle) * p.radius;
        const y3d = Math.sin(currentAngle) * p.radius * 0.4;
        const z3d = Math.sin(currentAngle) * 50;

        const scale = (z3d + 200) / 200;
        const px = centerX + x3d;
        const py = centerY + y3d;

        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = z3d > 0 ? '#ff2d55' : 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = z3d > 0 ? 12 : 0;
        ctx.shadowColor = '#ff2d55';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // CTA Exploding Red Particle Effect
  const triggerParticleExplosion = (e) => {
    playClickSound();
    const rect = e.target.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x, y },
      colors: ['#ff2d55', '#ffffff', '#c81e42', '#ff6b8b'],
      disableForReducedMotion: true
    });

    if (onStartProject) onStartProject();
  };

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 70px)',
        display: 'grid',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '100px 32px 60px',
        perspective: 1200
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 0.9fr',
          gap: 60,
          alignItems: 'center',
          transform: `rotateY(${tilt.x * 0.3}deg) rotateX(${tilt.y * 0.3}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      >
        {/* Left Headline & Action Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* OS Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 45, 85, 0.12)',
              border: '1px solid rgba(255, 45, 85, 0.4)',
              color: '#ff2d55',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              letterSpacing: '0.18em',
              marginBottom: 20
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ff2d55',
                boxShadow: '0 0 10px #ff2d55'
              }}
            />
            SYSTEM STATUS: 2045 HYPER-ENGINE ONLINE
          </div>

          {/* 3D Character Assembly Hero Title */}
          <AnimatedHeroTitle text="WE ENGINEER THE DIGITAL FUTURE" />

          {/* Animated Paragraph */}
          <AnimatedParagraph
            style={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              maxWidth: 620,
              marginBottom: 40
            }}
            delay={250}
          >
            Assets Weber builds high-end web applications, mobile software, 3D experiences, VFX content, and AI automation systems designed for industry leaders who demand perfection.
          </AnimatedParagraph>

          {/* Magnetic Action Buttons with Animated Hover Text */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            <button
              ref={ctaBtnRef}
              onClick={triggerParticleExplosion}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: '18px 38px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 0 50px rgba(255, 45, 85, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                transition: 'transform 0.2s, boxShadow 0.2s',
                overflow: 'hidden'
              }}
            >
              <AnimatedButtonText label="LAUNCH PROJECT NOW" />
            </button>

            <button
              onClick={() => {
                playClickSound();
                onExploreServices();
              }}
              onMouseEnter={playHoverSound}
              style={{
                padding: '17px 32px',
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.25s ease'
              }}
            >
              <AnimatedButtonText label="Explore Capabilities →" />
            </button>
          </div>

          {/* Odometer Animated Counters */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginTop: 48,
              padding: 20,
              backgroundColor: 'rgba(12, 12, 16, 0.7)',
              border: '1px solid rgba(255, 45, 85, 0.25)',
              borderRadius: 20,
              backdropFilter: 'blur(20px)'
            }}
          >
            <AnimatedCounter value={150} suffix="+" label="PROJECTS DELIVERED" />
            <AnimatedCounter value="99.8%" label="SATISFACTION RATE" />
            <AnimatedCounter value="60 FPS" label="CORE BENCHMARK" />
          </div>
        </div>

        {/* Right 3D Interactive HUD Module */}
        <div style={{ position: 'relative', height: 480, display: 'grid', placeItems: 'center' }}>
          <canvas
            ref={coreCanvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          />

          {/* Floating 3D Hologram Card */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              width: '85%',
              padding: 32,
              backgroundColor: 'rgba(15, 15, 20, 0.85)',
              border: '1px solid rgba(255, 45, 85, 0.45)',
              borderRadius: 28,
              backdropFilter: 'blur(30px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 50px rgba(255, 45, 85, 0.2)',
              transform: 'translateZ(40px)',
              animation: 'levitate 5s ease-in-out infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <div>
                  <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff2d55', margin: 0, letterSpacing: '0.1em' }}>
                    ASSETS WEBER FUI OS
                  </h4>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>CORE PLATFORM MATRIX</span>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#ff2d55', fontFamily: 'monospace', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255, 45, 85, 0.3)' }}>
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>High-Velocity Development</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Next.js, Vite, WebGL & Cloud Native backends.</div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>Cinematic Content & VFX</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>High-impact commercial video editing and 3D graphics.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @media (max-width: 900px) {
          section { padding-top: 80px !important; }
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
