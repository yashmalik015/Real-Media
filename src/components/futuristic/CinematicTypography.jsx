import React, { useEffect, useRef, useState } from 'react';

// ── 1. HERO TITLE: 3D Character Assembly + Light Sweep + Mouse Perspective ──
export function AnimatedHeroTitle({ text = "WE ENGINEER THE DIGITAL FUTURE" }) {
  const containerRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * -20;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const words = text.split(' ');
  let globalCharIndex = 0;

  return (
    <h1
      ref={containerRef}
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(4.2rem, 7.8vw, 8rem)',
        lineHeight: 0.92,
        letterSpacing: '0.03em',
        color: '#ffffff',
        margin: '0 0 28px 0',
        perspective: 1000,
        transform: `rotateY(${mouseOffset.x * 0.4}deg) rotateX(${mouseOffset.y * 0.4}deg)`,
        transition: 'transform 0.15s ease-out',
        willChange: 'transform'
      }}
    >
      {words.map((word, wordIdx) => {
        const isHighlight = word === 'FUTURE' || word === 'DIGITAL';
        return (
          <span
            key={wordIdx}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              marginRight: '0.24em',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ display: 'inline-block' }}>
              {word.split('').map((char, charIdx) => {
                const delay = globalCharIndex * 35;
                globalCharIndex++;

                return (
                  <span
                    key={charIdx}
                    style={{
                      display: 'inline-block',
                      color: isHighlight ? '#ff2d55' : '#ffffff',
                      textShadow: isHighlight
                        ? '0 0 35px rgba(255, 45, 85, 0.8), 0 0 15px rgba(255, 45, 85, 0.4)'
                        : '0 10px 30px rgba(0,0,0,0.8)',
                      opacity: isVisible ? 1 : 0,
                      filter: isVisible ? 'blur(0px)' : 'blur(20px)',
                      transform: isVisible
                        ? 'translate3d(0, 0, 0) rotateX(0deg) scale(1)'
                        : 'translate3d(0, 80px, 0) rotateX(-90deg) scale(0.8)',
                      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                      willChange: 'transform, opacity, filter'
                    }}
                    className="hero-letter"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </span>
        );
      })}
    </h1>
  );
}

// ── 2. SECTION TITLES: Unique Animation Reveal Style per Section ──
export function AnimatedSectionTitle({ label, title, sub, animationStyle = 'services' }) {
  const titleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  const renderAnimatedTitle = () => {
    const chars = title.split('');

    // Style 1: Vertical Mask Reveal (Services)
    if (animationStyle === 'services') {
      return (
        <div style={{ overflow: 'hidden', paddingBottom: 6 }}>
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {title}
          </div>
        </div>
      );
    }

    // Style 2: Split-Word Flip (Portfolio)
    if (animationStyle === 'portfolio') {
      const words = title.split(' ');
      return (
        <div style={{ perspective: 800 }}>
          {words.map((word, wIdx) => (
            <span
              key={wIdx}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'rotateY(0deg) translateY(0)' : 'rotateY(45deg) translateY(40px)',
                filter: isVisible ? 'blur(0px)' : 'blur(10px)',
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${wIdx * 120}ms`
              }}
            >
              {word}
            </span>
          ))}
        </div>
      );
    }

    // Style 3: Character Wave Ripple (Learning)
    if (animationStyle === 'learning') {
      return (
        <div>
          {chars.map((char, cIdx) => (
            <span
              key={cIdx}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(1.4)',
                color: isVisible ? (cIdx % 7 === 0 ? '#ff2d55' : '#ffffff') : '#ffffff',
                transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${cIdx * 25}ms`
              }}
            >
              {char}
            </span>
          ))}
        </div>
      );
    }

    // Style 4: 3D RotateX Flip (Pipeline / Process)
    if (animationStyle === 'pipeline') {
      return (
        <div style={{ perspective: 900 }}>
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'rotateX(0deg) translateY(0)' : 'rotateX(-90deg) translateY(50px)',
              transformOrigin: 'bottom center',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {title}
          </div>
        </div>
      );
    }

    // Style 5: Character Blur Assembly (Testimonials)
    if (animationStyle === 'testimonials') {
      return (
        <div>
          {chars.map((char, cIdx) => (
            <span
              key={cIdx}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                opacity: isVisible ? 1 : 0,
                filter: isVisible ? 'blur(0px)' : 'blur(16px)',
                transform: isVisible ? 'scale(1)' : 'scale(0.7)',
                transition: `all 0.6s ease-out ${cIdx * 20}ms`
              }}
            >
              {char}
            </span>
          ))}
        </div>
      );
    }

    // Style 6: 3D Perspective Roll (Pricing)
    if (animationStyle === 'pricing') {
      return (
        <div style={{ perspective: 1000 }}>
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateZ(0) rotateX(0deg)' : 'translateZ(-150px) rotateX(60deg)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {title}
          </div>
        </div>
      );
    }

    // Style 7: Blur-to-Sharp Liquid Reveal (Contact)
    return (
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          filter: isVisible ? 'blur(0px)' : 'blur(24px)',
          transform: isVisible ? 'scale(1)' : 'scale(1.08)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {title}
      </div>
    );
  };

  return (
    <div ref={titleRef} style={{ marginBottom: 24 }}>
      {label && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(255, 45, 85, 0.12)',
            border: '1px solid rgba(255, 45, 85, 0.4)',
            color: '#ff2d55',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease'
          }}
        >
          {label}
        </div>
      )}

      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
          letterSpacing: '0.04em',
          color: '#ffffff',
          margin: '16px 0 12px',
          lineHeight: 0.95
        }}
      >
        {renderAnimatedTitle()}
      </h2>

      {sub && (
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: 640,
            margin: '0 auto',
            fontSize: '1rem',
            lineHeight: 1.7,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            filter: isVisible ? 'blur(0px)' : 'blur(6px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 200ms'
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── 3. PARAGRAPH: Line-by-Line / Word Mask Reveal ──
export function AnimatedParagraph({ children, delay = 0, style = {} }) {
  const pRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (pRef.current) observer.observe(pRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p
      ref={pRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
        filter: isVisible ? 'blur(0px)' : 'blur(8px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style
      }}
    >
      {children}
    </p>
  );
}

// ── 4. BUTTON TYPOGRAPHY: Dual-Layer Slide Roll on Hover ──
export function AnimatedButtonText({ label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        height: '1.2em',
        lineHeight: '1.2em'
      }}
    >
      <span
        style={{
          display: 'block',
          transform: hovered ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {label}
      </span>
      <span
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          display: 'block',
          color: '#ff2d55',
          transform: hovered ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {label}
      </span>
    </span>
  );
}

// ── 5. NUMBERS: Odometer Roll Count-up with Scale Glow ──
export function AnimatedCounter({ value, suffix = '', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const num = parseInt(value, 10);
    if (isNaN(num)) return;

    let start = 0;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = num / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.4rem',
          color: '#ff2d55',
          letterSpacing: '0.05em',
          transform: isVisible ? 'scale(1)' : 'scale(0.7)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {typeof value === 'number' || !isNaN(parseInt(value, 10)) ? count : value}
        {suffix}
      </div>
      {label && (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
          {label}
        </div>
      )}
    </div>
  );
}
