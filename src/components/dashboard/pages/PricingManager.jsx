import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, DollarSign, Zap, Film, Code, Megaphone, Paintbrush, Globe, Star } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

const SERVICE_CATEGORIES = [
  { id: 'video', label: 'Video Editing', icon: Film, color: '#ff2d55' },
  { id: 'web', label: 'Web Development', icon: Code, color: '#007aff' },
  { id: 'marketing', label: 'Digital Marketing', icon: Megaphone, color: '#ff9500' },
  { id: 'design', label: 'Graphic Design', icon: Paintbrush, color: '#5e5ce6' },
  { id: 'vfx', label: 'VFX & Animation', icon: Zap, color: '#34c759' },
  { id: 'social', label: 'Social Media Management', icon: Globe, color: '#30b0c7' },
];

const DEFAULT_PLANS_BY_SERVICE = {
  'Video Editing': [
    { name: 'Starter', price: '149', period: '/month', features: ['5 Short Videos (up to 60s)', 'Basic Color Grading', '48h Delivery', '1 Revision Round', 'Subtitles Included'], highlight: false },
    { name: 'Professional', price: '349', period: '/month', features: ['15 Videos (up to 5 min)', 'Advanced Color Grading', '24h Delivery', '3 Revision Rounds', 'Motion Graphics', 'Sound Design'], highlight: true },
    { name: 'Enterprise', price: '799', period: '/month', features: ['Unlimited Videos', 'Full Post-Production', 'Priority 12h Delivery', 'Unlimited Revisions', 'VFX Integration', 'Dedicated Editor', 'Monthly Strategy Call'], highlight: false },
  ],
  'Web Development': [
    { name: 'Landing Page', price: '499', period: '/project', features: ['1-Page Website', 'Mobile Responsive', 'SEO Optimized', '3 Revision Rounds', '5-Day Delivery', 'CMS Integration'], highlight: false },
    { name: 'Business Site', price: '1299', period: '/project', features: ['Up to 10 Pages', 'Custom UI Design', 'Contact & Lead Forms', 'Analytics Setup', '5 Revision Rounds', 'Deployment Included'], highlight: true },
    { name: 'Full-Stack App', price: '3999', period: '/project', features: ['Custom Web App', 'Database Architecture', 'User Auth System', 'API Development', 'Admin Dashboard', 'Unlimited Revisions', '3 Months Support'], highlight: false },
  ],
  'Digital Marketing': [
    { name: 'Starter', price: '249', period: '/month', features: ['2 Social Platforms', 'Basic Ad Campaigns', '5 Ad Creatives/month', 'Monthly Report', 'Email Support'], highlight: false },
    { name: 'Growth', price: '599', period: '/month', features: ['4 Social Platforms', 'Advanced Targeting', '15 Ad Creatives/month', 'Weekly Reports', 'A/B Testing', 'Dedicated Manager'], highlight: true },
    { name: 'Scale', price: '1299', period: '/month', features: ['All Platforms', 'Full Funnel Strategy', 'Unlimited Creatives', 'Daily Reports', 'Influencer Outreach', 'Content Calendar', 'Priority Support'], highlight: false },
  ],
  'Graphic Design': [
    { name: 'Basic', price: '199', period: '/month', features: ['5 Designs/month', 'Social Media Graphics', 'PNG & PDF Delivery', '2 Revision Rounds', '48h Turnaround'], highlight: false },
    { name: 'Brand Kit', price: '449', period: '/month', features: ['15 Designs/month', 'Logo & Brand Identity', 'Brand Style Guide', 'Print-Ready Files', '4 Revision Rounds', '24h Turnaround'], highlight: true },
    { name: 'Agency', price: '999', period: '/month', features: ['Unlimited Designs', 'Full Brand Strategy', 'Packaging & Merch', 'Marketing Materials', 'Unlimited Revisions', 'Dedicated Designer', 'Slack Access'], highlight: false },
  ],
  'VFX & Animation': [
    { name: 'Motion', price: '299', period: '/month', features: ['3 Motion Graphics', 'Logo Animation', '2 Revision Rounds', '1080p Output', '72h Delivery'], highlight: false },
    { name: 'Cinematic', price: '699', period: '/month', features: ['10 VFX Shots', 'Advanced Compositing', '3D Title Sequences', '4K Output', '3 Revision Rounds', '48h Delivery'], highlight: true },
    { name: 'Blockbuster', price: '1599', period: '/month', features: ['Unlimited VFX Shots', 'Full CG/CGI Pipeline', 'Character Animation', '8K Output', 'Unlimited Revisions', 'Dedicated VFX Artist', 'Weekly Reviews'], highlight: false },
  ],
  'Social Media Management': [
    { name: 'Essentials', price: '179', period: '/month', features: ['2 Platforms', '12 Posts/month', 'Caption Copywriting', 'Hashtag Strategy', 'Monthly Report'], highlight: false },
    { name: 'Growth', price: '399', period: '/month', features: ['4 Platforms', '30 Posts/month', 'Reels & Stories', 'Community Management', 'Influencer Tags', 'Bi-Weekly Reports'], highlight: true },
    { name: 'Full Management', price: '799', period: '/month', features: ['All Platforms', 'Daily Posting', 'Live Coverage', 'Paid Ad Boost', 'Content Strategy', 'Brand Voice Guide', 'Crisis Management'], highlight: false },
  ],
};

const BADGE_COLORS = {
  'Video Editing': '#ff2d55',
  'Web Development': '#007aff',
  'Digital Marketing': '#ff9500',
  'Graphic Design': '#5e5ce6',
  'VFX & Animation': '#34c759',
  'Social Media Management': '#30b0c7',
};

const EMPTY_FORM = {
  name: '',
  price: '',
  period: '/month',
  features: '',
  highlight: false,
  service: 'Video Editing',
};

export function PricingManager({ showToast }) {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterService, setFilterService] = useState('All');

  const loadPricing = async () => {
    try {
      const res = await api.getPricing();
      setPricing(res.pricing || []);
    } catch (_) {}
  };

  useEffect(() => { loadPricing(); }, []);

  const openAdd = () => {
    playClickSound();
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    playClickSound();
    setEditingItem(item);
    setForm({
      name: item.name || '',
      price: String(item.price || ''),
      period: item.period || '/month',
      features: Array.isArray(item.features) ? item.features.join(', ') : (item.features || ''),
      highlight: Boolean(item.highlight),
      service: item.service || 'Video Editing',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { showToast('Plan name and price are required.'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        features: typeof form.features === 'string'
          ? form.features.split(',').map(f => f.trim()).filter(Boolean)
          : form.features,
      };
      if (editingItem) {
        await api.updatePricing(editingItem.id || editingItem._id, payload);
        showToast('Pricing plan updated!');
      } else {
        await api.createPricing(payload);
        showToast('Pricing plan created!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
      await loadPricing();
    } catch (err) {
      showToast(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pricing plan?')) return;
    try {
      await api.deletePricing(id);
      showToast('Pricing plan deleted.');
      await loadPricing();
    } catch (err) { showToast(err.message); }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      for (const [svc, plans] of Object.entries(DEFAULT_PLANS_BY_SERVICE)) {
        for (const plan of plans) {
          await api.createPricing({ ...plan, service: svc });
        }
      }
      showToast('Default pricing plans seeded for all 6 services!');
      await loadPricing();
    } catch (err) {
      showToast(err.message || 'Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  const filtered = filterService === 'All' ? pricing : pricing.filter(p => p.service === filterService);
  const grouped = {};
  filtered.forEach(p => {
    const key = p.service || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>FINANCE // PRICING ENGINE</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            PRICING PLAN MANAGER
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {pricing.length === 0 && (
            <button onClick={seedDefaults} disabled={seeding} onMouseEnter={playHoverSound}
              style={{ padding: '12px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} /> {seeding ? 'Seeding...' : 'Seed All Default Plans'}
            </button>
          )}
          <button onClick={openAdd} onMouseEnter={playHoverSound}
            style={{ padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 0 25px rgba(255,45,85,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Add Plan
          </button>
        </div>
      </div>

      {/* Service Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['All', ...SERVICE_CATEGORIES.map(s => s.label)].map(svc => (
          <button key={svc} onClick={() => { playClickSound(); setFilterService(svc); }} onMouseEnter={playHoverSound}
            style={{ padding: '8px 16px', borderRadius: 999, backgroundColor: filterService === svc ? '#ff2d55' : 'rgba(255,255,255,0.06)', color: filterService === svc ? '#fff' : 'rgba(255,255,255,0.65)', border: `1px solid ${filterService === svc ? '#ff2d55' : 'rgba(255,255,255,0.12)'}`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.18s ease' }}>
            {svc} {svc !== 'All' && `(${pricing.filter(p => p.service === svc).length})`}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      {pricing.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>TOTAL PLANS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff' }}>{pricing.length}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>SERVICES COVERED</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#34c759' }}>{[...new Set(pricing.map(p => p.service))].length}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>HIGHLIGHTED PLANS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ff9500' }}>{pricing.filter(p => p.highlight).length}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(12,12,16,0.75)', border: '1px solid rgba(255,45,85,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>AVG PRICE</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ff2d55' }}>${Math.round(pricing.reduce((a, p) => a + Number(p.price || 0), 0) / pricing.length)}</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {pricing.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '80px 40px', border: '2px dashed rgba(255,45,85,0.25)', borderRadius: 24, backgroundColor: 'rgba(255,45,85,0.03)' }}>
          <DollarSign size={64} color="rgba(255,45,85,0.35)" />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: '0 0 8px' }}>NO PRICING PLANS YET</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', margin: 0 }}>Seed all 18 default plans across 6 services, or add them manually.</p>
          </div>
          <button onClick={seedDefaults} disabled={seeding}
            style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg, #ff2d55, #bd1c3c)', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 0 30px rgba(255,45,85,0.4)' }}>
            {seeding ? 'Seeding all plans...' : '⚡ Seed 18 Default Pricing Plans'}
          </button>
        </div>
      )}

      {/* Grouped Cards */}
      {Object.entries(grouped).map(([service, plans]) => {
        const badgeColor = BADGE_COLORS[service] || '#ff2d55';
        return (
          <div key={service}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 4, height: 32, borderRadius: 99, backgroundColor: badgeColor }} />
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', margin: 0 }}>{service}</h3>
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontFamily: 'monospace', backgroundColor: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}55` }}>
                {plans.length} PLANS
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {plans.map(plan => {
                const featureList = Array.isArray(plan.features) ? plan.features : String(plan.features || '').split(',').map(f => f.trim()).filter(Boolean);
                return (
                  <div key={plan.id || plan._id} onMouseEnter={playHoverSound}
                    style={{ borderRadius: 20, backgroundColor: plan.highlight ? 'rgba(255,45,85,0.08)' : 'rgba(12,12,16,0.8)', border: `1px solid ${plan.highlight ? 'rgba(255,45,85,0.5)' : 'rgba(255,255,255,0.08)'}`, padding: 24, position: 'relative', boxShadow: plan.highlight ? '0 0 40px rgba(255,45,85,0.15)' : '0 10px 30px rgba(0,0,0,0.4)' }}>
                    {plan.highlight && (
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 999, background: 'linear-gradient(90deg, #ff2d55, #bd1c3c)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        ✦ MOST POPULAR
                      </div>
                    )}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginBottom: 4 }}>{service.toUpperCase()}</div>
                      <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', margin: '0 0 8px' }}>{plan.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: plan.highlight ? '#ff2d55' : '#fff' }}>${plan.price}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{plan.period || '/month'}</span>
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {featureList.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
                          <Check size={14} color="#34c759" style={{ marginTop: 2, flexShrink: 0 }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(plan)} style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', backgroundColor: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(plan.id || plan._id)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff3b30' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add / Edit Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'EDIT PRICING PLAN' : 'ADD PRICING PLAN'} maxWidth={640}>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PLAN NAME *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Starter, Pro, Enterprise"
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>SERVICE CATEGORY</label>
            <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: '#0c0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}>
              {SERVICE_CATEGORIES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>PRICE ($) *</label>
            <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 149"
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>BILLING PERIOD</label>
            <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: '#0c0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4 }}>
              <option value="/month">/month</option>
              <option value="/project">/project</option>
              <option value="/year">/year</option>
              <option value="one-time">one-time</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>FEATURES (Comma Separated)</label>
            <textarea rows={4} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="5 Videos, Color Grading, 24h Delivery, 2 Revisions"
              style={{ width: '100%', padding: '10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, resize: 'vertical' }} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="highlight-plan" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })}
              style={{ accentColor: '#ff2d55', cursor: 'pointer', width: 16, height: 16 }} />
            <label htmlFor="highlight-plan" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
              Mark as "Most Popular" — Highlighted Plan
            </label>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, backgroundColor: '#ff2d55', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Saving...' : editingItem ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
