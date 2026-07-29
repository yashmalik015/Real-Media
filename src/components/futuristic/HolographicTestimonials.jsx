import React, { useState } from 'react';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph } from './CinematicTypography.jsx';

export function HolographicTestimonials({ testimonials = [] }) {
  const defaultReviews = [
    {
      name: 'Rohan Sharma',
      company: 'Vanguard Media Group',
      service: 'Video Editing & VFX',
      review: 'Assets Weber completely transformed our brand output. The cinematic edits and VFX quality exceeded everything we expected!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Elena Rostova',
      company: 'CyberPulse Tech',
      service: 'Web Development',
      review: 'The team built an ultra-fast WebGL website that handles 60 FPS particle graphics smoothly. Our user engagement skyrocketed by 340%!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Marcus Vance',
      company: 'Aether Labs',
      service: 'App Development',
      review: 'Working with Assets Weber felt like stepping into 2045. Clean code, high velocity, and stellar communication from day one.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const reviews = testimonials.length > 0 ? testimonials : defaultReviews;

  return (
    <section id="testimonials" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <AnimatedSectionTitle
            label="VERIFIED HOLOGRAPHIC REVIEWS"
            title="CLIENT TRUST & TESTIMONIALS"
            sub="Real feedback from visionary clients who built their next-gen systems with Assets Weber."
            animationStyle="testimonials"
          />
        </div>

        {/* Floating 3D Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28
          }}
        >
          {reviews.map((rev, idx) => (
            <div
              key={rev.name || idx}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: 36,
                borderRadius: 28,
                backgroundColor: 'rgba(12, 12, 16, 0.8)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 280
              }}
              className="testi-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ color: '#ff2d55', fontSize: '1.1rem', letterSpacing: '2px' }}>
                    {'★'.repeat(rev.rating || 5)}
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                    VERIFIED
                  </span>
                </div>

                <AnimatedParagraph style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.98rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24 }}>
                  "{rev.review}"
                </AnimatedParagraph>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={rev.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ff2d55' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{rev.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{rev.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .testi-card:hover {
          transform: translateY(-10px) scale(1.03);
          border-color: rgba(255, 45, 85, 0.7) !important;
          box-shadow: 0 30px 70px rgba(255, 45, 85, 0.3) !important;
        }
      `}</style>
    </section>
  );
}
