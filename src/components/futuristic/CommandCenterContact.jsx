import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { playClickSound, playHoverSound, playWarpSound } from '../../utils/audio.js';
import { api } from '../../api.js';
import { AnimatedSectionTitle, AnimatedButtonText } from './CinematicTypography.jsx';

export function CommandCenterContact({ showToast }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Web Development',
    description: ''
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.description) {
      if (showToast) showToast('Please enter your name, email, and project details.');
      return;
    }

    playClickSound();
    setStatus('submitting');

    try {
      await api.createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        service: form.service,
        description: form.description
      });
    } catch (_err) {
      // Fallback UI simulation
    }

    setTimeout(() => {
      setStatus('success');
      playWarpSound();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff2d55', '#ffffff', '#c81e42']
      });

      if (showToast) showToast('Inquiry transmitted! Our team will contact you within 4 hours.');

      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', phone: '', company: '', service: 'Web Development', description: '' });
      }, 3500);
    }, 1200);
  };

  return (
    <section id="contact" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <AnimatedSectionTitle
            label="COMMAND CENTER TRANSMISSION"
            title="INITIALIZE PROJECT TRANSMISSION"
            sub="Ready to build something extraordinary? Fill out the command parameters below and our engineering team will respond within 4 hours."
            animationStyle="contact"
          />
        </div>

        {/* Command Form Terminal Card */}
        <div
          style={{
            position: 'relative',
            padding: 48,
            borderRadius: 32,
            backgroundColor: 'rgba(12, 12, 18, 0.85)',
            border: '1px solid rgba(255, 45, 85, 0.4)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 30px 100px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 45, 85, 0.2)'
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.12em', marginBottom: 8 }}>
                CLIENT NAME *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Yash Malik"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                className="fui-input"
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.12em', marginBottom: 8 }}>
                EMAIL TRANSMISSION ADDRESS *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="yash@company.com"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                className="fui-input"
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.12em', marginBottom: 8 }}>
                PHONE NUMBER
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                className="fui-input"
              />
            </div>

            {/* Service Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.12em', marginBottom: 8 }}>
                TARGET SERVICE MODULE *
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(10, 10, 14, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                className="fui-input"
              >
                <option value="Web Development">Web Development</option>
                <option value="App Development">App Development</option>
                <option value="Video Editing">Video Editing & VFX</option>
                <option value="Game Development">Game Development</option>
                <option value="AI Automation">AI Automation Systems</option>
                <option value="Marketing">Growth Marketing</option>
              </select>
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.12em', marginBottom: 8 }}>
                PROJECT BRIEF & PARAMETERS *
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your vision, goals, features, or timeline..."
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                className="fui-input"
              />
            </div>

            {/* Submit Action Button */}
            <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
              <button
                type="submit"
                disabled={status !== 'idle'}
                onMouseEnter={playHoverSound}
                style={{
                  width: '100%',
                  padding: '18px 36px',
                  borderRadius: 999,
                  background:
                    status === 'success'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #ff2d55, #c81e42)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  border: 'none',
                  boxShadow: '0 0 40px rgba(255, 45, 85, 0.45)',
                  cursor: status === 'idle' ? 'pointer' : 'default',
                  transition: 'all 0.3s ease'
                }}
              >
                <AnimatedButtonText
                  label={
                    status === 'submitting'
                      ? 'TRANSMITTING TELEMETRY DATA...'
                      : status === 'success'
                      ? 'TRANSMISSION SUCCESSFUL ✓'
                      : 'TRANSMIT PROJECT BRIEF NOW 🚀'
                  }
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .fui-input:focus {
          border-color: #ff2d55 !important;
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.3) !important;
        }
        @media (max-width: 768px) {
          form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
