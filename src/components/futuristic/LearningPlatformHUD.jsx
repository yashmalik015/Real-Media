import React, { useState, useEffect } from 'react';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { mediaUrl } from '../../api.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

export function LearningPlatformHUD({ onOpenLearning, courses = [] }) {
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', ...new Set((courses || []).map(c => c.category).filter(Boolean))];
  const filtered = activeTab === 'All' ? courses : courses.filter((c) => c.category === activeTab);

  return (
    <section id="learning" style={{ padding: '100px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <AnimatedSectionTitle
              label="LEARNING PLATFORM"
              title="ASSETS WEBER ACADEMY & COURSES"
              sub="Browse courses, watch lessons, and build real skills with hands-on projects."
              animationStyle="learning"
            />
          </div>

          {/* Category Tabs — only show if there are courses */}
          {courses.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { playClickSound(); setActiveTab(cat); }}
                  onMouseEnter={playHoverSound}
                  style={{
                    padding: '8px 18px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600,
                    backgroundColor: activeTab === cat ? '#ff2d55' : 'rgba(255, 255, 255, 0.05)',
                    border: activeTab === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    boxShadow: activeTab === cat ? '0 0 20px rgba(255, 45, 85, 0.5)' : 'none',
                    cursor: 'pointer', transition: 'all 0.25s ease'
                  }}
                >
                  <AnimatedButtonText label={cat} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        /* Empty state — no courses in DB */
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>⬡</div>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            COURSES COMING SOON
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            Our team is building world-class learning content. Stay tuned for professional courses on web development, VFX, AI, and more.
          </p>
          <button
            onClick={() => { playClickSound(); if (onOpenLearning) onOpenLearning(); }}
            onMouseEnter={playHoverSound}
            style={{
              marginTop: 24, padding: '12px 28px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600,
              background: 'linear-gradient(135deg, #ff2d55, #c81e42)', color: '#ffffff',
              border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,45,85,0.3)'
            }}
          >
            <AnimatedButtonText label="EXPLORE ACADEMY" />
          </button>
        </div>
      ) : (
        /* Horizontal Course Cards Slider */
        <div style={{ display: 'flex', gap: 28, overflowX: 'auto', padding: '10px 32px 40px', scrollbarWidth: 'none' }}>
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => { playClickSound(); if (onOpenLearning) onOpenLearning(); }}
              onMouseEnter={playHoverSound}
              style={{
                flex: '0 0 380px', borderRadius: 24,
                backgroundColor: 'rgba(12, 12, 16, 0.85)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative'
              }}
              className="course-card"
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                {course.thumbnail ? (
                  <img
                    src={mediaUrl(course.thumbnail)}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="course-img"
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(12,12,16,0.9))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', color: 'rgba(255,255,255,0.2)'
                  }}>▶</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,16,1) 0%, transparent 70%)' }} />

                {/* Play Button Overlay */}
                <div
                  style={{
                    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s ease'
                  }}
                  className="play-overlay"
                >
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', backgroundColor: '#ff2d55',
                    color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '1.5rem',
                    boxShadow: '0 0 30px #ff2d55'
                  }}>▶</div>
                </div>
              </div>

              {/* Course Meta */}
              <div style={{ padding: '20px 24px 24px' }}>
                {course.category && (
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 999,
                    backgroundColor: 'rgba(255,45,85,0.15)', color: '#ff2d55',
                    fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10
                  }}>{course.category}</span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', border: '1px solid #ff2d55',
                    background: 'linear-gradient(135deg, #ff2d55, #9f1111)',
                    display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700
                  }}>
                    {(course.teacherName || 'AW')[0]}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                    {course.teacherName || 'Assets Weber'}
                  </span>
                </div>

                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#ffffff', margin: '0 0 8px 0', lineHeight: 1.15 }}>
                  {course.title}
                </h4>
                <AnimatedParagraph style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 20 }}>
                  {course.description || ''}
                </AnimatedParagraph>

                {/* Lesson count and duration */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
                    {course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0} Lessons
                  </span>
                  {course.totalDuration && (
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      {course.totalDuration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
