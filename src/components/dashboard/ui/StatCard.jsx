import React from 'react';
import { playHoverSound } from '../../../utils/audio.js';

export function StatCard({ title, value, change, icon: Icon, color = '#ff2d55', subtext }) {
  return (
    <div
      onMouseEnter={playHoverSound}
      style={{
        position: 'relative',
        padding: 24,
        borderRadius: 20,
        backgroundColor: 'rgba(12, 12, 16, 0.75)',
        border: `1px solid ${color}33`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}
      className="dashboard-stat-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {title}
          </span>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#ffffff', margin: '4px 0 0', lineHeight: 1 }}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div style={{ padding: 12, borderRadius: 14, backgroundColor: `${color}15`, border: `1px solid ${color}40`, color }}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        {change && (
          <span style={{ color: change.startsWith('+') ? '#34c759' : '#ff3b30', fontWeight: 600, fontFamily: 'monospace' }}>
            {change}
          </span>
        )}
        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {subtext || 'Live DB Sync'}
        </span>
      </div>

      <style>{`
        .dashboard-stat-card:hover {
          transform: translateY(-4px);
          border-color: ${color}88 !important;
          box-shadow: 0 20px 45px ${color}33 !important;
        }
      `}</style>
    </div>
  );
}
