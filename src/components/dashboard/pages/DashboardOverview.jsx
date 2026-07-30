import React from 'react';
import { FolderGit2, BookOpen, Users, Star, Inbox, CheckCircle2, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { StatCard } from '../ui/StatCard.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';

export function DashboardOverview({
  analytics = {},
  portfolio = [],
  courses = [],
  inquiries = [],
  testimonials = [],
  activities = [],
  onNavigateTab
}) {
  const stats = [
    { title: 'Total Portfolio Projects', value: analytics.portfolioCount || portfolio.length || 0, change: '+12%', icon: FolderGit2, color: '#ff2d55' },
    { title: 'Total Courses', value: analytics.courseCount || courses.length || 0, change: '+4', icon: BookOpen, color: '#007aff' },
    { title: 'Total Students', value: analytics.totalStudents || 1240, change: '+18%', icon: Users, color: '#af52de' },
    { title: 'Total Reviews', value: analytics.testimonialCount || testimonials.length || 0, change: '5.0 ★', icon: Star, color: '#ffcc00' },
    { title: 'Pending Requests', value: analytics.newInquiries || inquiries.filter(i => i.status === 'New').length || 0, change: 'Action Needed', icon: Inbox, color: '#ff9500' },
    { title: 'Completed Projects', value: analytics.completedProjects || 84, change: '+95%', icon: CheckCircle2, color: '#34c759' },
    { title: 'Revenue', value: `$${(analytics.revenue || 148500).toLocaleString()}`, change: '+24%', icon: DollarSign, color: '#30b0c7' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Banner Card */}
      <div
        style={{
          position: 'relative',
          padding: 32,
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.15) 0%, rgba(12, 12, 16, 0.85) 100%)',
          border: '1px solid rgba(255, 45, 85, 0.35)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            SYSTEM COMMAND CENTER // LIVE
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#ffffff', margin: '6px 0 12px', letterSpacing: '0.04em' }}>
            WELCOME TO ASSETS WEBER CONTROL ROOM
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', maxWidth: 680, lineHeight: 1.6 }}>
            All sub-systems, databases, and media pipelines are fully operational. Monitor live telemetry, manage client project inquiries, and oversee course LMS content from this hub.
          </p>
        </div>
      </div>

      {/* Animated Futuristic Statistic Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Main Grid: Recent Content & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Recent Portfolio Uploads */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
              RECENT PORTFOLIO UPLOADS
            </h4>
            <button
              onClick={() => { playClickSound(); onNavigateTab('portfolio'); }}
              style={{ background: 'none', border: 'none', color: '#ff2d55', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {portfolio.slice(0, 4).map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <img src={item.mediaUrl || item.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80'} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{item.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Client Requests */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
              LATEST CLIENT REQUESTS
            </h4>
            <button
              onClick={() => { playClickSound(); onNavigateTab('requests'); }}
              style={{ background: 'none', border: 'none', color: '#ff2d55', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Manage CRM <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inquiries.slice(0, 4).map((inq, i) => (
              <div key={inq.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{inq.name} ({inq.company || 'Client'})</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{inq.service} • {inq.budget || '$1,000+'}</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: 6, backgroundColor: inq.status === 'New' ? 'rgba(255, 45, 85, 0.2)' : 'rgba(52, 199, 89, 0.2)', color: inq.status === 'New' ? '#ff2d55' : '#34c759', fontWeight: 600 }}>
                  {inq.status || 'New'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)', gridColumn: 'span 1' }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#ffffff', margin: '0 0 20px' }}>
            SYSTEM ACTIVITY TIMELINE
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.length > 0 ? (
              activities.slice(0, 5).map((act, i) => (
                <div key={act.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff2d55', marginTop: 6, boxShadow: '0 0 8px #ff2d55' }} />
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>{act.action}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{act.details}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No recent system activities recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
