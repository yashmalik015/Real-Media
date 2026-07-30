import React, { useState, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, Video, Folder, Trash2, Copy, Eye, FileText } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

export function MediaLibrary({ showToast }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const folders = ['All', 'General', 'Portfolio', 'Courses', 'Testimonials'];

  const loadMedia = async () => {
    try {
      const res = await api.getMedia();
      setMediaItems(res.media || []);
    } catch (err) {
      showToast(err.message || 'Failed to load media items.');
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
      showToast('Media uploaded successfully!');
      await loadMedia();
    } catch (err) {
      showToast(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media file?')) return;
    try {
      await api.deleteMedia(id);
      showToast('Media deleted.');
      await loadMedia();
    } catch (err) {
      showToast(err.message);
    }
  };

  const copyToClipboard = (url) => {
    playClickSound();
    navigator.clipboard.writeText(mediaUrl(url));
    showToast('Media URL copied to clipboard!');
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === 'All' || item.folder === selectedFolder;
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
        </div>

        <label
          onMouseEnter={playHoverSound}
          style={{
            padding: '12px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(255, 45, 85, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Asset'}
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Folders & Search Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', backgroundColor: 'rgba(12, 12, 16, 0.75)', padding: 16, borderRadius: 16, border: '1px solid rgba(255, 45, 85, 0.2)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => { playClickSound(); setSelectedFolder(f); }}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                backgroundColor: selectedFolder === f ? 'rgba(255,45,85,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedFolder === f ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
                color: selectedFolder === f ? '#ff2d55' : '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Folder size={14} /> {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 200, marginLeft: 'auto' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      {/* Media Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {filteredMedia.map((m) => (
          <div
            key={m.id}
            onMouseEnter={playHoverSound}
            style={{
              position: 'relative',
              borderRadius: 16,
              backgroundColor: 'rgba(12, 12, 16, 0.8)',
              border: '1px solid rgba(255, 45, 85, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ position: 'relative', height: 140, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.type === 'video' ? (
                <Video size={40} color="#ff2d55" />
              ) : (
                <img src={mediaUrl(m.url)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            <div style={{ padding: 14 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 4 }}>
                {m.size} • {m.folder}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => setPreviewMedia(m)} style={{ flex: 1, padding: '6px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
                <Eye size={14} />
              </button>
              <button onClick={() => copyToClipboard(m.url)} style={{ flex: 1, padding: '6px', borderRadius: 6, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', cursor: 'pointer' }}>
                <Copy size={14} />
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <GlassModal isOpen={Boolean(previewMedia)} onClose={() => setPreviewMedia(null)} title="MEDIA PREVIEW">
        {previewMedia && (
          <div style={{ textAlign: 'center' }}>
            {previewMedia.type === 'video' ? (
              <video src={mediaUrl(previewMedia.url)} controls style={{ width: '100%', maxHeight: 400, borderRadius: 16 }} />
            ) : (
              <img src={mediaUrl(previewMedia.url)} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 16 }} />
            )}
            <div style={{ marginTop: 16, color: '#fff', fontSize: '0.9rem' }}>{previewMedia.name} ({previewMedia.size})</div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
