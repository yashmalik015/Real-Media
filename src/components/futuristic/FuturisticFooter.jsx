import React from 'react';
import { LOGO_URL, COMPANY_NAME } from '../../data/siteData.js';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { Mail, Phone } from 'lucide-react';

const Instagram = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const Youtube = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);
const Twitter = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const Linkedin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export function FuturisticFooter({ onNavigate }) {
  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    { name: 'Instagram', icon: <Instagram size={20} />, url: 'https://www.instagram.com/assetsweber/' },
    { name: 'YouTube', icon: <Youtube size={20} />, url: 'https://youtube.com/@AssetsWeber' },
    { name: 'Twitter/X', icon: <Twitter size={20} />, url: 'https://x.com/AssetsWeber' },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, url: 'https://linkedin.com/in/yash-malik-31720837a' },
    { name: 'Email', icon: <Mail size={20} />, url: 'mailto:assetsweber@assetsweber.com' }
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

          {/* Contact Info */}
          <div>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff2d55', letterSpacing: '0.15em', marginBottom: 20 }}>
              CONTACT INFO
            </h4>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={16} color="#ff2d55" />
                <a href="mailto:assetsweber@assetsweber.com" style={{ color: 'inherit', textDecoration: 'none' }}>assetsweber@assetsweber.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={16} color="#ff2d55" />
                <span>+91 94160 85060</span>
              </div>
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
            © 2025 {COMPANY_NAME}. ALL RIGHTS RESERVED.
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
