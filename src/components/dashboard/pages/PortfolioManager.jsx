import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit3, Trash2, ExternalLink, Image, Video, Sparkles, ChevronDown, ChevronUp, UploadCloud } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl, optimizedMediaUrl } from '../../../api.js';

export function PortfolioManager({ portfolio = [], onLoad, showToast, onPortfolioChanged }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(true); // Always open inline form panel by default!
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    title: '',
    slug: '',
    client: '',
    industry: '',
    category: 'Video Editing',
    description: '',
    longDescription: '',
    technologies: '',
    tags: '',
    outcome: '',
    projectUrl: '',
    githubUrl: '',
    behanceUrl: '',
    dribbbleUrl: '',
    featured: false,
    seoTitle: '',
    seoDescription: ''
  };

  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);

  const categories = ['All', 'Video Editing', 'Web Development', 'App Development', 'Digital Marketing', 'Graphic Design', 'UI/UX Design', 'VFX'];

  const filteredItems = portfolio.filter((item) => {
    const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.client?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.service === categoryFilter || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Featured' ? item.featured : !item.featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      client: item.client || '',
      industry: item.industry || '',
      category: item.service || item.category || 'Video Editing',
      description: item.description || '',
      longDescription: item.longDescription || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      outcome: item.outcome || '',
      projectUrl: item.projectUrl || '',
      githubUrl: item.githubUrl || '',
      behanceUrl: item.behanceUrl || '',
      dribbbleUrl: item.dribbbleUrl || '',
      featured: Boolean(item.featured),
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.title || !form.description) {
      showToast('Project title and short description are required.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('service', form.category);
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'technologies' || k === 'tags') {
          const arr = typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : (v || []);
          fd.append(k, JSON.stringify(arr));
        } else if (k !== 'category') {
          fd.append(k, v);
        } else {
          fd.append('category', v);
        }
      });
      if (coverFile) fd.append('media', coverFile);
      if (coverFile) fd.append('thumbnail', coverFile);
      if (videoFile) fd.append('video', videoFile);
      if (mobileFile) fd.append('mobileScreenshot', mobileFile);
      if (desktopFile) fd.append('desktopScreenshot', desktopFile);
      if (galleryFiles.length > 0) {
        Array.from(galleryFiles).forEach((f) => fd.append('gallery', f));
      }

      if (selectedItem) {
        await api.updatePortfolio(selectedItem.id, fd);
        showToast('Portfolio project updated successfully!');
      } else {
        await api.addPortfolioFull(fd);
        showToast('Portfolio project uploaded & published to live website!');
      }

      setIsModalOpen(false);
      setSelectedItem(null);
      setForm(initialForm);
      setCoverFile(null);
      setVideoFile(null);
      setGalleryFiles([]);
      await onLoad();
      await onPortfolioChanged?.();
    } catch (err) {
      showToast(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await api.deletePortfolio(id);
      showToast('Portfolio item deleted.');
      await onLoad();
      await onPortfolioChanged?.();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
      {/* Top Header & Statistics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            CMS MANAGEMENT // PORTFOLIO WORK
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            PORTFOLIO PROJECT MANAGER
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Upload new video reels, web builds, mobile apps, and case studies to display on the live website.
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setShowInlineForm(true);
            const el = document.getElementById('inline-portfolio-upload-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={playHoverSound}
          style={{
            padding: '14px 28px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255, 45, 85, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Plus size={20} /> + UPLOAD NEW PORTFOLIO WORK
        </button>
      </div>

      {/* INLINE ALWAYS-VISIBLE UPLOAD FORM CARD */}
      <div
        id="inline-portfolio-upload-form"
        style={{
          borderRadius: 24,
          backgroundColor: 'rgba(14, 14, 20, 0.95)',
          border: '1px solid rgba(255, 45, 85, 0.45)',
          padding: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(255, 45, 85, 0.15)',
          backdropFilter: 'blur(24px)'
        }}
      >
        <div
          onClick={() => setShowInlineForm(!showInlineForm)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255, 45, 85, 0.2)', border: '1px solid #ff2d55', display: 'grid', placeItems: 'center', color: '#ff2d55' }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#ffffff', margin: 0, letterSpacing: '0.04em' }}>
                UPLOAD NEW PORTFOLIO ITEM
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                Fill in the details below to add project video, images, and case studies to your website
              </span>
            </div>
          </div>

          <button
            style={{ padding: '8px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {showInlineForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showInlineForm ? 'Collapse Form' : 'Expand Form'}
          </button>
        </div>

        {showInlineForm && (
          <form onSubmit={handleSave} style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {/* Title */}
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{ fontSize: '0.78rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>PROJECT TITLE *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cyberpunk 2045 VFX Reel"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: 6, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Category / Service */}
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{ fontSize: '0.78rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>SERVICE CATEGORY *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(10, 10, 14, 0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: 6, fontSize: '0.9rem', outline: 'none' }}
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Client Name */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>CLIENT NAME</label>
              <input
                type="text"
                placeholder="e.g. Apex Cybernetics"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: 6, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Key Outcome */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>KEY OUTCOME / METRICS</label>
              <input
                type="text"
                placeholder="e.g. +340% Conversion & 4.2M Views"
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: 6, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>PROJECT DESCRIPTION *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the project overview, creative direction, technology used, and results..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: 6, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Cover File */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>COVER IMAGE / MEDIA FILE</label>
              <div style={{ marginTop: 6, padding: '16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,45,85,0.4)', textAlign: 'center', position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: coverFile ? '#ff2d55' : 'rgba(255,255,255,0.6)' }}>
                  {coverFile ? `Selected: ${coverFile.name}` : '📁 Click to select cover image or video'}
                </span>
              </div>
            </div>

            {/* Video File */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>OPTIONAL VIDEO REEL FILE</label>
              <div style={{ marginTop: 6, padding: '16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.2)', textAlign: 'center', position: 'relative' }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: videoFile ? '#ff2d55' : 'rgba(255,255,255,0.6)' }}>
                  {videoFile ? `Selected Video: ${videoFile.name}` : '🎥 Click to select video reel file'}
                </span>
              </div>
            </div>

            {/* Featured toggle */}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                id="inline-feat"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: '#ff2d55', cursor: 'pointer' }}
              />
              <label htmlFor="inline-feat" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                🌟 Feature this project on Website Home Page Showcase (Selected for Landing Page)
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                style={{ padding: '12px 24px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)'
                }}
              >
                {loading ? 'PUBLISHING TO DATABASE...' : '🚀 PUBLISH PORTFOLIO ITEM TO WEBSITE'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter Toolbar with Additional Quick Add Trigger */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', backgroundColor: 'rgba(12, 12, 16, 0.75)', padding: 16, borderRadius: 16, border: '1px solid rgba(255, 45, 85, 0.2)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or client..."
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
        >
          {categories.map((c) => (
            <option key={c} value={c} style={{ backgroundColor: '#0c0c10' }}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
        >
          <option value="All" style={{ backgroundColor: '#0c0c10' }}>All Status</option>
          <option value="Featured" style={{ backgroundColor: '#0c0c10' }}>Featured Only</option>
          <option value="Standard" style={{ backgroundColor: '#0c0c10' }}>Standard Only</option>
        </select>

        <button
          onClick={() => {
            setSelectedItem(null);
            setForm(initialForm);
            setIsModalOpen(true);
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            backgroundColor: 'rgba(255, 45, 85, 0.2)',
            border: '1px solid #ff2d55',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Plus size={16} /> Modal Upload Form
        </button>
      </div>

      {/* Portfolio Cards Grid */}
      {filteredItems.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', borderRadius: 20, border: '1px dashed rgba(255,45,85,0.35)', backgroundColor: 'rgba(12,12,16,0.5)' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
            {portfolio.length === 0 ? 'No portfolio projects yet. Add your first project above — it will appear on the live website portfolio page.' : 'No projects match your filters.'}
          </p>
          {portfolio.length === 0 && (
            <button
              onClick={() => { setSelectedItem(null); setForm(initialForm); setShowInlineForm(true); }}
              style={{ padding: '12px 24px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Add First Project Above
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onMouseEnter={playHoverSound}
            style={{
              position: 'relative',
              borderRadius: 20,
              backgroundColor: 'rgba(12, 12, 16, 0.8)',
              border: '1px solid rgba(255, 45, 85, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 15px 30px rgba(0,0,0,0.6)'
            }}
          >
            <div>
              <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                {item.mediaType === 'video' || /\.(mp4|webm|mov)/i.test(item.mediaUrl || item.videoUrl || '') ? (
                  <video
                    src={optimizedMediaUrl(item.mediaUrl || item.videoUrl || item.thumbnail, { width: 720 })}
                    poster={item.thumbnail ? optimizedMediaUrl(item.thumbnail, { width: 720 }) : undefined}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={optimizedMediaUrl(item.mediaUrl || item.thumbnail || item.videoUrl, { width: 720 })}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {item.featured && (
                  <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, backgroundColor: 'rgba(255, 45, 85, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} /> FEATURED
                  </span>
                )}
                <span style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.75)', color: '#ff2d55', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                  {item.service || 'VFX'}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', margin: '0 0 6px 0' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                  Client: {item.client || 'Assets Weber'} • Views: {item.views || 0}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setDrawerItem(item)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Eye size={14} /> Preview
              </button>
              <button
                onClick={() => handleEdit(item)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) for instant upload access */}
      <button
        onClick={() => {
          playClickSound();
          setShowInlineForm(true);
          const el = document.getElementById('inline-portfolio-upload-form');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        style={{
          position: 'fixed',
          bottom: 36,
          right: 36,
          zIndex: 9999,
          padding: '16px 28px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.95rem',
          border: 'none',
          boxShadow: '0 10px 40px rgba(255, 45, 85, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <Plus size={20} /> + UPLOAD PORTFOLIO WORK
      </button>

      {/* Portfolio Add / Edit Glass Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? 'EDIT PORTFOLIO PROJECT' : 'ADD PORTFOLIO PROJECT'} maxWidth={840}>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PROJECT TITLE *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>SLUG</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. cyber-vfx-commercial" style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>CLIENT NAME</label>
            <input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>CATEGORY</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: '#0c0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>SHORT DESCRIPTION *</label>
            <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>TECHNOLOGIES USED (Comma Separated)</label>
            <input type="text" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="WebGL, Three.js, React, Blender" style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>TAGS (Comma Separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Cinematic, Fast-paced, Corporate" style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COVER IMAGE / MEDIA</label>
            <input type="file" onChange={(e) => setCoverFile(e.target.files[0])} style={{ marginTop: 6, color: '#fff', fontSize: '0.8rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>VIDEO FILE</label>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} style={{ marginTop: 6, color: '#fff', fontSize: '0.8rem' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ accentColor: '#ff2d55', cursor: 'pointer' }} />
            <label htmlFor="feat" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>🌟 Feature this project on Website Home Page Showcase (Selected for Landing Page)</label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Portfolio Project'}</button>
          </div>
        </form>
      </GlassModal>

      {/* Side Preview Drawer */}
      <GlassModal isOpen={Boolean(drawerItem)} onClose={() => setDrawerItem(null)} title={drawerItem?.title || 'PROJECT PREVIEW'}>
        {drawerItem && (
          <div>
            {drawerItem.mediaType === 'video' || /\.(mp4|webm|mov)/i.test(drawerItem.mediaUrl || drawerItem.videoUrl || '') ? (
              <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#000', borderRadius: 16, marginBottom: 20, padding: 12 }}>
                <video
                  src={mediaUrl(drawerItem.mediaUrl || drawerItem.videoUrl || drawerItem.thumbnail)}
                  controls
                  autoPlay
                  muted
                  style={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 12 }}
                />
              </div>
            ) : (
              <img src={mediaUrl(drawerItem.mediaUrl || drawerItem.thumbnail || drawerItem.videoUrl)} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 16, marginBottom: 20 }} />
            )}
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{drawerItem.description}</p>
            <div style={{ marginTop: 16, fontSize: '0.85rem', color: '#ff2d55', fontFamily: 'monospace' }}>Category: {drawerItem.service} • Client: {drawerItem.client || 'N/A'}</div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
