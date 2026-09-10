import React, { useEffect, useRef } from 'react';

export function FuturisticCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only run on non-touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animId = null;
    let isHidden = false;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isHidden) {
        // Smooth interpolation
        pos.current.x += (target.current.x - pos.current.x) * 0.25;
        pos.current.y += (target.current.y - pos.current.y) * 0.25;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0px)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0px)`;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Precision Reticle Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -3,
          left: -3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#ff2d55',
          pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: '0 0 8px #ff2d55',
          willChange: 'transform'
        }}
      />

      {/* Cyber Reticle Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: -16,
          left: -16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 45, 85, 0.5)',
          pointerEvents: 'none',
          zIndex: 99998,
          boxShadow: '0 0 12px rgba(255, 45, 85, 0.25)',
          willChange: 'transform'
        }}
      />
    </>
  );
}
