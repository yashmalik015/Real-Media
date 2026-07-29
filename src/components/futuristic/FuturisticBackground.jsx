import React, { useEffect, useRef } from 'react';

export function FuturisticBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating 3D Nodes
    const numNodes = 45;
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(255, 45, 85, ' : 'rgba(255, 255, 255, '
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    let tick = 0;

    const render = () => {
      tick += 0.005;

      // Dark background fill
      ctx.fillStyle = '#030304';
      ctx.fillRect(0, 0, width, height);

      // Radial Volumetric Ambient Red Glows (Slowly pulsing)
      const glowX1 = width * 0.2 + Math.sin(tick) * 80 + (mouseX - width / 2) * 0.05;
      const glowY1 = height * 0.3 + Math.cos(tick * 0.8) * 80 + (mouseY - height / 2) * 0.05;

      const grad1 = ctx.createRadialGradient(glowX1, glowY1, 10, glowX1, glowY1, width * 0.45);
      grad1.addColorStop(0, 'rgba(255, 45, 85, 0.16)');
      grad1.addColorStop(0.5, 'rgba(255, 45, 85, 0.04)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glowX2 = width * 0.8 - Math.cos(tick * 1.2) * 100;
      const glowY2 = height * 0.7 - Math.sin(tick * 0.9) * 100;

      const grad2 = ctx.createRadialGradient(glowX2, glowY2, 10, glowX2, glowY2, width * 0.5);
      grad2.addColorStop(0, 'rgba(255, 45, 85, 0.12)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Render perspective grid line sweep
      ctx.strokeStyle = 'rgba(255, 45, 85, 0.035)';
      ctx.lineWidth = 1;

      const gridSize = 90;
      const gridOffsetX = (mouseX * 0.02) % gridSize;
      const gridOffsetY = (tick * 20 + mouseY * 0.02) % gridSize;

      for (let x = gridOffsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = gridOffsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating nodes & connecting constellation lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        const depthScale = 1 - n.z / 1200;
        const alpha = Math.max(0.1, depthScale * 0.7);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff2d55';
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(255, 45, 85, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
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
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* Animated Subtle Noise Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '4px 4px',
          opacity: 0.25,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
