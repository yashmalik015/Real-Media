import React, { useState } from 'react';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

export function LearningPlatformHUD({ onOpenLearning }) {
  const [activeTab, setActiveTab] = useState('All');

  const courses = [
    {
      id: 'c1',
      title: 'Cinematic 3D VFX & Motion Compositing',
      category: 'VFX & Motion',
      instructor: 'Yash Malik',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      duration: '14 Hours',
      rating: '4.9 ★',
      progress: 78,
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      desc: 'Master After Effects, Unreal Engine 5, and Nuke for Hollywood-grade visual effects.'
    },
    {
      id: 'c2',
      title: 'Fullstack Web OS Development (React 19 & WebGL)',
      category: 'Development',
      instructor: 'Assets Weber Team',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      duration: '22 Hours',
      rating: '5.0 ★',
      progress: 45,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      desc: 'Architect hyper-scalable web systems with high FPS canvas shaders and microservices.'
    },
    {
      id: 'c3',
      title: 'AI Automation & Enterprise Workflow Engineering',
      category: 'AI & Ops',
      instructor: 'AI Core Systems',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      duration: '10 Hours',
      rating: '4.8 ★',
      progress: 90,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      desc: 'Build self-operating business workflows with custom LLM agents and webhooks.'
    }
  ];

  const categories = ['All', 'Development', 'VFX & Motion', 'AI & Ops'];

  const filtered = activeTab === 'All' ? courses : courses.filter((c) => c.category === activeTab);

  return (
    <section id="learning" style={{ padding: '100px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <AnimatedSectionTitle
              label="NETFLIX-STYLE LEARNING OS"
              title="ASSETS WEBER ACADEMY & COURSES"
              sub="Browse courses, watch lessons, and build real skills with hands-on projects."
              animationStyle="learning"
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  setActiveTab(cat);
                }}
                onMouseEnter={playHoverSound}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === cat ? '#ff2d55' : 'rgba(255, 255, 255, 0.05)',
                  border: activeTab === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  boxShadow: activeTab === cat ? '0 0 20px rgba(255, 45, 85, 0.5)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <AnimatedButtonText label={cat} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Netflix/Apple TV Course Cards Slider */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          overflowX: 'auto',
          padding: '10px 32px 40px',
          scrollbarWidth: 'none'
        }}
      >
        {filtered.map((course) => (
          <div
            key={course.id}
            onClick={() => {
              playClickSound();
              if (onOpenLearning) onOpenLearning();
            }}
            onMouseEnter={playHoverSound}
            style={{
              flex: '0 0 380px',
              borderRadius: 24,
              backgroundColor: 'rgba(12, 12, 16, 0.85)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            className="course-card"
          >
            {/* Thumbnail with Play Hover */}
            <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                className="course-img"
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,16,1) 0%, transparent 70%)' }} />

              {/* Play Button Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
                className="play-overlay"
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#ff2d55',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 0 30px #ff2d55'
                  }}
                >
                  ▶
                </div>
              </div>

              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  padding: '4px 12px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(10, 10, 14, 0.85)',
                  border: '1px solid rgba(255, 45, 85, 0.4)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                {course.rating}
              </span>
            </div>

            {/* Course Meta */}
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img
                  src={course.avatar}
                  alt={course.instructor}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ff2d55' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{course.instructor}</span>
              </div>

              <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#ffffff', margin: '0 0 8px 0', lineHeight: 1.15 }}>
                {course.title}
              </h4>
              <AnimatedParagraph style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 20 }}>
                {course.desc}
              </AnimatedParagraph>

              {/* Progress Ring Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="24" height="24" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ff2d55"
                      strokeWidth="3.8"
                      strokeDasharray={`${course.progress}, 100`}
                    />
                  </svg>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#ff2d55' }}>
                    {course.progress}% COMPLETED
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {course.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .course-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 45, 85, 0.65) !important;
          box-shadow: 0 30px 60px rgba(255, 45, 85, 0.3) !important;
        }
        .course-card:hover .course-img {
          transform: scale(1.08);
        }
        .course-card:hover .play-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
