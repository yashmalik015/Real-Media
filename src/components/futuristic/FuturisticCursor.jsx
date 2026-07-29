import React, { useEffect, useRef, useState } from 'react';

export function FuturisticCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverText, setHoverText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const vel = useRef({ x: 0, y: 0 });
  const particles = useRef([]);

  useEffect(() => {
    // Hide default cursor on desktop
    const isMobile = matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    document.body.style.cursor = 'none';

    const handleMouseMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };

      // Magnetic hover check
      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = hoveredEl?.closest('button, a, .svc-card, .hero-card, input, select, textarea, [data-magnetic="true"]');

      if (interactive) {
        setIsHovering(true);
        const rect = interactive.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Gentle magnetic pull
        target.current.x = e.clientX + (centerX - e.clientX) * 0.25;
        target.current.y = e.clientY + (centerY - e.clientY) * 0.25;

        const customLabel = interactive.getAttribute('data-cursor-label');
        setHoverText(customLabel || '');
      } else {
        setIsHovering(false);
        setHoverText('');
      }

      // Add particle
      if (Math.random() < 0.35) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 1,
          size: Math.random() * 2.5 + 1
        });
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Canvas particle trail rendering loop
    const canvas = canvasRef.current;
    let ctx = null;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    let animId = null;
    const render = () => {
      // Interpolate cursor position smoothly
      vel.current.x = (target.current.x - pos.current.x) * 0.2;
      vel.current.y = (target.current.y - pos.current.y) * 0.2;

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      const speed = Math.hypot(vel.current.x, vel.current.y);
      const angle = Math.atan2(vel.current.y, vel.current.x);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0px) scale(${isClicking ? 0.7 : isHovering ? 1.5 : 1})`;
      }

      if (ringRef.current) {
        const stretch = Math.min(speed * 0.08, 0.4);
        const scaleX = (isHovering ? 1.8 : 1) + stretch;
        const scaleY = (isHovering ? 1.8 : 1) - stretch * 0.5;
        const rot = angle * (180 / Math.PI);

        ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0px) rotate(${rot}deg) scale(${scaleX}, ${scaleY})`;
      }

      // Draw particle trail
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.03;

          if (p.life <= 0) {
            particles.current.splice(i, 1);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 45, 85, ${p.life * 0.6})`;
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isHovering, isClicking]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998
        }}
      />
      {/* Target Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#ff2d55',
          boxShadow: '0 0 10px #ff2d55, 0 0 20px #ff2d55',
          pointerEvents: 'none',
          zIndex: 100000,
          willChange: 'transform',
          transition: 'width 0.2s, height 0.2s, background-color 0.2s'
        }}
      />
      {/* Outer HUD Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(255, 45, 85, 0.6)',
          boxShadow: '0 0 15px rgba(255, 45, 85, 0.25), inset 0 0 10px rgba(255, 45, 85, 0.15)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: isHovering ? 'blur(2px)' : 'none'
        }}
      >
        {hoverText && (
          <span
            style={{
              position: 'absolute',
              bottom: -24,
              fontSize: '0.65rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: '#ff2d55',
              whiteSpace: 'nowrap',
              textShadow: '0 0 8px rgba(255,45,85,0.8)'
            }}
          >
            {hoverText}
          </span>
        )}
      </div>
    </>
  );
}
