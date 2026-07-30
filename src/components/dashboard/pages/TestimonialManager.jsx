import React, { useState } from 'react';
import { Plus, Star, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../ui/DataTable.jsx';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

export function TestimonialManager({ testimonials = [], onLoad, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    name: '',
    company: '',
    designation: '',
    rating: '5',
    review: '',
    service: 'Video Editing',
    featured: false
  };

  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.review) {
      showToast('Client name and review text are required.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);

      if (selectedTestimonial) {
        await api.updateTestimonial(selectedTestimonial.id, fd);
        showToast('Testimonial updated!');
      } else {
        await api.addTestimonialManage(fd);
        showToast('Testimonial created in database!');
      }

      setIsModalOpen(false);
      setSelectedTestimonial(null);
      setForm(initialForm);
      setPhotoFile(null);
      await onLoad();
    } catch (err) {
      showToast(err.message || 'Failed to save testimonial.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await api.deleteTestimonialManage(id);
      showToast('Testimonial deleted.');
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const columns = [
    {
      key: 'photo',
      label: 'IMAGE',
      render: (val, row) => (
        <img
          src={mediaUrl(val || row.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')}
          alt=""
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ff2d55' }}
        />
      )
    },
    { key: 'name', label: 'CLIENT', render: (val, row) => <div style={{ fontWeight: 600, color: '#fff' }}>{val}<div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{row.designation || 'Client'}</div></div> },
    { key: 'company', label: 'COMPANY', render: (val, row) => row.company || row.biz || 'N/A' },
    { key: 'rating', label: 'RATING', render: (val) => <span style={{ color: '#ffcc00', fontWeight: 700 }}>{'★'.repeat(Number(val) || 5)}</span> },
    { key: 'review', label: 'REVIEW', render: (val, row) => <div style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' }}>"{val || row.quote}"</div> },
    { key: 'approved', label: 'STATUS', render: () => <span style={{ color: '#34c759', padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(52, 199, 89, 0.15)', fontSize: '0.75rem', fontWeight: 600 }}>PUBLISHED</span> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            CLIENT PROOF // TESTIMONIALS
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            TESTIMONIALS & REVIEWS CMS
          </h2>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setSelectedTestimonial(null);
            setForm(initialForm);
            setIsModalOpen(true);
          }}
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
          <Plus size={18} /> Add New Testimonial
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>AVERAGE RATING</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ffcc00' }}>5.0 ★</div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>TOTAL REVIEWS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ffffff' }}>{testimonials.length}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>PUBLISHED REVIEWS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#34c759' }}>{testimonials.length}</div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={testimonials}
        searchPlaceholder="Search testimonials by client or company..."
        onBulkDelete={async (ids) => {
          await api.bulkDelete('testimonials', ids);
          showToast('Bulk testimonials deleted.');
          await onLoad();
        }}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setSelectedTestimonial(row);
                setForm({
                  name: row.name || '',
                  company: row.company || row.biz || '',
                  designation: row.designation || '',
                  rating: String(row.rating || 5),
                  review: row.review || row.quote || '',
                  service: row.tag || 'Video Editing',
                  featured: Boolean(row.featured)
                });
                setIsModalOpen(true);
              }}
              style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', cursor: 'pointer' }}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30', cursor: 'pointer' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      {/* Create Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTestimonial ? 'EDIT TESTIMONIAL' : 'ADD NEW TESTIMONIAL'}>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>CLIENT NAME *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>COMPANY / BIZ</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>DESIGNATION</label>
            <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. CEO / Lead Producer" style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>RATING</label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: '#0c0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}>
              <option value="5">5 Stars (★★★★★)</option>
              <option value="4">4 Stars (★★★★)</option>
              <option value="3">3 Stars (★★★)</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>REVIEW QUOTE *</label>
            <textarea required rows={3} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PROFILE PHOTO</label>
            <input type="file" onChange={(e) => setPhotoFile(e.target.files[0])} style={{ marginTop: 6, color: '#fff', fontSize: '0.8rem' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Testimonial'}</button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
