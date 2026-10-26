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
  ExternalLink
} from 'lucide-react';
import { mediaUrl, optimizedMediaUrl } from '../../api.js';

export function FuturisticVideoPlayer({
  src = '',
  poster = '',
  title = '',
  autoPlay = false,
  onEnded,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  // Normalize source URL
  const rawUrl = (src || '').trim();
  const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
  const isDrive = rawUrl.includes('drive.google.com');
  const isExternalEmbed = isYouTube || isDrive;

  // Optimized video source (uses Cloudinary auto-compression & faststart if applicable)
  const videoSrc = !isExternalEmbed && rawUrl ? optimizedMediaUrl(rawUrl, { width: 1920, quality: 'auto' }) : '';

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

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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
      videoRef.current.load();
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
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onDurationChange={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onProgress={handleProgress}
        onWaiting={() => setIsLoading(true)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={(e) => {
          setIsLoading(false);
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

      {/* Futuristic Loading / Buffering Animation */}
      {isLoading && !hasError && (
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
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => skipTime(10)}
              title="Skip +10s"
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
                style={{
                  width: 60,
                  height: 4,
                  accentColor: '#ff2d55',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Time Stamp (Monospace) */}
            <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.05em' }}>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{formatTime(currentTime)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Actions: Speed, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            {/* Speed Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
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
