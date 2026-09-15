import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#050508',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ color: '#ff2d55', marginBottom: '1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            SYSTEM MALFUNCTION
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', maxWidth: '600px', marginBottom: '2rem' }}>
            An unexpected error occurred in the application layer. The engineering team has been notified. Please return to the command center.
          </p>
          {this.state.error && (
            <div style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', maxWidth: '800px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#ff2d55', textAlign: 'left' }}>
              {this.state.error.toString()}
            </div>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 32px',
              backgroundColor: '#ff2d55',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 0 20px rgba(255, 45, 85, 0.4)'
            }}
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
