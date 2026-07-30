import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PUBLIC_SERVICES } from '../../data/siteData.js';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';
import { Video, Globe, Smartphone, BarChart, Palette, PenTool, Gamepad2, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HolographicServices({ onPickService }) {
  const [selectedService, setSelectedService] = useState(null);

  const getIcon = (title) => {
    switch (title) {
      case "Video Editing": return <Video size={36} color="#ff2d55" />;
      case "Web Development": return <Globe size={36} color="#ff2d55" />;
      case "App Development": return <Smartphone size={36} color="#ff2d55" />;
      case "Digital Marketing": return <BarChart size={36} color="#ff2d55" />;
      case "Graphic Design": return <Palette size={36} color="#ff2d55" />;
      case "UI/UX Design": return <PenTool size={36} color="#ff2d55" />;
      case "Game Development": return <Gamepad2 size={36} color="#ff2d55" />;
      case "VFX": return <Wand2 size={36} color="#ff2d55" />;
      default: return <Wand2 size={36} color="#ff2d55" />;
    }
  };

  const services = PUBLIC_SERVICES.map((s, idx) => ({
    ...s,
    id: `svc_${idx}`,
    tag: `MODULE 0${idx + 1}`,
    tech: ['WebGL', 'GPU Accelerated', 'AI Powered', 'Real-Time'][idx % 4],
    lucideIcon: getIcon(s.title)
  }));

  const handleCardClick = (service) => {
    playClickSound();
    setSelectedService(service);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.holo-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#services-grid',
            start: 'top 85%',
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        {/* Section Header with Vertical Mask Reveal */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <AnimatedSectionTitle
            label="HOLOGRAPHIC CAPABILITIES MATRIX"
            title="ENGINEERING & CREATIVE MODULES"
            sub="Select any capability module below to inspect real-time specs, scope, and instant deployment pricing."
            animationStyle="services"
          />
        </div>

        {/* Floating Holographic Cards Grid */}
        <div
          id="services-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24
          }}
        >
          {services.map((svc) => (
            <div
              key={svc.title}
              onClick={() => handleCardClick(svc)}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: 32,
                borderRadius: 24,
                backgroundColor: 'rgba(12, 12, 16, 0.75)',
                border: '1px solid rgba(255, 45, 85, 0.25)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 280
              }}
              className="holo-card"
            >
              <div className="holo-sweep" />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ filter: 'drop-shadow(0 0 15px rgba(255, 45, 85, 0.6))' }}>
                    {svc.lucideIcon}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255, 45, 85, 0.3)' }}>
                    {svc.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '2rem',
                    letterSpacing: '0.04em',
                    color: '#ffffff',
                    marginBottom: 10
                  }}
                >
                  {svc.title}
                </h3>

                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                  {svc.desc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.45)' }}>
                  {svc.tech}
                </span>
                <span style={{ color: '#ff2d55', fontWeight: 700, fontSize: '1.2rem', transition: 'transform 0.3s ease' }}>
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holographic Detail Drawer Modal */}
      {selectedService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(2, 2, 4, 0.88)',
            backdropFilter: 'blur(32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'rgba(14, 14, 20, 0.95)',
              border: '1px solid rgba(255, 45, 85, 0.5)',
              borderRadius: 32,
              padding: 40,
              boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 60px rgba(255, 45, 85, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => {
                playClickSound();
                setSelectedService(null);
              }}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span>{selectedService.lucideIcon}</span>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em' }}>
                  {selectedService.tag} // HOLOGRAPHIC SPEC
                </span>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#ffffff', margin: 0 }}>
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <AnimatedParagraph style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
              {selectedService.desc}
            </AnimatedParagraph>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
              <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ff2d55', fontFamily: 'monospace' }}>DELIVERY TIMELINE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>3 – 10 DAYS</div>
              </div>
              <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ff2d55', fontFamily: 'monospace' }}>BENCHMARK ACCELERATION</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>60 FPS ULTRA</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => {
                  playClickSound();
                  const title = selectedService.title;
                  setSelectedService(null);
                  if (onPickService) onPickService(title);
                }}
                style={{
                  flex: 1,
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  boxShadow: '0 0 30px rgba(255, 45, 85, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <AnimatedButtonText label="DEPLOY MODULE NOW 🚀" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .holo-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 45, 85, 0.65) !important;
          box-shadow: 0 30px 60px rgba(255, 45, 85, 0.25) !important;
        }
        .holo-card:hover .holo-sweep {
          left: 200%;
        }
        .holo-sweep {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 45, 85, 0.25), transparent);
          transform: skewX(-25deg);
          transition: left 0.8s ease;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
