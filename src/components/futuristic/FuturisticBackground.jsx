import React, { useEffect, useRef } from 'react';

export function FuturisticBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Lightweight 3D Nodes (Reduced from 45 to 18 for peak 60FPS performance)
    const numNodes = 18;
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 800,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(255, 45, 85, ' : 'rgba(255, 255, 255, '
      });
    }

    let animId;
    let isPaused = false;

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isPaused) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render lightweight floating nodes & connecting constellation lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        const depthScale = 1 - n.z / 1000;
        const alpha = Math.max(0.2, depthScale * 0.7);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}${alpha})`;
        ctx.fill();

        // Connect nearby nodes with crisp lines (no shadowBlur)
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(255, 45, 85, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#030304'
      }}
    >
      {/* High-Performance Hardware-Accelerated Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 45, 85, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
          transform: 'translate3d(0,0,0)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 45, 85, 0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
          transform: 'translate3d(0,0,0)',
          pointerEvents: 'none'
        }}
      />

      {/* Cyber Subtle Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 45, 85, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 45, 85, 0.02) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          pointerEvents: 'none'
        }}
      />

      {/* Lightweight Node Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Subtle Noise Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 0)',
          backgroundSize: '4px 4px',
          opacity: 0.25,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
