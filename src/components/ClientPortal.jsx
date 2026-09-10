import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingBag,
  PackageCheck,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Phone,
  Video,
  Search,
  Sparkles,
  ShieldCheck,
  Download,
  CreditCard,
  FileText,
  Layers,
  ChevronRight,
  Info,
  Check,
  Play,
  Pause,
  X,
  Plus
} from 'lucide-react';
import { api, mediaUrl } from '../api.js';
import { playClickSound, playHoverSound } from '../utils/audio.js';
import { LOGO_URL, COMPANY_NAME } from '../data/siteData.js';

const SKILL_PRODUCTS = [
  {
    id: 'video-editing',
    title: 'Cinematic Video Editing',
    category: 'Creative Production',
    icon: '🎬',
    tagline: 'High-retention cinematic edits, YouTube reels, ads, and brand films.',
    startingPrice: 4999,
    turnaround: '48–72 Hours',
    features: ['4K Ultra HD Export', 'Cinematic Sound Design & Mix', 'Custom Motion Graphics & Lower Thirds', 'Color Grading & Film LUTs', '2 Free Iteration Cycles'],
    popular: true,
    tiers: [
      { name: 'Starter Pack', price: 4999, desc: 'Single Reel / 60s Short-Form Video', deliverables: '1 Reel/TikTok + Subtitles + 24h turnaround' },
      { name: 'Pro Creator', price: 12999, desc: 'Full YouTube Video (Up to 10 mins)', deliverables: '10m 4K Video + Sound FX + Thumbnail + Color Grade' },
      { name: 'Agency Retainer', price: 29999, desc: 'Complete Monthly Content Suite', deliverables: '12 Short-form reels + 2 Long-form videos + Priority support' }
    ]
  },
  {
    id: 'vfx-3d',
    title: 'VFX & 3D Motion Graphics',
    category: 'Visual Effects',
    icon: '✨',
    tagline: 'Hollywood-level CGI compositing, 3D product renders, and title sequences.',
    startingPrice: 8999,
    turnaround: '3–5 Days',
    features: ['CGI 3D Product Modeling', 'Motion Tracking & Clean Plates', 'Particle & Dynamic Simulations', 'Photorealistic Lighting & Shading', 'Source Project Files Included'],
    popular: false,
    tiers: [
      { name: 'Motion Titles', price: 8999, desc: 'Animated 3D Logo / Intro Sting', deliverables: '10s 3D sequence + 4K Alpha transparent export' },
      { name: 'Product Reveal', price: 18999, desc: '3D Product Commercial Commercial', deliverables: '30s 3D commercial + realistic studio lighting' },
      { name: 'VFX Scene Build', price: 34999, desc: 'Full VFX Scene Compositing', deliverables: 'Multi-shot CGI integration + camera tracking' }
    ]
  },
  {
    id: 'web-dev',
    title: 'High-Performance Web Development',
    category: 'Engineering',
    icon: '🌐',
    tagline: 'Ultra-fast Next-Gen 3D websites, web apps, portals, and conversion funnels.',
    startingPrice: 14999,
    turnaround: '4–7 Days',
    features: ['Modern React / Next.js / Vite Stack', 'Responsive Mobile-First UI/UX', 'SEO Optimization & Core Web Vitals 95+', 'Interactive GSAP / Three.js 3D Effects', 'Custom CMS & Database Integration'],
    popular: true,
    tiers: [
      { name: 'Landing Page', price: 14999, desc: 'High-Converting Single Page Web App', deliverables: 'Custom UI + Contact CRM + SEO + Domain setup' },
      { name: 'Corporate Portal', price: 28999, desc: 'Full Multi-Page Company Website', deliverables: '5-8 Custom Pages + CMS + Blog + Analytics' },
      { name: 'Custom Web Platform', price: 54999, desc: 'Full-Stack SaaS / eCommerce App', deliverables: 'Auth + Payment Gateways + Admin Panel + Database' }
    ]
  },
  {
    id: 'mobile-apps',
    title: 'iOS & Android App Engineering',
    category: 'Mobile Software',
    icon: '📱',
    tagline: 'Native performance mobile apps with fluid animations and scalable cloud backends.',
    startingPrice: 24999,
    turnaround: '7–14 Days',
    features: ['Cross-Platform React Native / Flutter', 'Smooth 60FPS Micro-Animations', 'Push Notifications & Auth', 'Payment Gateway Integration', 'App Store & Play Store Deployment'],
    popular: false,
    tiers: [
      { name: 'App Prototype / MVP', price: 24999, desc: 'Core Functionality Mobile App MVP', deliverables: 'iOS & Android build + Auth + Core screens' },
      { name: 'Production Mobile App', price: 49999, desc: 'Full Featured App for Commercial Launch', deliverables: 'Database + Notifications + Payments + Store submit' },
      { name: 'Enterprise Ecosystem', price: 89999, desc: 'App + Web Dashboard + Cloud API', deliverables: 'End-to-end multi-role mobile & web ecosystem' }
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI Automation & Agents',
    category: 'Automation & AI',
    icon: '⚙️',
    tagline: 'Custom AI workflows, automated lead pipelines, and autonomous support agents.',
    startingPrice: 9999,
    turnaround: '3–5 Days',
    features: ['OpenAI / Gemini API Integration', 'Automated Lead Qualification Bot', 'WhatsApp / Telegram Business Bots', 'CRM & Spreadsheet Synchronizer', 'Webhook & Cloud Function Setups'],
    popular: false,
    tiers: [
      { name: 'AI Workflow Bot', price: 9999, desc: 'Smart Automation for 1 Workflow', deliverables: 'Lead qualification or content automation flow' },
      { name: 'Autonomous Support Agent', price: 21999, desc: '24/7 AI Chatbot for Web & WhatsApp', deliverables: 'Custom Knowledgebase AI + WhatsApp integration' },
      { name: 'Full Business Automation', price: 44999, desc: 'Complete Operational AI Pipeline', deliverables: 'Multi-agent orchestration + CRM + ERP sync' }
    ]
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity & Visual Direction',
    category: 'Design Systems',
    icon: '🎨',
    tagline: 'Cohesive brand books, logo suites, typography systems, and marketing kits.',
    startingPrice: 7999,
    turnaround: '3–5 Days',
    features: ['Vector Logo Suite (Light & Dark)', 'Brand Color & Typography Guide', 'Social Media Branding Kit', 'Presentation Deck Master', 'Copyright & Commercial License'],
    popular: false,
    tiers: [
      { name: 'Logo & Essentials', price: 7999, desc: 'Core Logo & Color Direction', deliverables: '3 Logo Concepts + Typography + Vector files' },
      { name: 'Complete Brand Book', price: 16999, desc: 'Full Visual Identity Guidelines', deliverables: 'Logo Suite + Social Templates + Brand Book' },
      { name: '360° Agency Brand Kit', price: 32999, desc: 'Comprehensive Brand & Marketing Suite', deliverables: 'Full 3D logo animation + Deck + Collateral' }
    ]
  }
];

export function ClientPortal({ user, onBackToStudent, showToast, onStartCustomProject }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'store' | 'chat'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Skill purchase modal state
  const [checkoutSkill, setCheckoutSkill] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [orderForm, setOrderForm] = useState({ title: '', brief: '', files: [] });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // WhatsApp-style live chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const chatBottomRef = useRef(null);
  const chatFileRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Fetch client projects/orders
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getProjects();
      setOrders(res.projects || []);
      if (!selectedOrder && res.projects?.length > 0) {
        setSelectedOrder(res.projects[0]);
      }
    } catch {
      showToast('Could not load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }, [selectedOrder, showToast]);

  // Fetch client WhatsApp chat
  const loadChat = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await api.getClientChat();
      setChatMessages(res.messages || []);
    } catch {
      // silent
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadChat();
  }, [loadOrders, loadChat]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Handle switching back to Student / Learner profile
  const handleSwitchToStudent = async () => {
    playClickSound();
    try {
      await api.switchMode('learner');
      showToast('Switched back to Student Profile.');
      if (onBackToStudent) onBackToStudent();
    } catch {
      if (onBackToStudent) onBackToStudent();
    }
  };

  // Open checkout for a skill
  const handleOpenCheckout = (skill, tierIndex = 0) => {
    playClickSound();
    setCheckoutSkill(skill);
    setSelectedTier(skill.tiers[tierIndex]);
    setOrderForm({
      title: `${skill.title} - ${skill.tiers[tierIndex].name}`,
      brief: '',
      files: []
    });
  };

  // Submit skill order
  const handlePlaceSkillOrder = async () => {
    if (!orderForm.title.trim()) {
      showToast('Please enter an order title.');
      return;
    }
    setSubmittingOrder(true);
    playClickSound();
    try {
      const fd = new FormData();
      fd.append('service', checkoutSkill.title);
      fd.append('title', orderForm.title.trim());
      fd.append('description', orderForm.brief.trim() || `Client ordered ${selectedTier.name} for ${checkoutSkill.title}`);
      fd.append('servicePlan', selectedTier.name);
      fd.append('totalAmount', selectedTier.price);
      fd.append('answers', JSON.stringify({
        tier: selectedTier.name,
        category: checkoutSkill.category,
        customBrief: orderForm.brief.trim(),
        price: selectedTier.price
      }));

      if (orderForm.files && orderForm.files.length > 0) {
        orderForm.files.forEach(f => fd.append('files', f));
      }

      const res = await api.createProject(fd);
      showToast(`Order created successfully: ${res.project.title}!`);
      setCheckoutSkill(null);
      await loadOrders();
      setActiveTab('orders');

      // Also send a notification message in WhatsApp chat
      try {
        await api.sendClientChatMessage({
          text: `📦 [NEW ORDER PLACED] I just placed an order for "${res.project.title}" (₹${selectedTier.price.toLocaleString()}). Order ID: ${res.project.id}`
        });
        await loadChat();
      } catch {
        // silent
      }
    } catch (e) {
      showToast(e.message || 'Failed to place order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Send message in WhatsApp chat
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;
    setSendingMsg(true);
    playClickSound();
    try {
      const res = await api.sendClientChatMessage({ text: textToSend.trim() });
      if (res.message) {
        setChatMessages(prev => [...prev, res.message]);
      }
      if (res.autoReply) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, res.autoReply]);
        }, 600);
      }
      setChatInput('');
    } catch {
      showToast('Could not send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  // Upload attachment in WhatsApp chat
  const handleUploadChatAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast('Uploading attachment...');
    playClickSound();
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('text', `📎 Sent file: ${file.name}`);
      const res = await api.uploadClientChatFile(fd);
      if (res.message) {
        setChatMessages(prev => [...prev, res.message]);
        showToast('Attachment sent.');
      }
    } catch {
      showToast('Failed to upload attachment.');
    }
    e.target.value = '';
  };

  // Simulate voice recording
  const handleToggleVoiceRecord = () => {
    playClickSound();
    if (isRecording) {
      // Finish recording and send voice note
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      const duration = recordingTime;
      setRecordingTime(0);

      if (duration > 1) {
        handleSendMessage(`🎙️ Voice Message (${duration}s) - "Studio consultation voice inquiry"`);
      }
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    }
  };

  const activeOrdersCount = orders.filter(o => o.projectState === 'active').length;
  const completedOrdersCount = orders.filter(o => o.projectState === 'finished' || o.status === 'Completed').length;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 24px 80px', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Top Persona Switcher Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.95), rgba(10, 10, 15, 0.98))',
          border: '1px solid rgba(255, 45, 85, 0.35)',
          borderRadius: 24,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(255, 45, 85, 0.1)',
          marginBottom: 32
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ff2d55, #991b1b)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.7rem',
              boxShadow: '0 0 25px rgba(255, 45, 85, 0.5)'
            }}
          >
            💼
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.9rem', letterSpacing: '0.06em', color: '#fff' }}>
                CLIENT & BUYER PORTAL
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(52, 199, 89, 0.2)',
                  border: '1px solid rgba(52, 199, 89, 0.4)',
                  color: '#34c759',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}
              >
                ● ACTIVE CLIENT MODE
              </span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.86rem', marginTop: 2 }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user?.name || 'Client'}</strong>. Order skills, track deliverables, and talk live with Assets Weber on WhatsApp.
            </div>
          </div>
        </div>

        {/* Persona Switch Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSwitchToStudent}
            onMouseEnter={playHoverSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 22px',
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            title="Switch back to Student / Learner view"
          >
            <ArrowRightLeft size={16} color="#ff2d55" />
            <span>Switch to Student Profile 🎓</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics Ribbon ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Orders', value: activeOrdersCount, icon: '📦', color: '#ff2d55' },
          { label: 'Completed Deliveries', value: completedOrdersCount, icon: '✅', color: '#34c759' },
          { label: 'Total Placed Orders', value: orders.length, icon: '📑', color: '#007aff' },
          { label: 'Assets Weber Studio', value: '🟢 Online & Ready', icon: '⚡', color: '#ff9500' }
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '18px 22px',
              borderRadius: 18,
              backgroundColor: 'rgba(14, 14, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: stat.color, marginTop: 4 }}>
                {stat.value}
              </div>
            </div>
            <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: 16, marginBottom: 36, flexWrap: 'wrap' }}>
        {[
          { id: 'orders', label: 'My Orders & Tracking', icon: PackageCheck, badge: orders.length },
          { id: 'store', label: 'Purchase Skills & Store', icon: ShoppingBag, badge: '6 Skills' },
          { id: 'chat', label: 'WhatsApp Chat with Studio', icon: MessageSquare, badge: 'Live Support' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
              }}
              onMouseEnter={playHoverSound}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                borderRadius: 14,
                backgroundColor: isActive ? 'rgba(255, 45, 85, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: MY ORDERS & TRACKING ── */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', margin: 0 }}>
                MY PRODUCTION ORDERS
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '4px 0 0' }}>
                Track real-time progress, review milestones, and download final high-res project deliverables.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('store')}
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
                boxShadow: '0 0 20px rgba(255, 45, 85, 0.4)'
              }}
            >
              <Plus size={16} /> Purchase New Skill
            </button>
          </div>

          {loadingOrders ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            /* Empty state */
            <div
              style={{
                border: '1px dashed rgba(255, 45, 85, 0.3)',
                borderRadius: 24,
                padding: '64px 32px',
                textAlign: 'center',
                backgroundColor: 'rgba(14, 14, 20, 0.6)'
              }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📦</div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', marginBottom: 8 }}>
                NO ACTIVE ORDERS FOUND
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 24px', fontSize: '0.9rem' }}>
                You haven't ordered any skills or production services yet. Explore our verified skill packages in the store to launch your project.
              </p>
              <button
                onClick={() => setActiveTab('store')}
                style={{
                  padding: '14px 28px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                Browse Skill Store →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 28, alignItems: 'start' }}>
              {/* Order List Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedOrder(order);
                      }}
                      onMouseEnter={playHoverSound}
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        backgroundColor: isSelected ? 'rgba(255, 45, 85, 0.15)' : 'rgba(16, 16, 24, 0.85)',
                        border: `1px solid ${isSelected ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#ff2d55', fontWeight: 700 }}>
                          ORDER #{order.id?.slice(-8)?.toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: order.status === 'Completed' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)',
                            color: order.status === 'Completed' ? '#34c759' : '#ff9500',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {order.status || 'Active'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: 4 }}>
                        {order.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: 12 }}>
                        {order.service} · {order.servicePlan || 'Custom Tier'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                        <span>Amount: <strong style={{ color: '#fff' }}>₹{(order.totalAmount || 0).toLocaleString()}</strong></span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Detail View */}
              {selectedOrder && (
                <div
                  style={{
                    backgroundColor: 'rgba(14, 14, 20, 0.95)',
                    border: '1px solid rgba(255, 45, 85, 0.3)',
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', fontWeight: 700, letterSpacing: '0.1em' }}>
                        ORDER DETAILS // ID: {selectedOrder.id}
                      </div>
                      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: '4px 0 0' }}>
                        {selectedOrder.title}
                      </h3>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                        Category: {selectedOrder.service} | Package: {selectedOrder.servicePlan || 'Custom'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>ORDER AMOUNT</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#34c759' }}>
                        ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Production Status Timeline */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 12 }}>
                      PRODUCTION TIMELINE STATUS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {[
                        { title: 'Brief Received', active: true },
                        { title: 'In Production', active: selectedOrder.status !== 'Pending Payment' },
                        { title: 'Quality Review', active: selectedOrder.status === 'Review' || selectedOrder.status === 'Completed' },
                        { title: 'Delivered', active: selectedOrder.status === 'Completed' }
                      ].map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 12,
                            backgroundColor: step.active ? 'rgba(255, 45, 85, 0.2)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${step.active ? '#ff2d55' : 'rgba(255,255,255,0.08)'}`,
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: step.active ? '#ff2d55' : 'rgba(255,255,255,0.4)' }}>
                            0{idx + 1}. {step.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brief & Notes */}
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
                    <div style={{ fontSize: '0.75rem', color: '#ff2d55', fontFamily: 'monospace', marginBottom: 6 }}>
                      PROJECT SPECIFICATIONS & BRIEF
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {selectedOrder.description || 'No custom notes provided.'}
                    </p>
                  </div>

                  {/* Deliverables / Files */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 12 }}>
                      DELIVERABLE ASSETS & FILES ({(selectedOrder.files || []).length})
                    </div>
                    {(selectedOrder.files || []).length === 0 ? (
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: 14, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center' }}>
                        Working files and final exports will appear here once ready.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {selectedOrder.files.map((file) => (
                          <div
                            key={file.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              borderRadius: 12,
                              backgroundColor: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)'
                            }}
                          >
                            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
                              📁 {file.originalName || file.filename}
                            </span>
                            <a
                              href={mediaUrl(file.url)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                borderRadius: 8,
                                backgroundColor: 'rgba(255,45,85,0.2)',
                                border: '1px solid rgba(255,45,85,0.4)',
                                color: '#ff2d55',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none'
                              }}
                            >
                              <Download size={14} /> Download File
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Footer */}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(`💬 Question regarding Order #${selectedOrder.id?.slice(-8)}: "${selectedOrder.title}"`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        borderRadius: 12,
                        backgroundColor: '#25D366',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={16} /> Chat on WhatsApp with Handler
                    </button>
                    <a
                      href="https://wa.me/919416085060?text=Hello%20Assets%20Weber%20Team!%20I%20have%20an%20inquiry%20regarding%20my%20order."
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={16} /> Open Official WhatsApp App
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SKILL & PRODUCT STORE ── */}
      {activeTab === 'store' && (
        <div>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.2em' }}>
              ASSETS WEBER SKILL CATALOG & PRODUCTION PACKAGES
            </span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', margin: '6px 0 12px' }}>
              PURCHASE VERIFIED STUDIO SKILLS
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Order high-tier creative production, software engineering, and AI automation delivered directly by the Assets Weber team.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
            {SKILL_PRODUCTS.map((skill) => (
              <div
                key={skill.id}
                onMouseEnter={playHoverSound}
                style={{
                  position: 'relative',
                  padding: 32,
                  borderRadius: 24,
                  backgroundColor: skill.popular ? 'rgba(18, 18, 28, 0.95)' : 'rgba(12, 12, 18, 0.85)',
                  border: skill.popular ? '2px solid #ff2d55' : '1px solid rgba(255, 45, 85, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: skill.popular ? '0 20px 50px rgba(255, 45, 85, 0.25)' : 'none',
                  overflow: 'hidden'
                }}
              >
                {skill.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 20,
                      padding: '4px 12px',
                      borderRadius: 999,
                      backgroundColor: '#ff2d55',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em'
                    }}
                  >
                    BESTSELLER SKILL
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>{skill.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#ff2d55', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {skill.category}
                  </div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.9rem', color: '#fff', margin: '4px 0 10px' }}>
                    {skill.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.86rem', lineHeight: 1.5, minHeight: 40, marginBottom: 20 }}>
                    {skill.tagline}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>FROM</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.6rem', color: '#fff' }}>
                      ₹{skill.startingPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#34c759', fontWeight: 600, marginLeft: 8 }}>
                      ⚡ {skill.turnaround}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {skill.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                        <span style={{ color: '#ff2d55', fontWeight: 700 }}>✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 16 }}>
                    {skill.tiers.map((tier, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOpenCheckout(skill, idx)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tier.name.split(' ')[0]}</div>
                        <div style={{ color: '#ff2d55', fontWeight: 700 }}>₹{(tier.price / 1000).toFixed(0)}k</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleOpenCheckout(skill, 0)}
                    onMouseEnter={playHoverSound}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: 14,
                      background: skill.popular ? 'linear-gradient(135deg, #ff2d55, #c81e42)' : 'rgba(255, 255, 255, 0.08)',
                      border: skill.popular ? 'none' : '1px solid rgba(255, 45, 85, 0.4)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    Order Skill Package →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: WHATSAPP CHAT WITH ASSETS WEBER ── */}
      {activeTab === 'chat' && (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: '#0b141a', // WhatsApp Web dark aesthetic
              border: '1px solid rgba(255, 45, 85, 0.3)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              height: '75vh',
              minHeight: 580
            }}
          >
            {/* WhatsApp Header */}
            <div
              style={{
                backgroundColor: '#1f2c34',
                padding: '14px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={LOGO_URL}
                    alt={COMPANY_NAME}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#000', border: '2px solid #25D366' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#25D366', border: '2px solid #1f2c34' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e9edef' }}>
                      Assets Weber Official Studio
                    </span>
                    <span style={{ color: '#25D366', fontSize: '0.9rem' }} title="Verified Studio Account">✓</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8696a0' }}>
                    Active Online • +91 94160 85060 • Replies in under 5m
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setShowCallModal(true)}
                  style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: 'none', color: '#aebac1', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                  title="Direct Phone Call"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => setShowCallModal(true)}
                  style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: 'none', color: '#aebac1', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                  title="Video Call"
                >
                  <Video size={18} />
                </button>
                <a
                  href="https://wa.me/919416085060?text=Hello%20Assets%20Weber!%20I%20am%20chatting%20from%20the%20website%20portal."
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    backgroundColor: '#25D366',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Open WhatsApp
                </a>
              </div>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div style={{ backgroundColor: '#111b21', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, overflowX: 'auto' }}>
              {[
                '📦 Track My Order Status',
                '🎨 Request Revision on Deliverable',
                '💳 Payment & Invoice Help',
                '⚡ Express 24h Delivery',
                '📞 Schedule Studio Call'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#8696a0',
                    fontSize: '0.76rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* WhatsApp Chat Canvas */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                backgroundImage: 'radial-gradient(rgba(255, 45, 85, 0.05) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                backgroundColor: '#0b141a',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Encryption Banner */}
              <div
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#182229',
                  borderRadius: 10,
                  padding: '6px 14px',
                  color: '#ffd279',
                  fontSize: '0.74rem',
                  textAlign: 'center',
                  maxWidth: 420,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}
              >
                🔒 Messages with Assets Weber Studio are end-to-end encrypted & synced with our creative handlers.
              </div>

              {chatLoading ? (
                <div style={{ textAlign: 'center', color: '#8696a0', padding: 20 }}>Syncing WhatsApp chat...</div>
              ) : chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8696a0', margin: 'auto', padding: 30 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💬</div>
                  <div style={{ fontWeight: 600, color: '#e9edef' }}>Start a live conversation with Assets Weber</div>
                  <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Ask about custom skills, request revisions, check order status, or get advice!</div>
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.senderRole === 'client';
                  const isBot = msg.senderRole === 'system';
                  return (
                    <div
                      key={msg.id || i}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isMe ? '#005c4b' : isBot ? '#182229' : '#202c33',
                          color: '#e9edef',
                          padding: '10px 14px',
                          borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          fontSize: '0.9rem',
                          lineHeight: 1.45,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {!isMe && (
                          <div style={{ fontSize: '0.75rem', color: isBot ? '#ffd279' : '#53bdeb', fontWeight: 700, marginBottom: 4 }}>
                            {msg.senderName || (isBot ? 'Studio Assistant' : 'Assets Weber Team')}
                          </div>
                        )}

                        {/* File Attachment preview */}
                        {msg.fileUrl && (
                          <div style={{ marginBottom: 8 }}>
                            {msg.fileType === 'image' ? (
                              <img src={mediaUrl(msg.fileUrl)} alt={msg.fileName || 'Attachment'} style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                              <a
                                href={mediaUrl(msg.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#53bdeb', textDecoration: 'underline', fontSize: '0.85rem' }}
                              >
                                <Download size={14} /> {msg.fileName || 'Download File'}
                              </a>
                            )}
                          </div>
                        )}

                        <div>{msg.text}</div>

                        {/* Timestamp & read ticks */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>
                          <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                          {isMe && <span style={{ color: '#53bdeb', fontWeight: 700 }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* WhatsApp Composer Footer */}
            <div
              style={{
                backgroundColor: '#202c33',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderTop: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Attachment Clip */}
              <button
                onClick={() => chatFileRef.current?.click()}
                style={{ background: 'transparent', border: 'none', color: '#8696a0', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                title="Attach Document / Media"
              >
                <Paperclip size={20} />
              </button>
              <input ref={chatFileRef} type="file" style={{ display: 'none' }} onChange={handleUploadChatAttachment} />

              {/* Voice Record Button */}
              <button
                onClick={handleToggleVoiceRecord}
                style={{
                  background: isRecording ? '#ff2d55' : 'transparent',
                  border: 'none',
                  color: isRecording ? '#fff' : '#8696a0',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 0.2s'
                }}
                title={isRecording ? 'Stop & Send Voice Note' : 'Record Voice Note'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={20} />}
              </button>

              {isRecording ? (
                <div style={{ flex: 1, color: '#ff2d55', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>🔴 Recording Voice Note... {recordingTime}s</span>
                  <span style={{ fontSize: '0.78rem', color: '#8696a0' }}>(Click microphone to send)</span>
                </div>
              ) : (
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Type a message to Assets Weber..."
                  style={{
                    flex: 1,
                    backgroundColor: '#2a3942',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 16px',
                    color: '#d1d7db',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              )}

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={sendingMsg || (!chatInput.trim() && !isRecording)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#00a884',
                  border: 'none',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: (!chatInput.trim() && !isRecording) ? 'not-allowed' : 'pointer',
                  opacity: (!chatInput.trim() && !isRecording) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SKILL CHECKOUT MODAL ── */}
      {checkoutSkill && selectedTier && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'grid',
            placeItems: 'center',
            padding: 20
          }}
          onClick={() => setCheckoutSkill(null)}
        >
          <div
            style={{
              maxWidth: 640,
              width: '100%',
              backgroundColor: '#0e0e14',
              border: '1px solid rgba(255, 45, 85, 0.4)',
              borderRadius: 24,
              padding: 32,
              boxShadow: '0 30px 90px rgba(0,0,0,0.9)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
                  SKILL CHECKOUT // {checkoutSkill.category}
                </span>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#fff', margin: '4px 0 0' }}>
                  {checkoutSkill.title}
                </h3>
              </div>
              <button onClick={() => setCheckoutSkill(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* Select Tier */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>
                SELECT PACKAGE TIER
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {checkoutSkill.tiers.map((tier) => {
                  const isSel = selectedTier.name === tier.name;
                  return (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 12,
                        backgroundColor: isSel ? 'rgba(255,45,85,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSel ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
                        color: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{tier.name}</div>
                      <div style={{ color: '#ff2d55', fontWeight: 800, fontSize: '1.1rem', marginTop: 4 }}>
                        ₹{tier.price.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, marginTop: 10, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                <strong>Deliverables:</strong> {selectedTier.deliverables}
              </div>
            </div>

            {/* Custom Project Title & Brief */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', display: 'block', marginBottom: 6 }}>
                ORDER / PROJECT TITLE *
              </label>
              <input
                value={orderForm.title}
                onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                placeholder="e.g. YouTube Video Editing for Brand Launch"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', display: 'block', marginBottom: 6 }}>
                BRIEF & SPECIFICATIONS (OPTIONAL)
              </label>
              <textarea
                value={orderForm.brief}
                onChange={(e) => setOrderForm({ ...orderForm, brief: e.target.value })}
                placeholder="Describe your requirements, references, turnaround deadlines, or any specific details..."
                style={{ width: '100%', minHeight: 90, padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Total summary & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>TOTAL PRICE</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#34c759' }}>
                  ₹{selectedTier.price.toLocaleString()}
                </div>
              </div>

              <button
                onClick={handlePlaceSkillOrder}
                disabled={submittingOrder}
                style={{
                  padding: '16px 32px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 0 25px rgba(255, 45, 85, 0.5)',
                  cursor: submittingOrder ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingOrder ? 'Processing Order...' : `Confirm & Place Order →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALL MODAL ── */}
      {showCallModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'grid',
            placeItems: 'center',
            padding: 20
          }}
          onClick={() => setShowCallModal(false)}
        >
          <div
            style={{
              maxWidth: 460,
              width: '100%',
              backgroundColor: '#12121c',
              border: '1px solid rgba(255, 45, 85, 0.4)',
              borderRadius: 24,
              padding: 32,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📞</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
              CONNECT WITH ASSETS WEBER
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', margin: '8px 0 24px' }}>
              Direct hotline with studio leads for urgent order briefs, creative consultations, and technical inquiries.
            </p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 14, marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', color: '#ff2d55', fontFamily: 'monospace' }}>DIRECT HOTLINE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
                +91 94160 85060
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href="tel:+919416085060"
                style={{ flex: 1, padding: '14px', borderRadius: 12, backgroundColor: '#007aff', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}
              >
                Call Now
              </a>
              <a
                href="https://wa.me/919416085060?text=Hello%20Assets%20Weber!%20I%20would%20like%20to%20request%20a%20call."
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, padding: '14px', borderRadius: 12, backgroundColor: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}
              >
                WhatsApp Call
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
