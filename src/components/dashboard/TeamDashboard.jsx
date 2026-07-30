import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Star,
  Inbox,
  Settings,
  Image as ImageIcon,
  Search,
  Bell,
  LogOut,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

import { DashboardOverview } from './pages/DashboardOverview.jsx';
import { PortfolioManager } from './pages/PortfolioManager.jsx';
import { CourseManager } from './pages/CourseManager.jsx';
import { TestimonialManager } from './pages/TestimonialManager.jsx';
import { RequestCRM } from './pages/RequestCRM.jsx';
import { SettingsPanel } from './pages/SettingsPanel.jsx';
import { MediaLibrary } from './pages/MediaLibrary.jsx';

import { playClickSound, playHoverSound } from '../../utils/audio.js';
import { api } from '../../api.js';

export function TeamDashboard({ user, onBack, showToast, onPortfolioChanged }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [analytics, setAnalytics] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [courses, setCourses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({});
  const [activities, setActivities] = useState([]);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      const [analyticsRes, portfolioRes, testimonialsRes, coursesRes, inquiriesRes, settingsRes, actRes] = await Promise.all([
        api.getAnalytics().catch(() => ({ analytics: {} })),
        api.getPublicPortfolio().catch(() => ({ portfolio: [] })),
        api.getAllTestimonials().catch(() => ({ testimonials: [] })),
        api.getAllCourses().catch(() => ({ courses: [] })),
        api.getInquiries().catch(() => ({ inquiries: [] })),
        api.getSettings().catch(() => ({ settings: {} })),
        api.getActivities().catch(() => ({ activities: [] }))
      ]);

      setAnalytics(analyticsRes.analytics || {});
      setPortfolio(portfolioRes.portfolio || []);
      setTestimonials(testimonialsRes.testimonials || []);
      setCourses(coursesRes.courses || []);
      setInquiries(inquiriesRes.inquiries || []);
      setSettings(settingsRes.settings || {});
      setActivities(actRes.activities || []);
    } catch (e) {
      showToast(e.message || 'Failed to sync with MongoDB database.');
    }
  }, [showToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Global Search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.globalSearch(searchQuery);
        setSearchResults(res.results || []);
        setShowSearchDropdown(true);
      } catch (_err) {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio CMS', icon: FolderGit2, badge: portfolio.length },
    { id: 'courses', label: 'Courses LMS', icon: BookOpen, badge: courses.length },
    { id: 'testimonials', label: 'Testimonials', icon: Star, badge: testimonials.length },
    { id: 'requests', label: 'Client Requests', icon: Inbox, badge: inquiries.filter((i) => i.status === 'New').length || undefined, badgeColor: '#ff2d55' },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#07070a', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 280,
          backgroundColor: 'rgba(10, 10, 14, 0.95)',
          borderRight: '1px solid rgba(255, 45, 85, 0.25)',
          backdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ padding: '0 12px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 20 }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em' }}>
              ADMIN CONTROL CENTER
            </span>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ffffff', margin: '4px 0 0', letterSpacing: '0.04em' }}>
              ASSETS WEBER
            </h1>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playClickSound();
                    setActiveNav(item.id);
                  }}
                  onMouseEnter={playHoverSound}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    backgroundColor: isActive ? 'rgba(255, 45, 85, 0.15)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(255, 45, 85, 0.4)' : 'transparent'}`,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={18} color={isActive ? '#ff2d55' : 'rgba(255,255,255,0.65)'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge !== 0 && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        backgroundColor: item.badgeColor || 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Back to Platform */}
        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255, 45, 85, 0.2)', border: '1px solid #ff2d55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#ff2d55' }}>
              {(user?.name || 'Admin').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Team Leader'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ff2d55', fontFamily: 'monospace' }}>MongoDB Sync Active</div>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onBack();
            }}
            onMouseEnter={playHoverSound}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <ArrowLeft size={16} /> Exit to Main Website
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar with Global Search & Quick Notifications */}
        <header
          style={{
            height: 72,
            padding: '0 32px',
            backgroundColor: 'rgba(10, 10, 14, 0.8)',
            borderBottom: '1px solid rgba(255, 45, 85, 0.2)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Global Search Input */}
          <div style={{ position: 'relative', width: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (Portfolio, Courses, CRM)..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 40px',
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />

            {/* Instant Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(14, 14, 20, 0.95)',
                  border: '1px solid rgba(255, 45, 85, 0.4)',
                  borderRadius: 16,
                  padding: 12,
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                  zIndex: 999
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#ff2d55', fontFamily: 'monospace', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
                  SEARCH RESULTS ({searchResults.length})
                </div>
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                      if (res.type === 'Portfolio') setActiveNav('portfolio');
                      if (res.type === 'Course') setActiveNav('courses');
                      if (res.type === 'Testimonial') setActiveNav('testimonials');
                      if (res.type === 'Request') setActiveNav('requests');
                    }}
                    style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    className="search-item-hover"
                  >
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{res.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{res.subtitle}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, backgroundColor: 'rgba(255,45,85,0.2)', color: '#ff2d55', fontFamily: 'monospace' }}>
                      {res.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notification Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveNav('requests')}>
              <Bell size={20} color="rgba(255,255,255,0.8)" />
              {inquiries.filter((i) => i.status === 'New').length > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff2d55', boxShadow: '0 0 10px #ff2d55' }} />
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Rendering */}
        <div style={{ padding: 32, flex: 1 }}>
          {activeNav === 'dashboard' && (
            <DashboardOverview
              analytics={analytics}
              portfolio={portfolio}
              courses={courses}
              inquiries={inquiries}
              testimonials={testimonials}
              activities={activities}
              onNavigateTab={(tab) => setActiveNav(tab)}
            />
          )}

          {activeNav === 'portfolio' && (
            <PortfolioManager
              portfolio={portfolio}
              onLoad={loadAllData}
              showToast={showToast}
            />
          )}

          {activeNav === 'courses' && (
            <CourseManager
              courses={courses}
              onLoad={loadAllData}
              showToast={showToast}
            />
          )}

          {activeNav === 'testimonials' && (
            <TestimonialManager
              testimonials={testimonials}
              onLoad={loadAllData}
              showToast={showToast}
            />
          )}

          {activeNav === 'requests' && (
            <RequestCRM
              inquiries={inquiries}
              onLoad={loadAllData}
              showToast={showToast}
              settings={settings}
            />
          )}

          {activeNav === 'media' && (
            <MediaLibrary
              showToast={showToast}
            />
          )}

          {activeNav === 'settings' && (
            <SettingsPanel
              settings={settings}
              onLoad={loadAllData}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      <style>{`
        .search-item-hover:hover {
          background-color: rgba(255, 45, 85, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
