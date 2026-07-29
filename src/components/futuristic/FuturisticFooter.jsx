import React from 'react';
import { LOGO_URL, COMPANY_NAME } from '../../data/siteData.js';
import { playClickSound, playHoverSound } from '../../utils/audio.js';

export function FuturisticFooter({ onNavigate }) {
  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/' },
    { name: 'YouTube', icon: '🎬', url: 'https://youtube.com/' },
    { name: 'Twitter/X', icon: '⚡', url: 'https://twitter.com/' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/' }
  ];

  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: '#020203',
        borderTop: '1px solid rgba(255, 45, 85, 0.3)',
        padding: '80px 32px 40px',
        overflow: 'hidden'
      }}
    >
      {/* Background Volumetric Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: 200,
          background: 'radial-gradient(ellipse at bottom, rgba(255, 45, 85, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr repeat(3, 1fr)',
            gap: 48,
            marginBottom: 64
          }}
        >
          {/* Company Brand Column */}
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: 20 }}
              onClick={() => onNavigate('home')}
            >
              <img
                src={LOGO_URL}
                alt={COMPANY_NAME}
                style={{
                  width: 52,
                  height: 52,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(255, 45, 85, 0.8))'
                }}
              />
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.8rem',
                  letterSpacing: '0.22em',
                  color: '#ffffff'
                }}
              >
                {COMPANY_NAME.toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 360 }}>
              Next-generation creative agency and engineering lab. Building futuristic web apps, 3D visual effects, mobile software, and AI systems.
            </p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={playHoverSound}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 45, 85, 0.3)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    transition: 'all 0.25s ease'
                  }}
                  className="social-btn"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff2d55', letterSpacing: '0.15em', marginBottom: 20 }}>
              CAPABILITIES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('services')}>Web Development</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('services')}>App Development</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('services')}>Video Editing & VFX</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('services')}>AI Automation</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff2d55', letterSpacing: '0.15em', marginBottom: 20 }}>
              PLATFORM
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('portfolio')}>Showcase</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('learning')}>Academy OS</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('process')}>Pipeline Engine</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('pricing')}>Pricing Tiers</span>
            </div>
          </div>

          {/* System Info */}
          <div>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff2d55', letterSpacing: '0.15em', marginBottom: 20 }}>
              SYSTEM STATUS
            </h4>
            <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>NODE: AW-OS-2045</div>
              <div>KERNEL: v2045.7.29</div>
              <div>GLOBAL LATENCY: 12ms</div>
              <div style={{ color: '#10b981', marginTop: 4 }}>● ALL SYSTEMS NOMINAL</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Warp Top Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 32,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.45)'
          }}
        >
          <div>
            © 2045 {COMPANY_NAME}. ALL RIGHTS RESERVED. HIGH PERFORMANCE OPERATING SYSTEM.
          </div>

          <button
            onClick={scrollToTop}
            onMouseEnter={playHoverSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 45, 85, 0.12)',
              border: '1px solid rgba(255, 45, 85, 0.4)',
              color: '#ff2d55',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            TOP WARP ↑
          </button>
        </div>
      </div>

      <style>{`
        .social-btn:hover {
          transform: translateY(-4px) scale(1.1);
          background-color: rgba(255, 45, 85, 0.2) !important;
          border-color: #ff2d55 !important;
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.5) !important;
        }
        @media (max-width: 900px) {
          footer div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
