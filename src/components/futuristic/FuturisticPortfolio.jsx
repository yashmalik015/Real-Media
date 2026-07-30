import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { mediaUrl } from '../../api.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

gsap.registerPlugin(ScrollTrigger);

export function FuturisticPortfolio({ portfolio = [] }) {
  const scrollContainerRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const defaultShowcase = [
    {
      id: 'p1',
      title: 'Neon Cyberpunk 2045 VFX Commercial',
      service: 'Video Editing',
      description: 'High-octane commercial edit for global tech campaign with 3D compositing & speed ramps.',
      outcome: '+4.2M Views & 340% Conversion Increase',
      mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      client: 'Apex Cybernetics',
      tech: ['After Effects', 'Blender 3D', 'Color Grading']
    },
    {
      id: 'p2',
      title: 'HyperDrive AI SaaS Platform',
      service: 'Web Development',
      description: 'Next-generation web application with WebGL interactive particle canvas and 60 FPS performance.',
      outcome: '$1.4M ARR Generated within 90 Days',
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      client: 'Vanguard Systems',
      tech: ['React 19', 'Three.js', 'Node.js', 'MongoDB']
    },
    {
      id: 'p3',
      title: 'Aether Vision Mobile App',
      service: 'App Development',
      description: 'iOS & Android spatial computing app for realtime 3D model visualization.',
      outcome: '#1 Trending Product on App Store',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      client: 'OmniTech Global',
      tech: ['React Native', 'Metal API', 'Firebase']
    }
  ];

  const items = portfolio.length > 0 ? portfolio : defaultShowcase;

  const scroll = (direction) => {
    playClickSound();
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.port-card',
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: 'top 85%',
          }
        }
      );
    });
    return () => ctx.revert();
  }, [items]);

  return (
    <section id="portfolio" style={{ padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <AnimatedSectionTitle
              label="FUTURISTIC PROJECT SHOWCASE"
              title="CRAFTSMANSHIP & RECENT DEPLOYMENTS"
              sub="A selection of high-impact production builds delivered with extreme precision."
              animationStyle="portfolio"
            />
          </div>

          {/* Slider Controls */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => scroll('left')}
              onMouseEnter={playHoverSound}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              onMouseEnter={playHoverSound}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* 3D Horizontal Slider */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: 32,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '20px 32px 40px',
          scrollbarWidth: 'none'
        }}
      >
        {items.map((item, idx) => {
          const imageSrc = item.mediaUrl ? mediaUrl(item.mediaUrl) : item.mediaUrl || defaultShowcase[0].mediaUrl;

          return (
            <div
              key={item.id || idx}
              onClick={() => {
                playClickSound();
                setSelectedItem(item);
              }}
              onMouseEnter={playHoverSound}
              style={{
                flex: '0 0 420px',
                scrollSnapAlign: 'start',
                borderRadius: 28,
                backgroundColor: 'rgba(14, 14, 20, 0.8)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                perspective: 1000
              }}
              className="port-card"
            >
              {/* Media Container with Cinematic Zoom */}
              <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                <img
                  src={imageSrc}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="port-img"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(14, 14, 20, 1) 0%, transparent 60%)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    padding: '6px 14px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(10, 10, 14, 0.85)',
                    border: '1px solid rgba(255, 45, 85, 0.5)',
                    color: '#ff2d55',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.15em'
                  }}
                >
                  {item.service || 'DEPLOYMENT'}
                </span>
              </div>

              {/* Card Meta Details */}
              <div style={{ padding: '24px 28px 28px' }}>
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.8rem',
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                    lineHeight: 1.1
                  }}
                >
                  {item.title}
                </h3>
                <AnimatedParagraph
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    marginBottom: 20,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.description}
                </AnimatedParagraph>

                {item.outcome && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 45, 85, 0.1)',
                      border: '1px solid rgba(255, 45, 85, 0.25)',
                      color: '#ff2d55',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span>📈</span> {item.outcome}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modal Preview */}
      {selectedItem && (
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
              maxWidth: 780,
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
                setSelectedItem(null);
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

            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em' }}>
              PROJECT INSPECTION // {selectedItem.service}
            </span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#ffffff', margin: '8px 0 20px 0' }}>
              {selectedItem.title}
            </h2>

            <img
              src={selectedItem.mediaUrl ? mediaUrl(selectedItem.mediaUrl) : selectedItem.mediaUrl || defaultShowcase[0].mediaUrl}
              alt={selectedItem.title}
              style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}
            />

            <AnimatedParagraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.75, marginBottom: 24 }}>
              {selectedItem.description}
            </AnimatedParagraph>

            {selectedItem.outcome && (
              <div style={{ padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontWeight: 600, marginBottom: 24 }}>
                KEY IMPACT: {selectedItem.outcome}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .port-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: rgba(255, 45, 85, 0.65) !important;
          box-shadow: 0 30px 60px rgba(255, 45, 85, 0.3) !important;
        }
        .port-card:hover .port-img {
          transform: scale(1.08);
        }
      `}</style>
    </section>
  );
}
