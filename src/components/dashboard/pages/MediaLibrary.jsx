import React, { useState, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, Video, Folder, Trash2, Copy, Eye, RefreshCw, Check } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

export function MediaLibrary({ showToast }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const folders = ['All', 'Courses', 'Portfolio', 'General', 'Testimonials'];

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia();
      setMediaItems(res.media || []);
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to load media items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', selectedFolder === 'All' ? 'General' : selectedFolder);
      await api.uploadMedia(fd);
      if (showToast) showToast(`Media uploaded to ${selectedFolder === 'All' ? 'General' : selectedFolder}!`);
      await loadMedia();
    } catch (err) {
      if (showToast) showToast(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this media asset?')) return;
    try {
      await api.deleteMedia(id);
      if (showToast) showToast('Media removed.');
      await loadMedia();
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to delete media.');
    }
  };

  const copyToClipboard = (item) => {
    playClickSound();
    const url = mediaUrl(item.url);
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    if (showToast) showToast('Asset URL copied to clipboard!');
  };

  // Calculate folder counts dynamically
  const folderCounts = {
    All: mediaItems.length,
    Courses: mediaItems.filter(m => (m.folder || '').toLowerCase() === 'courses').length,
    Portfolio: mediaItems.filter(m => (m.folder || '').toLowerCase() === 'portfolio').length,
    General: mediaItems.filter(m => (m.folder || '').toLowerCase() === 'general').length,
    Testimonials: mediaItems.filter(m => (m.folder || '').toLowerCase() === 'testimonials').length,
  };

  const filteredMedia = mediaItems.filter((item) => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term ||
      item.name?.toLowerCase().includes(term) ||
      item.usedBy?.toLowerCase().includes(term) ||
      item.size?.toLowerCase().includes(term);
    const matchesFolder = selectedFolder === 'All' ||
      (item.folder || '').toLowerCase() === selectedFolder.toLowerCase();
    return matchesSearch && matchesFolder;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            ASSET MANAGEMENT // MEDIA LIBRARY
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            MEDIA ASSET MANAGER
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
            Aggregated repository for courses, portfolio reels, client files, and system uploads.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => { playClickSound(); loadMedia(); }}
            title="Refresh Media"
            disabled={loading}
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          <label
            onMouseEnter={playHoverSound}
            style={{
              padding: '12px 24px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: uploading ? 0.7 : 1
            }}
          >
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Asset'}
            <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Folders & Search Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', backgroundColor: 'rgba(12, 12, 16, 0.75)', padding: 16, borderRadius: 16, border: '1px solid rgba(255, 45, 85, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {folders.map((f) => {
            const count = folderCounts[f] || 0;
            const isSelected = selectedFolder.toLowerCase() === f.toLowerCase();
            return (
              <button
                key={f}
                onClick={() => { playClickSound(); setSelectedFolder(f); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  backgroundColor: isSelected ? 'rgba(255,45,85,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
                  color: isSelected ? '#ff2d55' : '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                <Folder size={14} />
                <span>{f}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: 999,
                    backgroundColor: isSelected ? 'rgba(255,45,85,0.4)' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    fontWeight: 700
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by name, service or course..."
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ height: 240, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMedia.length === 0 && (
        <div
          style={{
            padding: '70px 20px',
            textAlign: 'center',
            backgroundColor: 'rgba(12, 12, 16, 0.5)',
            borderRadius: 20,
            border: '1px dashed rgba(255, 45, 85, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,45,85,0.1)', display: 'grid', placeItems: 'center' }}>
            <Folder size={28} color="#ff2d55" />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              NO MEDIA ASSETS FOUND IN "{selectedFolder.toUpperCase()}"
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.86rem', marginTop: 4 }}>
              {search ? 'Try clearing your search query.' : `Upload files to "${selectedFolder}" using the button above, or check another folder.`}
            </div>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                marginTop: 6,
                padding: '8px 18px',
                borderRadius: 8,
                backgroundColor: 'rgba(255,45,85,0.15)',
                border: '1px solid rgba(255,45,85,0.3)',
                color: '#ff2d55',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Media Grid */}
      {!loading && filteredMedia.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {filteredMedia.map((m) => (
            <div
              key={m.id}
              onMouseEnter={playHoverSound}
              style={{
                position: 'relative',
                borderRadius: 16,
                backgroundColor: 'rgba(12, 12, 16, 0.85)',
                border: '1px solid rgba(255, 45, 85, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            >
              {/* Media Preview Box */}
              <div
                onClick={() => setPreviewMedia(m)}
                style={{
                  position: 'relative',
                  height: 150,
                  backgroundColor: '#050508',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {m.type === 'video' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      src={mediaUrl(m.url)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        try { e.target.currentTime = 1; } catch { /* silent */ }
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'grid',
                        placeItems: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,45,85,0.9)',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 0 16px rgba(255,45,85,0.7)'
                        }}
                      >
                        <Video size={20} color="#ffffff" />
                      </div>
                    </div>
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: '#ff2d55',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 4,
                        letterSpacing: '0.08em',
                        border: '1px solid rgba(255,45,85,0.3)'
                      }}
                    >
                      VIDEO
                    </span>
                  </div>
                ) : (
                  <img
                    src={mediaUrl(m.url)}
                    alt={m.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                {/* Folder tag in corner */}
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(10,10,14,0.85)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {m.folder}
                </span>
              </div>

              {/* Media Info */}
              <div style={{ padding: 14 }}>
                <div
                  title={m.name}
                  style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {m.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', marginTop: 4 }}>
                  {m.size || 'Synced'} • {m.usedBy || 'Media'}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: 6, padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <button
                  onClick={() => setPreviewMedia(m)}
                  title="Preview Media"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => copyToClipboard(m)}
                  title="Copy Direct URL"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    backgroundColor: copiedId === m.id ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255,45,85,0.15)',
                    border: `1px solid ${copiedId === m.id ? '#34c759' : 'rgba(255,45,85,0.3)'}`,
                    color: copiedId === m.id ? '#34c759' : '#ff2d55',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedId === m.id ? <Check size={15} /> : <Copy size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  title="Delete File"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,59,48,0.15)',
                    border: '1px solid rgba(255,59,48,0.3)',
                    color: '#ff3b30',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <GlassModal isOpen={Boolean(previewMedia)} onClose={() => setPreviewMedia(null)} title="MEDIA PREVIEW">
        {previewMedia && (
          <div style={{ textAlign: 'center' }}>
            {previewMedia.type === 'video' ? (
              <video
                src={mediaUrl(previewMedia.url)}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: 440, borderRadius: 16, backgroundColor: '#000' }}
              />
            ) : (
              <img
                src={mediaUrl(previewMedia.url)}
                alt=""
                style={{ width: '100%', maxHeight: 440, objectFit: 'contain', borderRadius: 16, backgroundColor: '#000' }}
              />
            )}
            <div style={{ marginTop: 16, color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
              {previewMedia.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginTop: 4 }}>
              Folder: {previewMedia.folder} • Used By: {previewMedia.usedBy}
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => copyToClipboard(previewMedia)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,45,85,0.2)',
                  border: '1px solid #ff2d55',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Copy size={14} /> Copy Direct URL
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
