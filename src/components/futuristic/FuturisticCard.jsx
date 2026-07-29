import React, { useEffect, useRef, useState } from 'react';

const VARIANTS = [
  'rotate3d',
  'scale',
  'flip',
  'blur',
  'clip',
  'glass',
  'staggerUp',
  'slideOffset',
  'depth'
];

export function FuturisticCard({
  children,
  variant,
  index = 0,
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  hasTilt = true,
  hasGlow = true
}) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Auto pick variant by index if not specified
  const chosenVariant = variant || VARIANTS[index % VARIANTS.length];

  // Scroll Trigger Entrance Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.12 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Mouse 3D Tilt & Glass Reflection
  const handleMouseMove = (e) => {
    if (!cardRef.current || !hasTilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setMousePos({ x: percentX, y: percentY });

    // Subtle 3D tilt (5° to 8° max)
    const rotateX = ((percentY - 50) / 50) * -6;
    const rotateY = ((percentX - 50) / 50) * 6;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    if (onMouseLeave) onMouseLeave(e);
  };

  // Entrance Styles based on Variant
  const getEntranceStyles = () => {
    const delay = index * 90; // Stagger timing

    if (!isVisible) {
      switch (chosenVariant) {
        case 'rotate3d':
          return {
            opacity: 0,
            transform: 'translateY(60px) rotateX(-20deg) scale(0.92)',
            filter: 'blur(10px)'
          };
        case 'scale':
          return {
            opacity: 0,
            transform: 'scale(0.88)',
            filter: 'blur(8px)'
          };
        case 'flip':
          return {
            opacity: 0,
            transform: 'perspective(1000px) rotateY(-18deg) translateY(40px)',
            filter: 'blur(10px)'
          };
        case 'blur':
          return {
            opacity: 0,
            transform: 'scale(0.96)',
            filter: 'blur(20px)'
          };
        case 'clip':
          return {
            opacity: 0,
            transform: 'translateY(40px)',
            clipPath: 'inset(0 0 100% 0)'
          };
        case 'glass':
          return {
            opacity: 0,
            transform: 'translateY(50px) scale(0.95)',
            backdropFilter: 'blur(0px)'
          };
        case 'staggerUp':
          return {
            opacity: 0,
            transform: 'translateY(70px)',
            filter: 'blur(6px)'
          };
        case 'slideOffset':
          return {
            opacity: 0,
            transform: 'translateX(-40px) translateY(30px)',
            filter: 'blur(8px)'
          };
        case 'depth':
        default:
          return {
            opacity: 0,
            transform: 'translateZ(-100px) translateY(50px)',
            filter: 'blur(12px)'
          };
      }
    }

    // Visible / Final State
    return {
      opacity: 1,
      transform: isHovered
        ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-8px) scale(1.02)`
        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
      filter: 'blur(0px)',
      clipPath: 'inset(0 0 0% 0)',
      backdropFilter: 'blur(24px)',
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, clip-path 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, box-shadow 0.4s ease`
    };
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`futuristic-card ${className}`}
      style={{
        position: 'relative',
        borderRadius: 24,
        backgroundColor: 'rgba(12, 12, 16, 0.8)',
        border: isHovered
          ? '1px solid rgba(255, 45, 85, 0.65)'
          : '1px solid rgba(255, 45, 85, 0.25)',
        boxShadow: isHovered
          ? '0 25px 60px rgba(255, 45, 85, 0.28), inset 0 0 20px rgba(255, 45, 85, 0.15)'
          : '0 15px 40px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform, opacity, filter',
        ...getEntranceStyles(),
        ...style
      }}
    >
      {/* Glass Reflection Light Follower */}
      {hasGlow && isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 45, 85, 0.2), transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

// ── Ultra Premium 2045 OS Empty State Component ──
export function FuturisticEmptyState({ icon = "⚡", title = "No Data Found", sub = "There are no records in the system database yet.", actionText, onAction }) {
  return (
    <div
      style={{
        width: '100%',
        padding: '60px 32px',
        textAlign: 'center',
        borderRadius: 28,
        backgroundColor: 'rgba(12, 12, 16, 0.7)',
        border: '1px border-dashed rgba(255, 45, 85, 0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '24px 0'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 45, 85, 0.12)',
          border: '1px solid rgba(255, 45, 85, 0.4)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '2.2rem',
          marginBottom: 20,
          boxShadow: '0 0 30px rgba(255, 45, 85, 0.3)'
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2rem',
          letterSpacing: '0.04em',
          color: '#ffffff',
          margin: '0 0 8px 0'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.95rem',
          maxWidth: 460,
          lineHeight: 1.6,
          margin: '0 0 24px 0'
        }}
      >
        {sub}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '14px 32px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
            cursor: 'pointer'
          }}
        >
          {actionText} →
        </button>
      )}
    </div>
  );
}
