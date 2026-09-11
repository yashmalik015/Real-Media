import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, Package, Zap } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

const EMPTY_FORM = {
  title: '',
  category: '',
  icon: '🎬',
  rating: 5.0,
  reviews: 0,
  desc: '',
  startingPrice: 0,
  turnaround: '48-72 hrs',
  features: '',
  popular: false,
  tiers: ''
};

export function SkillManager({ showToast }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState('All');

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await api.getSkills();
      setSkills(res.skills || []);
    } catch (e) {
      showToast('Could not load skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSkills(); }, []);

  const openAdd = () => {
    playClickSound();
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    playClickSound();
    setEditingItem(item);
    
    // Convert features array to comma separated string
    const featuresStr = Array.isArray(item.features) ? item.features.join(', ') : '';
    
    // Convert tiers array to JSON string
    const tiersStr = Array.isArray(item.tiers) ? JSON.stringify(item.tiers, null, 2) : '';

    setForm({
      title: item.title || '',
      category: item.category || '',
      icon: item.icon || '🎬',
      rating: item.rating || 5.0,
      reviews: item.reviews || 0,
      desc: item.desc || '',
      startingPrice: item.startingPrice || 0,
      turnaround: item.turnaround || '',
      features: featuresStr,
      popular: Boolean(item.popular),
      tiers: tiersStr
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}?`)) return;
    try {
      await api.deleteSkill(id);
      showToast('Skill deleted.');
      loadSkills();
    } catch (e) {
      showToast('Failed to delete skill.');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      showToast('Title and Category are required.');
      return;
    }

    try {
      // Parse features
      const featuresArr = form.features.split(',').map(f => f.trim()).filter(Boolean);
      
      // Parse tiers
      let tiersArr = [];
      try {
        tiersArr = form.tiers ? JSON.parse(form.tiers) : [];
      } catch (err) {
        showToast('Tiers must be valid JSON.');
        return;
      }

      const payload = {
        title: form.title,
        category: form.category,
        icon: form.icon,
        rating: parseFloat(form.rating) || 5.0,
        reviews: parseInt(form.reviews, 10) || 0,
        desc: form.desc,
        startingPrice: parseInt(form.startingPrice, 10) || 0,
        turnaround: form.turnaround,
        features: featuresArr,
        popular: form.popular,
        tiers: tiersArr
      };

      if (editingItem) {
        await api.updateSkill(editingItem.id, payload);
        showToast('Skill updated.');
      } else {
        await api.addSkill(payload);
        showToast('Skill added.');
      }
      setIsModalOpen(false);
      loadSkills();
    } catch (e) {
      showToast(e.message || 'Failed to save skill.');
    }
  };

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filteredSkills = filterCategory === 'All' ? skills : skills.filter(s => s.category === filterCategory);

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#fff', margin: 0 }}>Skill Manager</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Manage the services and packages offered on the website and client portal.
          </p>
        </div>
        <button
          onClick={openAdd}
          onMouseEnter={playHoverSound}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
            borderRadius: 999, background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255,45,85,0.3)'
          }}
        >
          <Plus size={16} /> Add New Skill
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '8px 16px', borderRadius: 999, whiteSpace: 'nowrap',
              backgroundColor: filterCategory === cat ? '#ff2d55' : 'rgba(255,255,255,0.05)',
              color: '#fff', border: `1px solid ${filterCategory === cat ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
              fontSize: '0.8rem', fontWeight: filterCategory === cat ? 700 : 500, cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading skills...</div>
      ) : filteredSkills.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Package size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>No skills found</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Add a new skill to display it on the website.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredSkills.map(skill => (
            <div
              key={skill.id}
              style={{
                backgroundColor: 'rgba(15,15,20,0.95)', border: skill.popular ? '1px solid #ff2d55' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 20, position: 'relative'
              }}
            >
              {skill.popular && (
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '2px 8px', borderRadius: 999, backgroundColor: '#ff2d55', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>
                  POPULAR
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: '2.5rem' }}>{skill.icon}</div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{skill.category}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff' }}>{skill.title}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 16, height: 40, overflow: 'hidden' }}>
                {skill.desc}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>STARTING AT</div>
                  <div style={{ fontWeight: 700, color: '#34c759' }}>₹{(skill.startingPrice || 0).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>TIERS</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{skill.tiers?.length || 0} packages</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => openEdit(skill)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(skill.id || skill.title, skill.title)}
                  style={{ width: 40, borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.1)', color: '#ff2d55', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Skill' : 'Create New Skill'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} placeholder="e.g. Video Editing" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Category *</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} placeholder="e.g. Video & Film" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Icon</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', textAlign: 'center' }} placeholder="🎬" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Starting Price (₹)</label>
                <input type="number" value={form.startingPrice} onChange={e => setForm({ ...form, startingPrice: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Turnaround</label>
                <input value={form.turnaround} onChange={e => setForm({ ...form, turnaround: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} placeholder="e.g. 48 hrs" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Description</label>
              <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ width: '100%', minHeight: 60, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="Brief description of the service..." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Features (comma separated)</label>
              <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} style={{ width: '100%', minHeight: 60, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', resize: 'vertical' }} placeholder="e.g. 4K delivery, Sound design, 2 Revisions..." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Tiers (JSON format)</label>
              <textarea value={form.tiers} onChange={e => setForm({ ...form, tiers: e.target.value })} style={{ width: '100%', minHeight: 120, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem' }} placeholder='[{"name": "Basic", "price": 4999, "desc": "Short edit", "deliverables": "1 Video"}]' />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} id="popular-check" />
              <label htmlFor="popular-check" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>Mark as Popular</label>
            </div>

            <button
              onClick={handleSubmit}
              style={{ width: '100%', padding: '14px', borderRadius: 8, background: '#34c759', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: 10 }}
            >
              {editingItem ? 'Save Changes' : 'Create Skill'}
            </button>
          </div>
        </GlassModal>
      )}
    </div>
  );
}
