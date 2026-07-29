import React, { useState } from 'react';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

export function FuturisticPipeline({ onStartProject }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'DISCOVERY & TELEMETRY',
      subtitle: 'Requirement Analysis & Architecture Audit',
      desc: 'We analyze target user flows, technical constraints, business metrics, and competitive landscapes to draft a blueprint.',
      deliverables: ['System Architecture Diagram', 'FUI UX Flowcharts', 'Tech Stack Specifications']
    },
    {
      num: '02',
      title: 'STRATEGY & SYSTEM DESIGN',
      subtitle: 'Cybernetic Roadmap & Resource Allocation',
      desc: 'Formulating high-velocity sprint milestones, API schema definitions, and production pipeline timelines.',
      deliverables: ['Database Schema', 'API Endpoint Contracts', 'Sprint Delivery Milestones']
    },
    {
      num: '03',
      title: 'HOLOGRAPHIC DESIGN & 3D',
      subtitle: 'Ultra Premium Glassmorphism & UI Motion',
      desc: 'Crafting pixel-perfect interface components, 3D particle assets, volumetric lighting shaders, and micro-interactions.',
      deliverables: ['Interactive Figma Prototypes', 'WebGL / 3D Asset Renders', 'Design System Tokens']
    },
    {
      num: '04',
      title: 'FULLSTACK ENGINE DEVELOPMENT',
      subtitle: '60 FPS Optimized Code & Cloud Integration',
      desc: 'Writing clean, battle-tested code using React 19, Vite, Node.js, Express, MongoDB, and WebGL shader pipelines.',
      deliverables: ['Clean Code Repository', 'End-to-End API Integration', 'Automated Test Suite']
    },
    {
      num: '05',
      title: 'DEPLOYMENT & WARP LAUNCH',
      subtitle: 'Global CDN Distribution & Real-Time Monitoring',
      desc: 'Deploying your digital system onto enterprise cloud servers with SSL, DDoS protection, edge caching, and 24/7 telemetry.',
      deliverables: ['Live Cloud Deployment', 'Performance CWV Audit (100 Score)', '24/7 System Monitoring']
    }
  ];

  return (
    <section id="process" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <AnimatedSectionTitle
            label="CYBERNETIC EXECUTION PIPELINE"
            title="FIVE-STAGE PRODUCTION ENGINE"
            sub="Our streamlined end-to-end execution workflow transforms raw requirements into production-ready software systems."
            animationStyle="pipeline"
          />
        </div>

        {/* Connected Glowing Pipeline Nodes Header */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 48,
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 20
          }}
        >
          {/* Animated Connecting Energy Path Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 40,
              right: 40,
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 1,
              transform: 'translateY(-50%)'
            }}
          >
            <div
              style={{
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                height: '100%',
                backgroundColor: '#ff2d55',
                boxShadow: '0 0 15px #ff2d55',
                transition: 'width 0.5s ease'
              }}
            />
          </div>

          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const isPassed = activeStep >= idx;

            return (
              <button
                key={step.num}
                onClick={() => {
                  playClickSound();
                  setActiveStep(idx);
                }}
                onMouseEnter={playHoverSound}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: 120
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#ff2d55' : isPassed ? 'rgba(255, 45, 85, 0.3)' : 'rgba(14, 14, 20, 0.9)',
                    border: `2px solid ${isActive ? '#ff2d55' : isPassed ? 'rgba(255, 45, 85, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
                    color: '#ffffff',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.4rem',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: isActive ? '0 0 30px #ff2d55, inset 0 0 15px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  {step.num}
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#ff2d55' : 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em'
                  }}
                >
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div
          style={{
            position: 'relative',
            padding: 48,
            borderRadius: 32,
            backgroundColor: 'rgba(12, 12, 18, 0.85)',
            border: '1px solid rgba(255, 45, 85, 0.4)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(255, 45, 85, 0.15)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 48,
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em', marginBottom: 12 }}>
              PIPELINE PHASE {steps[activeStep].num} // {steps[activeStep].subtitle.toUpperCase()}
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#ffffff', margin: '0 0 16px 0', lineHeight: 1 }}>
              {steps[activeStep].title}
            </h3>
            <AnimatedParagraph style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 32 }}>
              {steps[activeStep].desc}
            </AnimatedParagraph>

            <button
              onClick={() => {
                playClickSound();
                if (onStartProject) onStartProject();
              }}
              onMouseEnter={playHoverSound}
              style={{
                padding: '14px 32px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
                cursor: 'pointer'
              }}
            >
              <AnimatedButtonText label="INITIALIZE THIS PHASE ⚡" />
            </button>
          </div>

          {/* Deliverables Specs Checklist */}
          <div
            style={{
              padding: 28,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 45, 85, 0.25)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em', marginBottom: 16 }}>
              KEY DELIVERABLES & OUTPUTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {steps[activeStep].deliverables.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.92rem', color: '#ffffff' }}>
                  <span style={{ color: '#ff2d55', fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
