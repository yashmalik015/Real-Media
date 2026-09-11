import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PUBLIC_SERVICES } from '../../data/siteData.js';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle } from './CinematicTypography.jsx';
import { Video, Globe, Smartphone, BarChart, Palette, PenTool, Gamepad2, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HolographicServices({ onPickService }) {
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.holo-card',
        { y: 30, opacity: 0.8 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: '#services-grid',
            start: 'top 90%',
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
            sub="Select any capability module below to view pricing plans and get started instantly."
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
              onClick={() => { playClickSound(); if (onPickService) onPickService(svc.title); }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>VIEW PLANS</span>
                  <span style={{ color: '#ff2d55', fontWeight: 700, fontSize: '1.2rem', transition: 'transform 0.3s ease' }}>
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
