import React, { useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';
import { PUBLIC_SERVICES } from '../../data/siteData.js';

gsap.registerPlugin(ScrollTrigger);

export function FuturisticPricing({ onSelectPlan, skills = [], pricingData = [] }) {
  const [selectedService, setSelectedService] = useState('All');
  const [currency, setCurrency] = useState('INR'); // Default to INR
  const EXCHANGE_RATE = 83; // 1 USD = 83 INR

  // Build unified plans list strictly from user-created skills and tiers
  const plans = useMemo(() => {
    const list = [];
    const sourceSkills = Array.isArray(skills) && skills.length > 0 ? skills : [];

    sourceSkills.forEach(skill => {
      const tiers = Array.isArray(skill.tiers) ? skill.tiers : [];

      tiers.forEach((tier, idx) => {
        const rawNum = typeof tier.price === 'number'
          ? tier.price
          : Number(String(tier.price || '').replace(/[^0-9.]/g, '')) || 0;

        const inclusions = Array.isArray(tier.inclusions)
          ? tier.inclusions
          : (typeof tier.inclusions === 'string'
              ? tier.inclusions.split(',').map(s => s.trim()).filter(Boolean)
              : []);

        const features = Array.isArray(tier.features)
          ? tier.features
          : (typeof tier.features === 'string'
              ? tier.features.split(',').map(s => s.trim()).filter(Boolean)
              : []);

        list.push({
          id: tier.id || `${skill.id || skill.title}_tier_${idx}`,
          service: skill.title,
          serviceIcon: skill.icon || '⚡',
          category: skill.category || 'Service',
          name: tier.name || `Plan ${idx + 1}`,
          numericPrice: rawNum,
          priceRaw: tier.price,
          period: tier.deliveryTime || tier.turnaround || 'project',
          desc: tier.desc || `${tier.name} package for ${skill.title}.`,
          inclusions,
          features: features.length > 0 ? features : inclusions,
          popular: Boolean(tier.highlight || tier.popular),
        });
      });
    });

    return list;
  }, [skills]);

  // Unique service names for category filters
  const serviceOptions = useMemo(() => {
    const unique = ['All', ...new Set(plans.map(p => p.service))];
    return unique;
  }, [plans]);

  // Filtered plans based on selected service
  const filteredPlans = useMemo(() => {
    if (selectedService === 'All') return plans;
    return plans.filter(p => p.service === selectedService);
  }, [plans, selectedService]);

  const formatPrice = (plan) => {
    const num = plan.numericPrice;
    if (!num) return 'Custom Quote';
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    const usdVal = Math.max(1, Math.round(num / EXCHANGE_RATE));
    return `$${usdVal.toLocaleString('en-US')}`;
  };

  useEffect(() => {
    if (filteredPlans.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.price-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    });
    return () => ctx.revert();
  }, [filteredPlans, selectedService]);

  return (
    <section id="pricing" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 4vw, 32px)', position: 'relative', background: '#050508' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <AnimatedSectionTitle
            label="TRANSPARENT SERVICE PACKAGES"
            title="PRODUCTION PRICING MATRIX"
            sub="No hidden fees. Every service package is customized for high retention, fast delivery, and maximum impact."
            animationStyle="pricing"
          />

          {/* Controls Bar: Currency Switcher + Quick Info */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 30, padding: 4, position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: 4, bottom: 4, left: currency === 'INR' ? 4 : '50%',
                width: 'calc(50% - 4px)', backgroundColor: '#ff2d55', borderRadius: 26,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 0
              }} />
              <button
                onClick={() => { playClickSound(); setCurrency('INR'); }}
                style={{
                  position: 'relative', zIndex: 1, padding: '8px 24px', background: 'none', border: 'none',
                  color: currency === 'INR' ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.3s ease'
                }}
              >
                INR (₹)
              </button>
              <button
                onClick={() => { playClickSound(); setCurrency('USD'); }}
                style={{
                  position: 'relative', zIndex: 1, padding: '8px 24px', background: 'none', border: 'none',
                  color: currency === 'USD' ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.3s ease'
                }}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* Service Filter Tabs (Only when packages exist) */}
          {plans.length > 0 && (
            <div style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 28,
              maxWidth: 1100,
              margin: '28px auto 0'
            }}>
              {serviceOptions.map((svc) => {
                const isSelected = selectedService === svc;
                const count = svc === 'All'
                  ? plans.length
                  : plans.filter(p => p.service === svc).length;

                return (
                  <button
                    key={svc}
                    onClick={() => { playClickSound(); setSelectedService(svc); }}
                    onMouseEnter={playHoverSound}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      border: isSelected ? '1px solid #ff2d55' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(255, 45, 85, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 16px rgba(255,45,85,0.25)' : 'none'
                    }}
                  >
                    <span>{svc}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: isSelected ? '#ff2d55' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontFamily: 'monospace'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid or Custom Project Scope Banner */}
        {filteredPlans.length === 0 ? (
          <div style={{
            padding: '64px 32px',
            textAlign: 'center',
            backgroundColor: 'rgba(15, 15, 22, 0.85)',
            border: '1px dashed rgba(255, 45, 85, 0.3)',
            borderRadius: 28,
            maxWidth: 720,
            margin: '40px auto 0',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#fff', letterSpacing: '0.04em', margin: '0 0 12px' }}>
              CUSTOM PROJECT SCOPE & QUOTE
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 28px' }}>
              Every client project is scoped individually based on deliverables, requirements, and turnaround. Submit your brief to receive a custom quote and begin production.
            </p>
            <button
              onClick={() => {
                playClickSound();
                if (onSelectPlan) onSelectPlan(null, selectedService !== 'All' ? selectedService : 'Custom');
              }}
              style={{
                padding: '14px 36px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 25px rgba(255,45,85,0.4)',
                letterSpacing: '0.05em'
              }}
            >
              Start Custom Project
            </button>
          </div>
        ) : (
          <div
            id="pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: 24,
              alignItems: 'stretch'
            }}
          >
            {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                padding: 'clamp(22px, 4vw, 36px)',
                borderRadius: 28,
                backgroundColor: plan.popular ? 'rgba(18, 18, 26, 0.95)' : 'rgba(12, 12, 18, 0.82)',
                border: plan.popular ? '2px solid #ff2d55' : '1px solid rgba(255, 45, 85, 0.22)',
                backdropFilter: 'blur(28px)',
                boxShadow: plan.popular
                  ? '0 24px 60px rgba(255, 45, 85, 0.3), inset 0 0 24px rgba(255, 45, 85, 0.1)'
                  : '0 16px 40px rgba(0,0,0,0.7)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
              }}
              className="price-card"
            >
              <div>
                {/* Header Row: Service Badge + Recommended Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(255, 45, 85, 0.12)',
                    border: '1px solid rgba(255, 45, 85, 0.3)',
                    color: '#ff7b92',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>{plan.serviceIcon}</span>
                    <span>{plan.service}</span>
                  </span>

                  {plan.popular && (
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: 999,
                        backgroundColor: '#ff2d55',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        boxShadow: '0 0 12px #ff2d55'
                      }}
                    >
                      RECOMMENDED
                    </div>
                  )}
                </div>

                {/* Plan Name */}
                <h3 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '2.2rem',
                  color: '#ffffff',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.04em',
                  lineHeight: 1.1
                }}>
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p style={{
                  fontSize: '0.86rem',
                  color: 'rgba(255,255,255,0.6)',
                  minHeight: 40,
                  lineHeight: 1.5,
                  marginBottom: 20
                }}>
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginBottom: 28,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '3.4rem',
                    color: plan.popular ? '#ff2d55' : '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '0.02em'
                  }}>
                    {formatPrice(plan)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    / {plan.period}
                  </span>
                </div>

                {/* Deliverables / Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                    Package Deliverables:
                  </div>
                  {plan.features.slice(0, 5).map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                      <span style={{ color: '#ff2d55', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  playClickSound();
                  if (onSelectPlan) onSelectPlan(plan, plan.service || '');
                }}
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  borderRadius: 999,
                  background: plan.popular
                    ? 'linear-gradient(135deg, #ff2d55, #c81e42)'
                    : 'rgba(255,255,255,0.06)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,45,85,0.4)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  boxShadow: plan.popular ? '0 0 28px rgba(255,45,85,0.45)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <AnimatedButtonText label={`START ${plan.service.toUpperCase()} PROJECT`} />
              </button>
            </div>
          ))}
        </div>
      )}
      </div>

      <style>{`
        .price-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 45, 85, 0.8) !important;
          box-shadow: 0 28px 70px rgba(255, 45, 85, 0.35) !important;
        }
      `}</style>
    </section>
  );
}
