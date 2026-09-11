import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Package, Check, Sparkles, Layers } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

const EMPTY_TIER = {
  id: '',
  name: 'New Plan',
  price: 4999,
  deliveryTime: '3-5 days',
  inclusions: 'Color Grading, Sound FX, Normal Cuts, 4K Export',
  features: '2 Revisions, Source Files Included, Commercial License',
  desc: 'High-quality service package tailored for business growth.',
  highlight: false
};

const DEFAULT_STARTER_TIERS = [
  {
    name: 'Starter',
    price: 4999,
    deliveryTime: '3-5 days',
    inclusions: 'Color Grading, Sound FX, Normal Cuts, 4K Export',
    features: '1 Final Deliverable, 2 Revisions, Commercial License',
    desc: 'Essential package for standard projects and social content.',
    highlight: false
  },
  {
    name: 'Professional',
    price: 14999,
    deliveryTime: '48-72 hrs',
    inclusions: 'Advanced Color Grading, Custom Motion Graphics, Sound Design & Mixing, Subtitles',
    features: '3 Deliverables, Unlimited Revisions, Raw Files Included, Priority Support',
    desc: 'High-retention package with motion graphics and custom pacing.',
    highlight: true
  },
  {
    name: 'Premium',
    price: 29999,
    deliveryTime: '24-48 hrs',
    inclusions: 'Full Production, VFX Compositing, Sound FX & Mixing, 4K Delivery',
    features: 'Full Campaign Bundle, Priority Delivery, Dedicated Handler, Source Files',
    desc: 'Commercial-grade production for brand launches and campaigns.',
    highlight: false
  }
];

const DEFAULT_INITIAL_SKILLS = [
  {
    id: 'skill_video_editing',
    title: 'Video Editing',
    category: 'Video & Film',
    icon: '🎬',
    desc: 'Cinematic edits, reels, ads, trailers, and brand films built for retention.',
    startingPrice: 4999,
    turnaround: '48-72 hrs',
    popular: true,
    features: ['Dynamic cuts & pacing', 'Color grading & sound design', '4K & Social exports'],
    tiers: DEFAULT_STARTER_TIERS
  },
  {
    id: 'skill_web_development',
    title: 'Web Development',
    category: 'Engineering',
    icon: '🌐',
    desc: 'High-converting websites, landing pages, portals, and scalable web applications.',
    startingPrice: 24999,
    turnaround: '5-7 days',
    popular: true,
    features: ['Responsive UI/UX', 'SEO Optimization', 'CMS & Backend Integration'],
    tiers: [
      { name: 'Business Website', price: 24999, deliveryTime: '5-7 days', inclusions: 'Responsive Design, Up to 5 Pages, SEO Basics, Contact Form', features: 'Clean Modern UI, Mobile Optimized', desc: 'Professional website for businesses.', highlight: false },
      { name: 'Premium Website', price: 59999, deliveryTime: '7-14 days', inclusions: 'Custom UI/UX, Advanced Animations, CMS Dashboard, SEO Optimization', features: 'Full CMS, Speed Optimization, 3 Revisions', desc: 'Custom website with animations.', highlight: true },
      { name: 'Ecommerce Store', price: 99999, deliveryTime: '14-21 days', inclusions: 'Payment Gateway, Admin Dashboard, Product Management, Auth System', features: 'Full E-Commerce, Inventory System', desc: 'Full-featured online store ready to sell.', highlight: false }
    ]
  },
  {
    id: 'skill_app_development',
    title: 'App Development',
    category: 'Engineering',
    icon: '📱',
    desc: 'Reliable mobile apps with a clean user experience for growing businesses.',
    startingPrice: 199999,
    turnaround: '2-4 weeks',
    popular: false,
    features: ['iOS & Android', 'Cross-Platform Speed', 'Backend API Architecture'],
    tiers: [
      { name: 'MVP App', price: 199999, deliveryTime: '2-4 weeks', inclusions: 'Android/iOS Support, Authentication, API Integration', features: 'Cross-platform, Core Features', desc: 'Minimum viable mobile app for startups.', highlight: false },
      { name: 'Full App', price: 349999, deliveryTime: '4-8 weeks', inclusions: 'Real-time Systems, Push Notifications, Admin Panel', features: 'Production Ready, Backend Included', desc: 'Full-featured app with custom backend.', highlight: true },
      { name: 'Enterprise App', price: 599999, deliveryTime: '8-12 weeks', inclusions: 'Advanced Backend, Multi-role System, Analytics Dashboard', features: 'Security Audit, Dedicated Team', desc: 'Complex enterprise-grade application.', highlight: false }
    ]
  },
  {
    id: 'skill_digital_marketing',
    title: 'Digital Marketing',
    category: 'Marketing',
    icon: '📈',
    desc: 'Campaigns and social strategy that turn attention into measurable growth.',
    startingPrice: 12999,
    turnaround: 'Monthly',
    popular: true,
    features: ['Content Strategy', 'Ad Creatives', 'Monthly Reporting'],
    tiers: [
      { name: 'Starter Growth', price: 12999, deliveryTime: 'Monthly Retainer', inclusions: '8 Reels/mo, Basic Editing, Content Calendar', features: '3-day turnaround, Social Planning', desc: 'Perfect for local businesses building presence.', highlight: false },
      { name: 'Business Growth', price: 24999, deliveryTime: 'Monthly Retainer', inclusions: '16 Reels/mo, Advanced Editing, Thumbnail Design', features: 'Monthly Strategy Call, Motion Graphics', desc: 'All-inclusive social media management.', highlight: true },
      { name: 'Domination', price: 49999, deliveryTime: 'Monthly Retainer', inclusions: '30 Reels/mo, Cinematic Production, Ad Creatives', features: 'Dedicated Manager, Analytics Reports', desc: 'Full-scale social domination.', highlight: false }
    ]
  },
  {
    id: 'skill_graphic_design',
    title: 'Graphic Design',
    category: 'Design',
    icon: '🎨',
    desc: 'Distinctive visual assets that keep every customer touchpoint polished.',
    startingPrice: 4999,
    turnaround: '48 hrs',
    popular: false,
    features: ['Social Media Assets', 'Brand Kits & Logos', 'Print & Campaign Design'],
    tiers: [
      { name: 'Basic Design', price: 4999, deliveryTime: '48 hrs', inclusions: '5 Social Designs, PNG & Vector Delivery', features: 'Social Assets, Clean Polish', desc: 'Essential design assets for campaigns.', highlight: false },
      { name: 'Brand Kit', price: 14999, deliveryTime: '3-5 days', inclusions: '15 Social Designs, Logo Direction, Brand Style Guide', features: 'Brand Assets, Source Files', desc: 'Complete brand identity kit.', highlight: true },
      { name: 'Agency Retainer', price: 34999, deliveryTime: 'Ongoing', inclusions: 'Unlimited Designs, Full Brand Strategy, Merch & Packaging', features: 'Priority Turnaround, Direct Access', desc: 'Full design support on monthly retainer.', highlight: false }
    ]
  },
  {
    id: 'skill_ui_ux_design',
    title: 'UI/UX Design',
    category: 'Design',
    icon: '✨',
    desc: 'Intuitive digital experiences shaped around user needs and business outcomes.',
    startingPrice: 19999,
    turnaround: '3-5 days',
    popular: true,
    features: ['User Journeys', 'Figma Prototypes', 'Design Systems'],
    tiers: [
      { name: 'Wireframes & UX', price: 19999, deliveryTime: '3-5 days', inclusions: 'User Flow, Wireframes, Interactive Prototype', features: 'Figma File, User Research', desc: 'UX structure and clickable wireframes.', highlight: false },
      { name: 'Full UI/UX System', price: 49999, deliveryTime: '7-14 days', inclusions: 'Custom UI Design, Design System, Component Library', features: 'Desktop & Mobile, Figma Tokens', desc: 'Complete polished UI/UX design.', highlight: true },
      { name: 'App UI & System', price: 89999, deliveryTime: '14-21 days', inclusions: 'Full App UI, Design System, Micro-animations', features: 'Unlimited Screens, Design Tokens', desc: 'Comprehensive app UI design & system.', highlight: false }
    ]
  },
  {
    id: 'skill_game_development',
    title: 'Game Development',
    category: 'Gaming',
    icon: '🎮',
    desc: 'Memorable interactive experiences for brands, publishers, and products.',
    startingPrice: 79999,
    turnaround: '2-4 weeks',
    popular: false,
    features: ['2D & 3D Mechanics', 'Multiplayer & Backend', 'Cross-Platform Build'],
    tiers: [
      { name: 'Promotional Game', price: 79999, deliveryTime: '2-4 weeks', inclusions: 'Simple Gameplay, Brand Integration', features: 'Lead Gen Game, Web & Mobile', desc: 'Branded mobile game for marketing.', highlight: false },
      { name: '2D Game', price: 299999, deliveryTime: '4-8 weeks', inclusions: '2D Assets, Multiplayer Systems, Leaderboard', features: 'Cross-Platform, Backend Integration', desc: 'Full 2D game with backend.', highlight: true },
      { name: '3D Game', price: 499999, deliveryTime: '8-16 weeks', inclusions: '3D Assets, Multiplayer Systems, Backend Cloud', features: 'Full Production, Dedicated Team', desc: 'Multiplayer 3D game with full backend.', highlight: false }
    ]
  },
  {
    id: 'skill_vfx',
    title: 'VFX',
    category: 'Visual Effects',
    icon: '🌌',
    desc: 'High-impact visual effects and compositing for content that stands out.',
    startingPrice: 2999,
    turnaround: '48 hrs',
    popular: true,
    features: ['Clean Compositing', '3D Motion Tracking', 'CGI Integration'],
    tiers: [
      { name: 'Basic VFX', price: 2999, deliveryTime: '48 hrs', inclusions: 'Object Removal, Screen Replacement, Clean Compositing', features: 'Per Shot, HD Output', desc: 'Essential visual effects.', highlight: false },
      { name: 'Advanced VFX', price: 9999, deliveryTime: '3-5 days', inclusions: 'Motion Tracking, CGI Integration, Particle Effects', features: 'Per Shot, 4K Output', desc: 'Cinematic VFX with motion tracking.', highlight: true },
      { name: 'Cinematic VFX', price: 49999, deliveryTime: '7-14 days', inclusions: '3D Asset Integration, Full Scene Compositing, Matchmoving', features: 'Per Project, Film Grade', desc: 'Full VFX pipeline for film productions.', highlight: false }
    ]
  }
];

const EMPTY_FORM = {
  title: '',
  category: 'General',
  icon: '🎬',
  rating: 5.0,
  reviews: 0,
  desc: '',
  startingPrice: 0,
  turnaround: '48-72 hrs',
  features: '',
  popular: false,
  tiers: DEFAULT_STARTER_TIERS
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
      const loaded = res.skills || [];
      if (loaded.length > 0) {
        setSkills(loaded);
      } else {
        setSkills(DEFAULT_INITIAL_SKILLS);
      }
    } catch (_e) {
      setSkills(DEFAULT_INITIAL_SKILLS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openAdd = () => {
    playClickSound();
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      tiers: JSON.parse(JSON.stringify(DEFAULT_STARTER_TIERS))
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    playClickSound();
    setEditingItem(item);

    const featuresStr = Array.isArray(item.features) ? item.features.join(', ') : (item.features || '');

    // Format tiers into editable objects
    let existingTiers = [];
    if (Array.isArray(item.tiers) && item.tiers.length > 0) {
      existingTiers = item.tiers.map((t) => ({
        id: t.id || t._id || `tier_${Date.now()}_${Math.random()}`,
        name: t.name || t.title || 'Plan',
        price: t.price ?? 4999,
        deliveryTime: t.deliveryTime || t.turnaround || '3-5 days',
        inclusions: Array.isArray(t.inclusions) ? t.inclusions.join(', ') : (t.inclusions || ''),
        features: Array.isArray(t.features) ? t.features.join(', ') : (t.features || ''),
        desc: t.desc || '',
        highlight: Boolean(t.highlight || t.popular || t.badge === 'Most Popular')
      }));
    } else {
      existingTiers = JSON.parse(JSON.stringify(DEFAULT_STARTER_TIERS));
    }

    setForm({
      title: item.title || '',
      category: item.category || 'General',
      icon: item.icon || '🎬',
      rating: item.rating || 5.0,
      reviews: item.reviews || 0,
      desc: item.desc || '',
      startingPrice: item.startingPrice || 0,
      turnaround: item.turnaround || '48-72 hrs',
      features: featuresStr,
      popular: Boolean(item.popular),
      tiers: existingTiers
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}?`)) return;
    try {
      await api.deleteSkill(id);
      showToast('Skill deleted.');
      loadSkills();
    } catch (_e) {
      showToast('Failed to delete skill.');
    }
  };

  // Tier manipulation inside modal
  const handleAddTier = () => {
    playClickSound();
    const newTier = {
      ...EMPTY_TIER,
      id: `tier_${Date.now()}`,
      name: `Tier ${form.tiers.length + 1}`
    };
    setForm((prev) => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }));
  };

  const handleUpdateTier = (index, field, value) => {
    setForm((prev) => {
      const updatedTiers = [...prev.tiers];
      updatedTiers[index] = {
        ...updatedTiers[index],
        [field]: value
      };
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleRemoveTier = (index) => {
    playClickSound();
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      showToast('Title and Category are required.');
      return;
    }

    try {
      const featuresArr = typeof form.features === 'string'
        ? form.features.split(',').map((f) => f.trim()).filter(Boolean)
        : (form.features || []);

      // Format formatted tiers array
      const formattedTiers = form.tiers.map((t, idx) => {
        const incArr = typeof t.inclusions === 'string'
          ? t.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
          : (t.inclusions || []);

        const featArr = typeof t.features === 'string'
          ? t.features.split(',').map((s) => s.trim()).filter(Boolean)
          : (t.features || []);

        const numPrice = Number(String(t.price).replace(/[^\d]/g, ''));
        const priceVal = isNaN(numPrice) || numPrice === 0 ? t.price : numPrice;

        return {
          id: t.id || `tier_${idx}_${Date.now()}`,
          service: form.title,
          category: form.category,
          name: t.name || `Plan ${idx + 1}`,
          price: priceVal,
          deliveryTime: t.deliveryTime || '3-5 days',
          inclusions: incArr,
          features: featArr,
          desc: t.desc || '',
          highlight: Boolean(t.highlight)
        };
      });

      // Calculate starting price from minimum numeric price among tiers
      const numericPrices = formattedTiers
        .map((t) => Number(t.price))
        .filter((p) => !isNaN(p) && p > 0);

      const calculatedStartingPrice = numericPrices.length > 0
        ? Math.min(...numericPrices)
        : (Number(form.startingPrice) || 0);

      const skillPayload = {
        title: form.title,
        category: form.category,
        icon: form.icon,
        rating: parseFloat(form.rating) || 5.0,
        reviews: parseInt(form.reviews, 10) || 0,
        desc: form.desc,
        startingPrice: calculatedStartingPrice,
        turnaround: form.turnaround,
        features: featuresArr,
        popular: form.popular,
        tiers: formattedTiers
      };

      if (editingItem) {
        await api.updateSkill(editingItem.id || editingItem.title, skillPayload);
      } else {
        await api.addSkill(skillPayload);
      }

      // Sync every package/tier into pricing collection
      for (const tier of formattedTiers) {
        try {
          await api.createPricing({
            id: tier.id,
            service: form.title,
            category: form.category,
            name: tier.name,
            price: typeof tier.price === 'number' ? `₹${tier.price.toLocaleString('en-IN')}` : String(tier.price),
            deliveryTime: tier.deliveryTime,
            inclusions: tier.inclusions,
            features: tier.features,
            desc: tier.desc,
            highlight: tier.highlight
          });
        } catch (_e) {
          // Ignore duplicate pricing insert error
        }
      }

      showToast(`Saved "${form.title}" and ${formattedTiers.length} pricing packages successfully!`);
      setIsModalOpen(false);
      loadSkills();
    } catch (e) {
      showToast(e.message || 'Failed to save skill.');
    }
  };

  const categories = ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];
  const filteredSkills = filterCategory === 'All' ? skills : skills.filter((s) => s.category === filterCategory);

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease-out', position: 'relative', zIndex: 1 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 4 }}>
            SERVICE CATALOGUE & PACKAGES
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#fff', margin: 0, letterSpacing: '0.04em' }}>
            Skills & Services Manager
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Create and edit services and their pricing tiers directly. All packages update live on the website.
          </p>
        </div>
        <button
          onClick={openAdd}
          onMouseEnter={playHoverSound}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,45,85,0.4)',
            transition: 'transform 0.2s ease'
          }}
        >
          <Plus size={18} /> Add New Skill
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 8 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              backgroundColor: filterCategory === cat ? '#ff2d55' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: `1px solid ${filterCategory === cat ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
              fontSize: '0.82rem',
              fontWeight: filterCategory === cat ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading services & packages...</div>
      ) : filteredSkills.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Package size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>No services found</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Add a service above to display packages on the website.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredSkills.map((skill) => {
            const tierCount = Array.isArray(skill.tiers) ? skill.tiers.length : 0;
            const startPrice = skill.startingPrice || (skill.tiers?.[0]?.price) || 0;
            const formattedPrice = typeof startPrice === 'number' && startPrice > 0 ? `₹${startPrice.toLocaleString('en-IN')}` : (startPrice || 'CUSTOM');

            return (
              <div
                key={skill.id || skill.title}
                style={{
                  backgroundColor: 'rgba(15,15,20,0.95)',
                  border: skill.popular ? '1px solid #ff2d55' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 24,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: skill.popular ? '0 0 30px rgba(255,45,85,0.15)' : '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {skill.popular && (
                  <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 999, backgroundColor: '#ff2d55', color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    FEATURED
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: '2.5rem', width: 56, height: 56, borderRadius: 14, backgroundColor: 'rgba(255,45,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,45,85,0.2)' }}>
                      {skill.icon || '🎬'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#ff2d55', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {skill.category || 'SERVICE'}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', letterSpacing: '0.03em' }}>
                        {skill.title}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 20, minHeight: 42 }}>
                    {skill.desc || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Pricing Stats Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                        STARTING AT
                      </div>
                      <div style={{ fontWeight: 700, color: '#34c759', fontSize: '1.1rem', fontFamily: "'Bebas Neue', sans-serif" }}>
                        {formattedPrice}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                        TIERS
                      </div>
                      <div style={{ fontWeight: 700, color: tierCount > 0 ? '#ff2d55' : 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        {tierCount} {tierCount === 1 ? 'package' : 'packages'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => openEdit(skill)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,45,85,0.12)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,45,85,0.3)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Edit3 size={15} color="#ff2d55" /> Edit Service & Packages
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id || skill.title, skill.title)}
                      style={{
                        width: 42,
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,45,85,0.08)',
                        color: '#ff2d55',
                        border: '1px solid rgba(255,45,85,0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Skill & Package Modal */}
      {isModalOpen && (
        <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit ${editingItem.title}` : 'Create New Service'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
            {/* Service Basic Information Header */}
            <div style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
                1. BASIC SERVICE INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Service Name *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                    placeholder="e.g. Video Editing, Web Development"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Category *</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                    placeholder="e.g. Video & Film, Development"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Icon</label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none', textAlign: 'center', fontSize: '1.2rem' }}
                    placeholder="🎬"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Starting Price (₹)</label>
                  <input
                    type="number"
                    value={form.startingPrice}
                    onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                    placeholder="Auto-calculated"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Default Turnaround</label>
                  <input
                    value={form.turnaround}
                    onChange={(e) => setForm({ ...form, turnaround: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                    placeholder="e.g. 48-72 hrs"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Service Overview / Description</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  style={{ width: '100%', minHeight: 50, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none', resize: 'vertical' }}
                  placeholder="Brief description of this service..."
                />
              </div>
            </div>

            {/* Packages & Pricing Tiers Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    2. PACKAGES & PRICING TIERS ({form.tiers.length})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    Add pricing plans for this service (e.g. Starter, Professional, Premium).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,45,85,0.15)',
                    border: '1px solid rgba(255,45,85,0.3)',
                    color: '#ff2d55',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Add Package
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {form.tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      backgroundColor: tier.highlight ? 'rgba(255,45,85,0.06)' : 'rgba(0,0,0,0.25)',
                      border: tier.highlight ? '1px solid rgba(255,45,85,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', color: '#ff2d55', fontFamily: 'monospace', fontWeight: 700 }}>PACKAGE #{idx + 1}</span>
                        {tier.highlight && (
                          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, backgroundColor: '#ff2d55', color: '#fff', fontWeight: 700 }}>MOST POPULAR</span>
                        )}
                      </div>
                      {form.tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          style={{ backgroundColor: 'transparent', border: 'none', color: '#ff2d55', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Package Name *</label>
                        <input
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                          placeholder="e.g. Starter, Professional"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Price (₹) *</label>
                        <input
                          value={tier.price}
                          onChange={(e) => handleUpdateTier(idx, 'price', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                          placeholder="e.g. 4999 or Custom"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Delivery Time</label>
                        <input
                          value={tier.deliveryTime}
                          onChange={(e) => handleUpdateTier(idx, 'deliveryTime', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                          placeholder="e.g. 3-5 days"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        Key Inclusions (comma-separated, e.g. Color Grading, Sound FX, 4K Export, Normal Cuts)
                      </label>
                      <input
                        value={tier.inclusions}
                        onChange={(e) => handleUpdateTier(idx, 'inclusions', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                        placeholder="e.g. Color Grading, Sound FX, Normal Cuts, 4K Export"
                      />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        Additional Features (comma-separated)
                      </label>
                      <input
                        value={tier.features}
                        onChange={(e) => handleUpdateTier(idx, 'features', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                        placeholder="e.g. 2 Revisions, Commercial License, Source Files"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={tier.highlight}
                        onChange={(e) => handleUpdateTier(idx, 'highlight', e.target.checked)}
                        id={`highlight-${idx}`}
                      />
                      <label htmlFor={`highlight-${idx}`} style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>
                        Mark as "Most Popular" Tier
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #34c759, #28a745)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: 10,
                boxShadow: '0 4px 15px rgba(52,199,89,0.3)'
              }}
            >
              {editingItem ? 'Save Service & All Packages' : 'Create Service & Packages'}
            </button>
          </div>
        </GlassModal>
      )}
    </div>
  );
}
