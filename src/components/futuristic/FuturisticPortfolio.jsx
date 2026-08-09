import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { mediaUrl } from '../../api.js';
import { AnimatedSectionTitle, AnimatedParagraph, AnimatedButtonText } from './CinematicTypography.jsx';

gsap.registerPlugin(ScrollTrigger);

/** Detect if a portfolio item is a video based on mediaType or URL extension */
function isVideoItem(item) {
  if (item.mediaType === 'video') return true;
  const url = item.mediaUrl || item.videoUrl || item.fileUrl || '';
  return /\.(mp4|webm|mov|avi|mkv)/i.test(url);
}

/** Resolve the media source URL */
function getMediaSrc(item) {
  if (item.mediaUrl) return mediaUrl(item.mediaUrl);
  if (item.videoUrl) return mediaUrl(item.videoUrl);
  if (item.thumbnail) return mediaUrl(item.thumbnail);
  if (item.fileUrl) return item.fileUrl;
  return '';
}

function PortfolioMediaPreview({ item }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const src = getMediaSrc(item);
  const isVideo = isVideoItem(item);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isVideo, src]);

  if (isVideo && !videoError && src) {
    return (
      <video
        ref={videoRef}
        src={src}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="port-img"
        loop
        playsInline
        autoPlay
        muted
        preload="metadata"
        onError={() => setVideoError(true)}
      />
    );
  }

  if (src && !isVideo) {
    return (
      <img
        src={src}
        alt={item.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="port-img"
        loading="lazy"
      />
    );
  }

  // Fallback placeholder
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(255,45,85,0.15), rgba(12,12,16,0.9))',
      fontSize: '2.5rem'
    }}>
      {isVideo ? '▶' : '🖼'}
    </div>
  );
}

export function FuturisticPortfolio({ portfolio = [] }) {
  const scrollContainerRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const selectedVideoRef = useRef(null);
  const [selectedVideoError, setSelectedVideoError] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(false);

  const items = portfolio;

  const scroll = (direction) => {
    playClickSound();
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (items.length === 0) return;
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

  // Reset modal video error and vertical state when selecting new item
  useEffect(() => {
    setSelectedVideoError(false);
    setIsVideoVertical(false);
  }, [selectedItem]);

  // Play modal video when opened
  useEffect(() => {
    if (selectedItem && isVideoItem(selectedItem) && selectedVideoRef.current) {
      selectedVideoRef.current.defaultMuted = true;
      selectedVideoRef.current.muted = true;
      selectedVideoRef.current.play().catch(() => {});
    }
  }, [selectedItem]);

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
          {items.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => scroll('left')}
                onMouseEnter={playHoverSound}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 45, 85, 0.3)',
                  color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ←
              </button>
              <button
                onClick={() => scroll('right')}
                onMouseEnter={playHoverSound}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 45, 85, 0.3)',
                  color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>⬡</div>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            NO PROJECTS DEPLOYED YET
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto' }}>
            Our portfolio is being curated. Check back soon for high-impact production builds.
          </p>
        </div>
      ) : (
        /* 3D Horizontal Slider */
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex', gap: 32, overflowX: 'auto',
            scrollSnapType: 'x mandatory', padding: '20px 32px 40px',
            scrollbarWidth: 'none'
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => { playClickSound(); setSelectedItem(item); }}
              onMouseEnter={playHoverSound}
              style={{
                flex: '0 0 420px', scrollSnapAlign: 'start', borderRadius: 28,
                backgroundColor: 'rgba(14, 14, 20, 0.8)',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                perspective: 1000
              }}
              className="port-card"
            >
              {/* Media Container with Cinematic Zoom */}
              <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                <PortfolioMediaPreview item={item} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 14, 20, 1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                {isVideoItem(item) && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,45,85,0.85)',
                    display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.2rem',
                    boxShadow: '0 0 20px rgba(255,45,85,0.6)', pointerEvents: 'none'
                  }}>▶</div>
                )}
                <span style={{
                  position: 'absolute', top: 16, left: 16, padding: '6px 14px', borderRadius: 999,
                  backgroundColor: 'rgba(10, 10, 14, 0.85)', border: '1px solid rgba(255, 45, 85, 0.5)',
                  color: '#ff2d55', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '0.15em'
                }}>
                  {item.service || item.category || 'DEPLOYMENT'}
                </span>
              </div>

              {/* Card Meta Details */}
              <div style={{ padding: '24px 28px 28px' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#ffffff', margin: '0 0 10px 0', lineHeight: 1.1 }}>
                  {item.title}
                </h3>
                <AnimatedParagraph style={{
                  color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem', lineHeight: 1.6,
                  marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {item.description || item.desc || ''}
                </AnimatedParagraph>

                {item.outcome && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 12,
                    backgroundColor: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.25)',
                    color: '#ff2d55', fontSize: '0.78rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    {item.outcome}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal Preview */}
      {selectedItem && (
        <div
          onClick={() => { playClickSound(); setSelectedItem(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            backgroundColor: 'rgba(2, 2, 4, 0.88)', backdropFilter: 'blur(32px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative', width: '100%', maxWidth: 780,
              backgroundColor: 'rgba(14, 14, 20, 0.95)',
              border: '1px solid rgba(255, 45, 85, 0.5)', borderRadius: 32,
              padding: 40, boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 60px rgba(255, 45, 85, 0.3)',
              maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <button
              onClick={() => { playClickSound(); setSelectedItem(null); }}
              style={{
                position: 'absolute', top: 24, right: 24, width: 40, height: 40,
                borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff',
                fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em' }}>
              PROJECT INSPECTION // {selectedItem.service || selectedItem.category || 'DEPLOYMENT'}
            </span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#ffffff', margin: '8px 0 20px 0' }}>
              {selectedItem.title}
            </h2>

            {/* Modal media: video or image */}
            {isVideoItem(selectedItem) && !selectedVideoError ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginBottom: 24,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                borderRadius: 24,
                padding: isVideoVertical ? '20px 0' : '0',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
              }}>
                <video
                  ref={selectedVideoRef}
                  src={getMediaSrc(selectedItem)}
                  onLoadedMetadata={(e) => {
                    if (e.target.videoHeight > e.target.videoWidth) {
                      setIsVideoVertical(true);
                    } else {
                      setIsVideoVertical(false);
                    }
                  }}
                  style={{
                    width: isVideoVertical ? 'auto' : '100%',
                    maxWidth: isVideoVertical ? '320px' : '100%',
                    maxHeight: isVideoVertical ? '65vh' : '55vh',
                    height: isVideoVertical ? '520px' : 'auto',
                    aspectRatio: isVideoVertical ? '9/16' : 'auto',
                    objectFit: 'contain',
                    borderRadius: isVideoVertical ? 20 : 16,
                    boxShadow: isVideoVertical ? '0 15px 40px rgba(0,0,0,0.9), 0 0 25px rgba(255,45,85,0.3)' : 'none',
                    border: isVideoVertical ? '1px solid rgba(255,45,85,0.4)' : 'none',
                  }}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setSelectedVideoError(true)}
                />
              </div>
            ) : getMediaSrc(selectedItem) ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginBottom: 24,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                borderRadius: 24,
                padding: isVideoVertical ? '20px 0' : '0',
                border: '1px solid rgba(255, 45, 85, 0.3)',
                overflow: 'hidden'
              }}>
                <img
                  src={getMediaSrc(selectedItem)}
                  alt={selectedItem.title}
                  onLoad={(e) => {
                    if (e.target.naturalHeight > e.target.naturalWidth) {
                      setIsVideoVertical(true);
                    }
                  }}
                  style={{
                    width: isVideoVertical ? 'auto' : '100%',
                    maxWidth: isVideoVertical ? '360px' : '100%',
                    maxHeight: isVideoVertical ? '65vh' : '55vh',
                    height: isVideoVertical ? '520px' : 'auto',
                    aspectRatio: isVideoVertical ? '9/16' : 'auto',
                    objectFit: 'contain',
                    borderRadius: isVideoVertical ? 20 : 16,
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: '100%', height: 320, borderRadius: 20, marginBottom: 24,
                background: 'linear-gradient(135deg, rgba(255,45,85,0.15), rgba(12,12,16,0.9))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)', fontSize: '3rem', color: 'rgba(255,255,255,0.2)'
              }}>⬡</div>
            )}

            <AnimatedParagraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.75, marginBottom: 24 }}>
              {selectedItem.description || selectedItem.desc || ''}
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
