import React, { useEffect, useState } from 'react';
import { LOGO_URL, COMPANY_NAME } from '../../data/siteData.js';
import { playHoverSound, playClickSound, toggleAudioMute, isAudioMuted } from '../../utils/audio.js';
import { LogOut } from 'lucide-react';

export function FuturisticNavbar({
  page,
  onNavigate,
  session,
  onOpenAuth,
  onLogout,
  onStartProject,
  onOpenNotifications,
  unreadCount = 0
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(isAudioMuted());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Services', value: 'services' },
    { label: 'Portfolio', value: 'portfolio' },
    { label: 'Learning', value: 'learning' },
    { label: 'Pipeline', value: 'process' },
    { label: 'Reviews', value: 'testimonials' },
    { label: 'Pricing', value: 'pricing' },
    { label: 'Contact', value: 'contact' }
  ];

  const handleAudioToggle = () => {
    const muted = toggleAudioMute();
    setAudioMuted(muted);
    if (!muted) playClickSound();
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: scrolled ? 12 : 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: scrolled ? '92%' : '96%',
          maxWidth: 1440,
          zIndex: 9999,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: scrolled ? '10px 24px' : '14px 32px',
            backgroundColor: 'rgba(10, 10, 14, 0.75)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 45, 85, 0.3)',
            borderRadius: 999,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 45, 85, 0.15)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Logo */}
          <div
            onClick={() => {
              playClickSound();
              onNavigate('home');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
            onMouseEnter={playHoverSound}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={LOGO_URL}
                alt={COMPANY_NAME}
                style={{
                  width: scrolled ? 38 : 44,
                  height: scrolled ? 38 : 44,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 12px rgba(255, 45, 85, 0.7))',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: scrolled ? '1.25rem' : '1.45rem',
                  letterSpacing: '0.22em',
                  color: '#ffffff',
                  lineHeight: 1,
                  textShadow: '0 0 12px rgba(255, 45, 85, 0.5)',
                  transition: 'all 0.3s ease'
                }}
              >
                {COMPANY_NAME.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.15em', color: '#ff2d55' }}>
                FUI OS 2045
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {navItems.map((item) => {
              const active = page.toLowerCase() === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    playClickSound();
                    onNavigate(item.value);
                  }}
                  onMouseEnter={playHoverSound}
                  style={{
                    position: 'relative',
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    backgroundColor: active ? 'rgba(255, 45, 85, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(255, 45, 85, 0.4)' : '1px solid transparent',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden'
                  }}
                >
                  {item.label}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 14,
                        height: 2,
                        backgroundColor: '#ff2d55',
                        borderRadius: 2,
                        boxShadow: '0 0 8px #ff2d55'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* HUD Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Audio Feedback Toggle */}
            <button
              onClick={handleAudioToggle}
              onMouseEnter={playHoverSound}
              title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'grid',
                placeItems: 'center',
                color: audioMuted ? 'rgba(255,255,255,0.4)' : '#ff2d55',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              {audioMuted ? '🔇' : '🔊'}
            </button>

            {/* User Logout */}
            {session && (
              <button
                onClick={() => {
                  playClickSound();
                  if (onLogout) onLogout();
                }}
                onMouseEnter={playHoverSound}
                style={{
                  position: 'relative',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 45, 85, 0.1)',
                  border: '1px solid rgba(255, 45, 85, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ff2d55',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}

            {/* Auth status or login */}
            {session ? (
              <div
                onClick={() => {
                  playClickSound();
                  onNavigate(session.role === 'team' ? 'team' : session.role === 'client' ? 'client-portal' : 'profile');
                }}
                onMouseEnter={playHoverSound}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 999,
                  backgroundColor: session.role === 'client' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 45, 85, 0.12)',
                  border: `1px solid ${session.role === 'client' ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 45, 85, 0.4)'}`,
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title={session.role === 'client' ? 'Open Client Portal' : 'Open Learner Profile'}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: session.role === 'client' ? 'linear-gradient(135deg, #34c759, #1b8a38)' : 'linear-gradient(135deg, #ff2d55, #9f1111)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  {session.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.name}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', color: session.role === 'client' ? '#34c759' : '#ff2d55', fontWeight: 700 }}>
                  {session.role === 'client' ? 'CLIENT' : session.role === 'team' ? 'TEAM' : 'STUDENT'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth();
                }}
                onMouseEnter={playHoverSound}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </button>
            )}

            {/* Launch Project CTA */}
            <button
              className="nav-cta-btn"
              onClick={() => {
                playClickSound();
                onStartProject();
              }}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: scrolled ? '8px 20px' : '10px 24px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s, boxShadow 0.2s'
              }}
            >
              Start Project
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
              onClick={() => {
                playClickSound();
                setMobileOpen(!mobileOpen);
              }}
              style={{
                display: 'none',
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                color: '#ffffff',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Panel */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(4, 4, 6, 0.96)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '40px 24px',
            overflowY: 'auto'
          }}
        >
          {/* Close button at top-right */}
          <button
            onClick={() => { playClickSound(); setMobileOpen(false); }}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              color: '#ffffff',
              fontSize: '1.3rem',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 320 }}>
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  playClickSound();
                  setMobileOpen(false);
                  onNavigate(item.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontSize: '1.4rem',
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: '0.12em',
                  color: page.toLowerCase() === item.value ? '#ff2d55' : '#ffffff',
                  backgroundColor: page.toLowerCase() === item.value ? 'rgba(255, 45, 85, 0.12)' : 'transparent',
                  border: page.toLowerCase() === item.value ? '1px solid rgba(255, 45, 85, 0.3)' : '1px solid transparent',
                  textAlign: 'center'
                }}
              >
                {item.label.toUpperCase()}
              </button>
            ))}

            {/* Mobile Drawer CTAs */}
            <button
              onClick={() => {
                playClickSound();
                setMobileOpen(false);
                onStartProject();
              }}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '14px 24px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)'
              }}
            >
              Start Project
            </button>

            {!session ? (
              <button
                onClick={() => {
                  playClickSound();
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Login to Platform
              </button>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  setMobileOpen(false);
                  onNavigate(session.role === 'team' ? 'team' : session.role === 'client' ? 'client-portal' : 'profile');
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 45, 85, 0.12)',
                  border: '1px solid rgba(255, 45, 85, 0.4)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Open Dashboard ({session.name || 'Account'})
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: grid !important; place-items: center; }
        }
        @media (max-width: 640px) {
          .nav-cta-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
