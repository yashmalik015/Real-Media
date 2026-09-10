import React, { useEffect, useRef, useState } from 'react';

// ── 1. HERO TITLE: 3D Character Assembly + Light Sweep + High Performance ──
export function AnimatedHeroTitle({ text = "WE ENGINEER THE DIGITAL FUTURE" }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Safety guarantee: Ensure title is always visible
    const timer = setTimeout(() => setIsVisible(true), 150);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const words = text.split(' ');
  let globalCharIndex = 0;

  return (
    <h1
      ref={containerRef}
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(3.8rem, 7.5vw, 7.8rem)',
        lineHeight: 0.92,
        letterSpacing: '0.03em',
        color: '#ffffff',
        margin: '0 0 28px 0',
        perspective: 1000
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
                const delay = globalCharIndex * 25;
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
                      opacity: isVisible ? 1 : 0.85,
                      filter: isVisible ? 'blur(0px)' : 'none',
                      transform: isVisible
                        ? 'translate3d(0, 0, 0)'
                        : 'translate3d(0, 20px, 0)',
                      transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const renderAnimatedTitle = () => {
    const chars = title.split('');

    if (animationStyle === 'services') {
      return (
        <div style={{ overflow: 'hidden', paddingBottom: 6 }}>
          <div
            style={{
              opacity: isVisible ? 1 : 0.8,
              transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {title}
          </div>
        </div>
      );
    }

    if (animationStyle === 'portfolio') {
      const words = title.split(' ');
      return (
        <div>
          {words.map((word, wIdx) => (
            <span
              key={wIdx}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: isVisible ? 1 : 0.8,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `all 0.5s ease-out ${wIdx * 50}ms`
              }}
            >
              {word}
            </span>
          ))}
        </div>
      );
    }

    if (animationStyle === 'learning') {
      return (
        <div
          style={{
            opacity: isVisible ? 1 : 0.8,
            transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {title}
        </div>
      );
    }

    if (animationStyle === 'pipeline') {
      return (
        <div
          style={{
            opacity: isVisible ? 1 : 0.8,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {title}
        </div>
      );
    }

    return (
      <div
        style={{
          opacity: isVisible ? 1 : 0.8,
          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
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
            opacity: isVisible ? 1 : 0.8,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease'
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
            color: 'rgba(255, 255, 255, 0.65)',
            maxWidth: 640,
            margin: '0 auto',
            fontSize: '1rem',
            lineHeight: 1.7,
            opacity: isVisible ? 1 : 0.8,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── 3. PARAGRAPH: Smooth Reveal ──
export function AnimatedParagraph({ children, delay = 0, style = {} }) {
  const pRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (pRef.current) observer.observe(pRef.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <p
      ref={pRef}
      style={{
        opacity: isVisible ? 1 : 0.85,
        transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
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
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const num = parseInt(value, 10);
    if (isNaN(num)) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 25;
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
          transform: isVisible ? 'scale(1)' : 'scale(0.85)',
          opacity: isVisible ? 1 : 0.85,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {typeof value === 'number' || !isNaN(parseInt(value, 10)) ? count : value}
        {suffix}
      </div>
      {label && (
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: 4 }}>
          {label}
        </div>
      )}
    </div>
  );
}
