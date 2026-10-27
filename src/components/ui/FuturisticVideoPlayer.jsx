import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Share2
} from 'lucide-react';
import { mediaUrl, optimizedMediaUrl } from '../../api.js';

function parseDuration(val) {
  if (!val) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const str = String(val).trim();
  if (!str) return 0;
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseFloat(p) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const num = parseFloat(str);
  return Number.isFinite(num) ? num : 0;
}

export function FuturisticVideoPlayer({
  src = '',
  poster = '',
  title = '',
  autoPlay = false,
  initialDuration = 0,
  onEnded,
  className = '',
  style = {},
  shareUrl = ''
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const savedTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => parseDuration(initialDuration));
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [quality, setQuality] = useState('1080p'); // Default to full 1080p crisp fidelity
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isSwitchingQuality, setIsSwitchingQuality] = useState(false);
  const [qualityToast, setQualityToast] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Share video action
  const handleShare = async () => {
    const url = shareUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Assets Weber Video Stream',
          url,
        });
        return;
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2200);
    } catch (_) {}
  };

  // Normalize source URL
  const rawUrl = (src || '').trim();
  const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
  const isDrive = rawUrl.includes('drive.google.com');
  const isExternalEmbed = isYouTube || isDrive;

  // Initialize duration from prop if available
  useEffect(() => {
    const initSec = parseDuration(initialDuration);
    if (initSec > 0) {
      setDuration((prev) => (initSec > prev || prev === 0 ? initSec : prev));
    }
  }, [initialDuration]);

  // Generate video source URL based on selected quality
  const getVideoSrcForQuality = useCallback((url, q) => {
    if (!url || isExternalEmbed) return '';
    const cleanUrl = mediaUrl(url);
    if (!cleanUrl.includes('res.cloudinary.com')) return cleanUrl;

    let transform = '';
    if (q === '720p') {
      transform = 'w_1280,c_limit';
    } else if (q === '480p') {
      transform = 'w_854,c_limit';
    } else if (q === 'auto') {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      transform = isMobile ? 'w_1280,c_limit' : '';
    } else {
      // 1080p FHD: full direct stream
      transform = '';
    }

    // Strip any existing transformation segment first
    const baseClean = cleanUrl.replace(/\/upload\/(?:[a-zA-Z0-9_,:]+\/)?(v\d+\/)/, '/upload/$1');
    if (!transform) return baseClean;
    return baseClean.replace('/upload/', `/upload/${transform}/`);
  }, [isExternalEmbed]);

  const videoSrc = getVideoSrcForQuality(rawUrl, quality);

  // Quality change handler preserving playback state & position seamlessly
  const handleQualityChange = (newQuality) => {
    if (newQuality === quality) {
      setShowQualityMenu(false);
      return;
    }
    const currentSrc = getVideoSrcForQuality(rawUrl, quality);
    const nextSrc = getVideoSrcForQuality(rawUrl, newQuality);

    setShowQualityMenu(false);

    if (currentSrc === nextSrc) {
      setQuality(newQuality);
      setQualityToast(`QUALITY: ${newQuality.toUpperCase()}`);
      setTimeout(() => setQualityToast(''), 1800);
      return;
    }

    if (videoRef.current) {
      savedTimeRef.current = videoRef.current.currentTime || 0;
      wasPlayingRef.current = !videoRef.current.paused;
    }
    setQuality(newQuality);
    setIsSwitchingQuality(true);
    setQualityToast(`SWITCHING TO ${newQuality.toUpperCase()}...`);

    // Guard timeout to guarantee the loading indicator clears rapidly
    setTimeout(() => {
      setIsSwitchingQuality(false);
      setIsLoading(false);
    }, 1200);
  };

  // Watchdog to ensure loading state never hangs
  useEffect(() => {
    if (isLoading || isSwitchingQuality) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsSwitchingQuality(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isSwitchingQuality]);

  // Extract YouTube ID
  const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/\s]+)/);
    const ytId = match?.[1] || '';
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`;
  };

  // Extract Drive ID
  const getDriveEmbedUrl = (url) => {
    const match = url.match(/\/d\/([^/]+)/);
    const driveId = match?.[1] || '';
    return `https://drive.google.com/file/d/${driveId}/preview`;
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('[Video Player Playback Blocked]:', err.message);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle Seek
  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(pos * duration, duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle Volume Change
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Handle Playback Rate
  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Skip time forward / backward
  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Reset error & reload
  const retryStream = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      const direct = getVideoSrcForQuality(rawUrl, quality);
      if (direct) videoRef.current.src = direct;
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        skipTime(-5);
      } else if (e.code === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update buffer range
  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedEnd(end);
    }
  };

  if (!rawUrl) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 20,
          backgroundColor: '#07070a',
          border: '1px solid rgba(255, 45, 85, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: 'rgba(255, 255, 255, 0.45)',
          fontSize: '0.9rem',
          ...style
        }}
      >
        <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'rgba(255,45,85,0.08)', display: 'grid', placeItems: 'center' }}>
          <Play size={22} color="#ff2d55" style={{ opacity: 0.6 }} />
        </div>
        <div>No video file or stream URL assigned yet.</div>
      </div>
    );
  }

  // Handle External Embeds (YouTube / Google Drive)
  if (isExternalEmbed) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 45, 85, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 45, 85, 0.15)',
          ...style
        }}
      >
        {isYouTube && (
          <iframe
            src={getYouTubeEmbedUrl(rawUrl)}
            title={title || 'Assets Weber Video Stream'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
        {isDrive && (
          <iframe
            src={getDriveEmbedUrl(rawUrl)}
            title={title || 'Assets Weber Video Stream'}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#050508',
        border: '1px solid rgba(255, 45, 85, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 45, 85, 0.18)',
        userSelect: 'none',
        ...style
      }}
      className={`fui-video-player-container ${className}`}
    >
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster ? mediaUrl(poster) : undefined}
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        onClick={togglePlay}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            const d = videoRef.current.duration;
            if (Number.isFinite(d) && d > 0) {
              setDuration((prev) => (d > prev || prev === 0 ? d : prev));
            }
            if (savedTimeRef.current > 0) {
              videoRef.current.currentTime = savedTimeRef.current;
            }
            if (wasPlayingRef.current) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }
          setIsLoading(false);
          setIsSwitchingQuality(false);
        }}
        onCanPlay={() => {
          setIsLoading(false);
          setIsSwitchingQuality(false);
          if (savedTimeRef.current > 0 && videoRef.current) {
            videoRef.current.currentTime = savedTimeRef.current;
            savedTimeRef.current = 0;
          }
          if (wasPlayingRef.current && videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }}
        onSeeked={() => {
          setIsLoading(false);
          setIsSwitchingQuality(false);
          savedTimeRef.current = 0;
          if (wasPlayingRef.current && videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const ct = videoRef.current.currentTime;
            if (Number.isFinite(ct)) {
              setCurrentTime(ct);
              if (ct > 0) {
                setIsLoading(false);
                setIsSwitchingQuality(false);
              }
            }
          }
        }}
        onDurationChange={() => {
          if (videoRef.current) {
            const d = videoRef.current.duration;
            // CRITICAL FIX: Only update duration if d is finite and positive
            if (Number.isFinite(d) && d > 0) {
              setDuration((prev) => (d > prev || prev === 0 ? d : prev));
            }
          }
        }}
        onProgress={handleProgress}
        onWaiting={() => {
          if (videoRef.current && !videoRef.current.paused) {
            setIsLoading(true);
          }
        }}
        onLoadStart={() => {
          if (!isSwitchingQuality && (!videoRef.current || videoRef.current.currentTime === 0)) {
            setIsLoading(true);
          }
        }}
        onPlaying={() => {
          setIsLoading(false);
          setIsSwitchingQuality(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={(e) => {
          setIsLoading(false);
          setIsSwitchingQuality(false);
          setHasError(true);
          const err = videoRef.current?.error;
          setErrorMessage(
            err?.code === 4
              ? 'Video stream not found (404) or media codec unsupported.'
              : 'Error connecting to video stream.'
          );
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000000',
          cursor: 'pointer'
        }}
      />

      {/* Quality Switch In-Flight HUD Badge */}
      {isSwitchingQuality && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '6px 14px',
            borderRadius: 8,
            backgroundColor: 'rgba(12, 12, 16, 0.88)',
            border: '1px solid #ff2d55',
            color: '#ff2d55',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 40,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(255, 45, 85, 0.3)'
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#ff2d55', animation: 'fuiPlayerSpin 0.8s linear infinite' }} />
          <span>SWITCHING TO {quality.toUpperCase()}...</span>
        </div>
      )}

      {/* Quality Toast Confirmation */}
      {qualityToast && !isSwitchingQuality && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '6px 14px',
            borderRadius: 8,
            backgroundColor: 'rgba(12, 12, 16, 0.88)',
            border: '1px solid rgba(52, 199, 89, 0.7)',
            color: '#34c759',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 40,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(52, 199, 89, 0.2)'
          }}
        >
          <span>✓ {qualityToast}</span>
        </div>
      )}

      {/* Futuristic Loading / Buffering Animation */}
      {isLoading && !hasError && !isSwitchingQuality && (isPlaying || !videoRef.current || videoRef.current.currentTime === 0) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 8, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
            gap: 16,
            pointerEvents: 'none'
          }}
        >
          {/* Cybernetic concentric rotating rings */}
          <div style={{ position: 'relative', width: 68, height: 68 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#ff2d55',
                borderRightColor: '#ff2d55',
                animation: 'fuiPlayerSpin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderBottomColor: 'rgba(255, 45, 85, 0.6)',
                borderLeftColor: 'rgba(255, 45, 85, 0.6)',
                animation: 'fuiPlayerSpinReverse 1.5s linear infinite'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 24,
                borderRadius: '50%',
                backgroundColor: '#ff2d55',
                boxShadow: '0 0 16px #ff2d55',
                animation: 'fuiPlayerPulse 1.2s ease-in-out infinite'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#ff2d55',
                letterSpacing: '0.15em',
                fontWeight: 700,
                textShadow: '0 0 10px rgba(255, 45, 85, 0.6)'
              }}
            >
              FUI OS 2045 // BUFFERING STREAM
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Optimizing dynamic bitrate and faststart frames...
            </div>
          </div>
        </div>
      )}

      {/* High-Tech Error State */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(8, 8, 12, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            gap: 16,
            padding: 32,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 45, 85, 0.15)',
              border: '1px solid rgba(255, 45, 85, 0.4)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 24px rgba(255, 45, 85, 0.3)'
            }}
          >
            <AlertTriangle size={28} color="#ff2d55" />
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.6rem',
                color: '#ffffff',
                letterSpacing: '0.06em'
              }}
            >
              VIDEO STREAM UNAVAILABLE
            </div>
            <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', maxWidth: 440, marginTop: 6, lineHeight: 1.5 }}>
              {errorMessage || 'The server could not stream this video file.'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,45,85,0.8)', fontFamily: 'monospace', marginTop: 8 }}>
              Source: {rawUrl.slice(0, 50)}...
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={retryStream}
              style={{
                padding: '9px 20px',
                borderRadius: 10,
                backgroundColor: 'rgba(255, 45, 85, 0.2)',
                border: '1px solid #ff2d55',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 15px rgba(255,45,85,0.3)'
              }}
            >
              <RefreshCw size={14} /> Retry Stream
            </button>
          </div>
        </div>
      )}

      {/* Center Big Play Button (When Paused) */}
      {!isPlaying && !isLoading && !hasError && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'all 0.3s ease'
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 45, 85, 0.95)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 35px rgba(255, 45, 85, 0.75), 0 10px 25px rgba(0, 0, 0, 0.5)',
              transform: 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Play size={32} color="#ffffff" style={{ marginLeft: 4 }} />
          </div>
        </div>
      )}

      {/* Cyberpunk HUD Controls Bar */}
      <div
        className="fui-player-controls"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(0deg, rgba(8, 8, 12, 0.96) 0%, rgba(8, 8, 12, 0.6) 75%, transparent 100%)',
          backdropFilter: 'blur(16px)',
          padding: '24px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: showControls || !isPlaying ? 1 : 0,
          transform: showControls || !isPlaying ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
          zIndex: 25
        }}
      >
        {/* Progress / Seek Bar with Buffer Display */}
        <div
          onClick={handleSeek}
          style={{
            position: 'relative',
            height: 6,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 999,
            cursor: 'pointer'
          }}
        >
          {/* Buffered Progress */}
          {duration > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${(bufferedEnd / duration) * 100}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 999
              }}
            />
          )}

          {/* Current Played Progress */}
          {duration > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${(currentTime / duration) * 100}%`,
                background: 'linear-gradient(90deg, #ff2d55, #ff5e7e)',
                borderRadius: 999,
                boxShadow: '0 0 10px #ff2d55'
              }}
            >
              {/* Glowing Scrubber Head */}
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 12px #ff2d55, 0 0 4px #ffffff',
                  border: '2px solid #ff2d55'
                }}
              />
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          {/* Left Actions: Play/Pause, Rewind, Forward, Volume, Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                padding: 4,
                transition: 'transform 0.15s ease'
              }}
            >
              {isPlaying ? <Pause size={20} color="#ff2d55" /> : <Play size={20} color="#ffffff" />}
            </button>

            <button
              onClick={() => skipTime(-10)}
              title="Skip -10s"
              className="fui-skip-btn"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => skipTime(10)}
              title="Skip +10s"
              className="fui-skip-btn"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}
            >
              <RotateCw size={16} />
            </button>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', color: isMuted ? '#ff2d55' : 'rgba(255,255,255,0.85)', cursor: 'pointer', padding: 2 }}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="fui-volume-slider"
                style={{
                  width: 60,
                  height: 4,
                  accentColor: '#ff2d55',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Time Stamp (Monospace) */}
            <div className="fui-timestamp" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.05em' }}>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{formatTime(currentTime)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Actions: Quality, Speed, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            {/* Quality Selector */}
            {!isExternalEmbed && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  title="Video Quality Settings"
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: quality === '1080p' ? 'rgba(255,45,85,0.2)' : 'rgba(255,255,255,0.08)',
                    border: quality === '1080p' ? '1px solid rgba(255,45,85,0.5)' : '1px solid rgba(255,255,255,0.15)',
                    color: quality === '1080p' ? '#ff2d55' : '#ffffff',
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Settings size={12} />
                  <span>{quality.toUpperCase()}</span>
                </button>

                {showQualityMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 34,
                      right: 0,
                      backgroundColor: 'rgba(12, 12, 16, 0.95)',
                      border: '1px solid rgba(255, 45, 85, 0.4)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 10,
                      padding: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      zIndex: 60,
                      minWidth: 140,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.85)'
                    }}
                  >
                    <div style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: '#ff2d55', padding: '4px 8px', letterSpacing: '0.12em', fontWeight: 700 }}>
                      QUALITY // SELECTOR
                    </div>
                    {[
                      { id: '1080p', label: '1080p FHD', badge: 'HIGH' },
                      { id: '720p', label: '720p HD', badge: 'MED' },
                      { id: '480p', label: '480p SD', badge: 'LOW' },
                      { id: 'auto', label: 'Auto Stream', badge: 'AUTO' }
                    ].map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQualityChange(q.id)}
                        style={{
                          padding: '6px 10px',
                          border: 'none',
                          borderRadius: 6,
                          backgroundColor: quality === q.id ? 'rgba(255,45,85,0.2)' : 'transparent',
                          color: quality === q.id ? '#ff2d55' : '#ffffff',
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          fontWeight: quality === q.id ? 700 : 400,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          textAlign: 'left'
                        }}
                      >
                        <span>{q.label}</span>
                        <span style={{
                          fontSize: '0.62rem',
                          padding: '2px 5px',
                          borderRadius: 4,
                          backgroundColor: quality === q.id ? 'rgba(255,45,85,0.35)' : 'rgba(255,255,255,0.1)',
                          color: quality === q.id ? '#fff' : 'rgba(255,255,255,0.5)',
                          fontWeight: 700
                        }}>
                          {q.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 34,
                    right: 0,
                    backgroundColor: 'rgba(12, 12, 16, 0.95)',
                    border: '1px solid rgba(255, 45, 85, 0.3)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 10,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    zIndex: 50,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
                  }}
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      style={{
                        padding: '6px 14px',
                        border: 'none',
                        borderRadius: 6,
                        backgroundColor: playbackRate === s ? 'rgba(255,45,85,0.2)' : 'transparent',
                        color: playbackRate === s ? '#ff2d55' : '#ffffff',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: playbackRate === s ? 700 : 400,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share Video (Copy Link)"
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                padding: 2
              }}
            >
              <Share2 size={16} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                padding: 2
              }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Cyberpunk Share HUD Toast */}
      {copiedToast && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(12, 12, 18, 0.95)',
            border: '1px solid #ff2d55',
            boxShadow: '0 0 25px rgba(255, 45, 85, 0.5)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 10,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            fontWeight: 700,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(16px)'
          }}
        >
          <Share2 size={14} color="#ff2d55" />
          <span>LINK COPIED TO CLIPBOARD</span>
        </div>
      )}

      {/* Cyberpunk CSS Keyframes */}
      <style>{`
        @keyframes fuiPlayerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fuiPlayerSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes fuiPlayerPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
