import React, { useState } from 'react';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

export function FuturisticPricing({ onSelectPlan }) {
  const plans = [
    {
      name: 'STARTUP ENGINE',
      price: '₹24,999',
      period: 'per project',
      desc: 'Ideal for landing pages, promotional video reels, or MVP mobile prototypes.',
      features: [
        'Single Page Ultra Web App',
        'Custom 60 FPS Animations',
        '3 Revisions Included',
        'SEO & Core Web Vitals Audit',
        '7 Days Delivery Target'
      ],
      popular: false
    },
    {
      name: 'ENTERPRISE MATRIX',
      price: '₹49,999',
      period: 'per project',
      desc: 'Full scale business system with custom WebGL, backend database & mobile software.',
      features: [
        'Multi-Page Web & Mobile System',
        'WebGL 3D Interactive Canvas',
        'Full REST API & Database Integration',
        'Unlimited Revisions',
        'Dedicated Project Lead Support',
        '14 Days Delivery Target'
      ],
      popular: true
    },
    {
      name: 'CUSTOM HYPERDRIVE',
      price: 'Custom Quote',
      period: 'tailored build',
      desc: 'Enterprise-grade custom software, VFX commercials, game engine builds & AI pipelines.',
      features: [
        'End-to-End Enterprise Architecture',
        'Custom AI Agent Automation',
        'Unreal Engine 5 VFX & 3D',
        '24/7 Priority SLA',
        'Dedicated Senior Engineering Team'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <AnimatedSectionTitle
            label="TRANSPARENT DEPLOYMENT TIERS"
            title="PRODUCTION PRICING MATRIX"
            sub="No hidden fees. Transparent, outcome-focused pricing designed for fast turnaround and maximum ROI."
            animationStyle="pricing"
          />
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            alignItems: 'center'
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: 40,
                borderRadius: 32,
                backgroundColor: plan.popular ? 'rgba(16, 16, 24, 0.92)' : 'rgba(12, 12, 16, 0.8)',
                border: plan.popular ? '2px solid #ff2d55' : '1px solid rgba(255, 45, 85, 0.25)',
                backdropFilter: 'blur(28px)',
                boxShadow: plan.popular
                  ? '0 30px 80px rgba(255, 45, 85, 0.35), inset 0 0 30px rgba(255, 45, 85, 0.15)'
                  : '0 20px 50px rgba(0,0,0,0.8)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
              }}
              className="price-card"
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 24,
                    padding: '4px 14px',
                    borderRadius: 999,
                    backgroundColor: '#ff2d55',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    boxShadow: '0 0 15px #ff2d55'
                  }}
                >
                  RECOMMENDED TIER
                </div>
              )}

              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                {plan.name}
              </h3>
              <AnimatedParagraph style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', minHeight: 42, lineHeight: 1.5, marginBottom: 24 }}>
                {plan.desc}
              </AnimatedParagraph>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 32 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.6rem', color: plan.popular ? '#ff2d55' : '#ffffff', lineHeight: 1 }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  / {plan.period}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {plan.features.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ color: '#ff2d55', fontWeight: 700 }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  if (onSelectPlan) onSelectPlan(plan.name);
                }}
                style={{
                  width: '100%',
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: plan.popular ? 'linear-gradient(135deg, #ff2d55, #c81e42)' : 'rgba(255,255,255,0.06)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,45,85,0.4)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: plan.popular ? '0 0 35px rgba(255,45,85,0.5)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <AnimatedButtonText label="SELECT TIER & START 🚀" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .price-card:hover {
          transform: translateY(-10px) scale(1.03);
          border-color: rgba(255, 45, 85, 0.7) !important;
        }
      `}</style>
    </section>
  );
}
