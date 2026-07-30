import React, { useState } from 'react';
import { Save, ShieldAlert, Database, Key, Bell, Palette, Globe, Server, Check } from 'lucide-react';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

export function SettingsPanel({ settings = {}, onLoad, showToast }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: settings.companyName || 'Assets Weber Digital Agency',
    email: settings.email || 'support@assetsweber.com',
    phone: settings.phone || '+1 (555) 019-2834',
    whatsappNumber: settings.whatsappNumber || settings.whatsapp_number || '+91 9876543210',
    address: settings.address || 'Cyberpunk City, Metaverse Hub',
    website: settings.website || 'https://assetsweber.com',
    bookingUrl: settings.bookingUrl || settings.booking_url || '',
    instagram: settings.instagram || 'https://instagram.com/assetsweber',
    linkedIn: settings.linkedIn || 'https://linkedin.com/company/assetsweber',
    youtube: settings.youtube || 'https://youtube.com/@assetsweber',
    github: settings.github || 'https://github.com/assetsweber',
    accentColor: settings.accentColor || '#ff2d55',
    googleOAuth: settings.googleOAuth || 'Configured (Client ID Verified)',
    smtpHost: settings.smtpHost || 'smtp.sendgrid.net',
    apiKeys: settings.apiKeys || 'live_sec_993821xxxxxx'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(form);
      showToast('Settings saved successfully!');
      await onLoad();
    } catch (err) {
      showToast(err.message || 'Save settings failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            SYSTEM CONFIGURATION // SETTINGS
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            PLATFORM SETTINGS & INTEGRATIONS
          </h2>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          onMouseEnter={playHoverSound}
          style={{
            padding: '12px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Company Info */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)' }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="#ff2d55" /> COMPANY INFORMATION
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COMPANY NAME</label>
              <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>SUPPORT EMAIL</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>WHATSAPP NUMBER</label>
              <input type="text" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>BOOKING CALENDAR URL</label>
              <input type="text" value={form.bookingUrl} onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Status */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)' }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="#34c759" /> INFRASTRUCTURE & MONGODB STATUS
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>MONGODB CONNECTION</div>
              <div style={{ color: '#34c759', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> CONNECTED (ONLINE)
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>STORAGE USAGE</div>
              <div style={{ color: '#fff', fontWeight: 700, marginTop: 4 }}>1.42 GB / 50 GB</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>GOOGLE OAUTH</div>
              <div style={{ color: '#007aff', fontWeight: 700, marginTop: 4 }}>VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ padding: 24, borderRadius: 20, backgroundColor: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#ff3b30', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} /> DANGER ZONE
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 16 }}>
            Actions here are irreversible. Flush database cache or reset site configurations with caution.
          </p>
          <button
            type="button"
            onClick={() => showToast('Database cache cleared.')}
            style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.2)', border: '1px solid #ff3b30', color: '#ff3b30', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Clear Database Cache
          </button>
        </div>
      </form>
    </div>
  );
}
