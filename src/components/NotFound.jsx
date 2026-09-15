import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function NotFound() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1, ease: "power2.out" }
    );
    
    gsap.fromTo(textRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
        zIndex: 0
      }}></div>

      <div ref={textRef} style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          fontFamily: "'Bebas Neue', sans-serif", 
          fontSize: '8rem', 
          lineHeight: '1',
          letterSpacing: '0.05em', 
          margin: '0 0 1rem 0',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontFamily: "'Inter', sans-serif", 
          fontSize: '1.5rem', 
          fontWeight: '300',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          color: '#a0a0a0'
        }}>
          Coordinates Not Found
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontFamily: 'monospace', 
          maxWidth: '500px', 
          margin: '0 auto 3rem auto',
          lineHeight: '1.6'
        }}>
          The sector you are looking for has been purged from the archives or never existed. Return to base to recalibrate.
        </p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '16px 40px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            fontFamily: 'monospace',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Return to Hub
        </button>
      </div>
    </div>
  );
}
