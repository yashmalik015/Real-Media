import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  ShoppingBag,
  PackageCheck,
  MessageSquare,
  ArrowRightLeft,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Phone,
  Video,
  ExternalLink,
  Download,
  Clock,
  Star,
  X,
  Upload
} from 'lucide-react';
import { api, mediaUrl } from '../api.js';
import { LOGO_URL, COMPANY_NAME } from '../data/siteData.js';

// ── Service catalog ──────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'video-editing',
    title: 'Video Editing',
    category: 'Video & Film',
    icon: '🎬',
    rating: 4.9,
    reviews: 342,
    desc: 'Cinematic edits, YouTube videos, reels, ads, and brand films.',
    startingPrice: 4999,
    turnaround: '48–72 hrs',
    features: [
      '4K 60FPS delivery',
      'Sound design & mixing',
      'Motion graphics & captions',
      'Color grading',
      '2 free revisions + source files'
    ],
    popular: true,
    tiers: [
      { name: 'Reel Pack', price: 4999, desc: '1 short reel with subtitles', deliverables: '1 Reel + Captions + 24h delivery' },
      { name: 'YouTube Pro', price: 12999, desc: 'Full YouTube video (up to 12 min)', deliverables: '4K Video + Sound FX + Thumbnail' },
      { name: 'Monthly Suite', price: 29999, desc: 'Full monthly content package', deliverables: '12 Reels + 2 Long-form + Dedicated handler' }
    ]
  },
  {
    id: 'vfx-3d',
    title: 'VFX & 3D Graphics',
    category: 'Visual Effects',
    icon: '✨',
    rating: 4.95,
    reviews: 189,
    desc: 'CGI compositing, 3D product animations, and visual storytelling.',
    startingPrice: 8999,
    turnaround: '3–5 days',
    features: [
      '3D product modeling',
      'Camera tracking & compositing',
      'Particle & smoke simulations',
      'Studio lighting & renders',
      'Source 3D files included'
    ],
    popular: false,
    tiers: [
      { name: '3D Logo Intro', price: 8999, desc: 'Cinematic 3D logo reveal', deliverables: '10s 3D sequence + 4K export' },
      { name: 'Product Video', price: 18999, desc: '30s photorealistic product ad', deliverables: '30s 3D commercial + studio lighting' },
      { name: 'Full VFX Scene', price: 34999, desc: 'Multi-shot CGI integration', deliverables: 'Full compositing + green screen + tracking' }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    category: 'Software',
    icon: '🌐',
    rating: 5.0,
    reviews: 420,
    desc: 'Fast, modern websites, web apps, SaaS portals, and landing pages.',
    startingPrice: 14999,
    turnaround: '4–7 days',
    features: [
      'React / Next.js architecture',
      'Smooth animations & interactions',
      'SEO score 95+ on PageSpeed',
      'Admin dashboard & CMS',
      'Free domain, SSL & deployment'
    ],
    popular: true,
    tiers: [
      { name: 'Landing Page', price: 14999, desc: 'Single-page web app', deliverables: 'Custom UI/UX + Lead CRM + Speed optimization' },
      { name: 'Business Website', price: 28999, desc: 'Multi-page brand website', deliverables: '5-8 pages + CMS + Blog + Analytics' },
      { name: 'Custom Platform', price: 54999, desc: 'Full-stack web application', deliverables: 'Auth + Payments + Admin + Database' }
    ]
  },
  {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    category: 'Mobile',
    icon: '📱',
    rating: 4.85,
    reviews: 156,
    desc: 'Cross-platform iOS & Android apps with smooth UX.',
    startingPrice: 24999,
    turnaround: '7–14 days',
    features: [
      'React Native / Flutter',
      'Smooth 60fps animations',
      'Push notifications & analytics',
      'Payment gateway integration',
      'App Store submission support'
    ],
    popular: false,
    tiers: [
      { name: 'MVP App', price: 24999, desc: 'Core functionality prototype', deliverables: 'iOS & Android + Auth + Core screens' },
      { name: 'Production App', price: 49999, desc: 'Full-featured commercial app', deliverables: 'Database + Notifications + Payments' },
      { name: 'Enterprise Suite', price: 89999, desc: 'App + web admin dashboard', deliverables: 'Multi-role mobile & web ecosystem' }
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    category: 'AI',
    icon: '⚙️',
    rating: 4.92,
    reviews: 215,
    desc: 'Custom AI agents, chatbots, and business automation.',
    startingPrice: 9999,
    turnaround: '3–5 days',
    features: [
      'Gemini & OpenAI integrations',
      'WhatsApp & CRM automations',
      'Google Sheets & Notion sync',
      '24/7 customer support bots',
      'Cloud webhook infrastructure'
    ],
    popular: false,
    tiers: [
      { name: 'Workflow Bot', price: 9999, desc: 'Single automation pipeline', deliverables: 'Lead qualification or content automation' },
      { name: 'WhatsApp AI', price: 21999, desc: '24/7 WhatsApp support agent', deliverables: 'Custom AI + WhatsApp Business' },
      { name: 'AI Suite', price: 44999, desc: 'Full operational AI system', deliverables: 'Multi-agent + CRM + ERP sync' }
    ]
  },
  {
    id: 'brand-identity',
    title: 'Brand & Design',
    category: 'Design',
    icon: '🎨',
    rating: 4.88,
    reviews: 275,
    desc: 'Logos, brand books, social media kits, and pitch decks.',
    startingPrice: 7999,
    turnaround: '3–5 days',
    features: [
      'Vector logo in all formats',
      'Color palette & typography guide',
      'Social media templates',
      'Pitch deck design',
      'Full commercial rights transfer'
    ],
    popular: false,
    tiers: [
      { name: 'Logo Essentials', price: 7999, desc: 'Core logo & colors', deliverables: '3 Logo concepts + Typography + Vectors' },
      { name: 'Brand Book', price: 16999, desc: 'Full identity guidelines', deliverables: 'Logo suite + Social templates + Brand book' },
      { name: 'Studio Brand Kit', price: 32999, desc: 'Complete brand + 3D logo', deliverables: '3D logo animation + Pitch deck + Print' }
    ]
  }
];

// ── Main Component ───────────────────────────────────────────────────────────
export function ClientPortal({ user, skills = [], onBackToStudent, showToast, onStartCustomProject }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Use dynamic skills if available, fallback to static
  const displaySkills = skills?.length > 0 ? skills : SERVICES;

  // Store checkout
  const [checkoutSkill, setCheckoutSkill] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [orderForm, setOrderForm] = useState({ title: '', brief: '' });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Review state
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const chatBottomRef = useRef(null);
  const chatFileRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [clientTestimonials, setClientTestimonials] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.updateUserAvatar(fd);
      showToast('Profile picture updated successfully!');
      // Assuming a page reload or state update is handled externally, 
      // but let's just reload the page for now to get fresh user context
      window.location.reload();
    } catch (err) {
      showToast(err.message || 'Could not upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Data Loading ─────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [res, testRes] = await Promise.all([
        api.getProjects(),
        api.getMyTestimonials().catch(() => ({ testimonials: [] }))
      ]);
      setOrders(res.projects || []);
      setClientTestimonials(testRes.testimonials || []);
    } catch {
      showToast('Could not load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }, [showToast]);

  const loadChat = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await api.getClientChat();
      setChatMessages(res.messages || []);
    } catch { /* silent */ } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); loadChat(); }, [loadOrders, loadChat]);

  useEffect(() => {
    const socket = io(window.location.origin);
    socket.on('clientChatMessage', (msg) => {
      // Only append if it's not already in the list
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        
        // Auto-mark as read if we are on the chat tab, otherwise show notification
        if (activeTab !== 'chat') {
          showToast(`New message: ${msg.text.substring(0, 30)}...`);
        }
        
        return [...prev, msg];
      });
    });

    return () => socket.disconnect();
  }, [activeTab, showToast]);

  useEffect(() => {
    if (activeTab === 'chat') chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSwitchToStudent = async () => {
    try { await api.switchMode('learner'); } catch { /* silent */ }
    showToast('Switched to Student Profile.');
    if (onBackToStudent) onBackToStudent();
  };

  const handleOpenCheckout = (skill, tierIndex = 0) => {
    setCheckoutSkill(skill);
    setSelectedTier(skill.tiers[tierIndex]);
    setOrderForm({ title: `${skill.title} - ${skill.tiers[tierIndex].name}`, brief: '' });
  };

  const handlePlaceOrder = async () => {
    if (!orderForm.title.trim()) { showToast('Please enter a project name.'); return; }
    setSubmittingOrder(true);
    try {
      const fd = new FormData();
      fd.append('service', checkoutSkill.title);
      fd.append('title', orderForm.title.trim());
      fd.append('description', orderForm.brief.trim() || `Ordered ${selectedTier.name} for ${checkoutSkill.title}`);
      fd.append('servicePlan', selectedTier.name);
      fd.append('totalAmount', selectedTier.price);
      fd.append('answers', JSON.stringify({
        tier: selectedTier.name,
        category: checkoutSkill.category,
        customBrief: orderForm.brief.trim(),
        price: selectedTier.price
      }));

      const res = await api.createProject(fd);
      showToast(`Order placed: ${res.project.title}`);
      setCheckoutSkill(null);
      await loadOrders();
      setActiveTab('orders');

      try {
        await api.sendClientChatMessage({
          text: `📦 New order placed: "${res.project.title}" (₹${selectedTier.price.toLocaleString()})`
        });
        await loadChat();
      } catch { /* silent */ }
    } catch (e) {
      showToast(e.message || 'Failed to place order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Review submission
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) { showToast('Please write a short review.'); return; }
    setSubmittingReview(true);
    try {
      const payload = {
        projectTitle: reviewingOrder.title || '',
        name: user?.name || 'Client',
        biz: '',
        quote: reviewText.trim(),
        result: String(reviewRating),
        tag: reviewingOrder.service || 'General'
      };
      const { testimonial } = await api.submitTestimonial(payload);
      if (testimonial) {
        setClientTestimonials(prev => [...prev, testimonial]);
      }
      showToast('Thank you for your review! ⭐');
      setReviewingOrder(null);
      setReviewText('');
      setReviewRating(5);
    } catch (e) {
      showToast(e.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Chat
  const handleSendMessage = async (customText = null) => {
    const text = customText || chatInput;
    if (!text.trim()) return;
    setSendingMsg(true);
    try {
      const res = await api.sendClientChatMessage({ text: text.trim() });
      if (res.message) {
         // message will be appended by socket event
      }
      setChatInput('');
    } catch { showToast('Could not send message.'); } finally { setSendingMsg(false); }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('text', `📎 Sent: ${file.name}`);
      const res = await api.uploadClientChatFile(fd);
      if (res.message) { setChatMessages(prev => [...prev, res.message]); showToast('File sent.'); }
    } catch { showToast('Upload failed.'); }
    e.target.value = '';
  };

  const handleToggleVoice = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const dur = recordingTime;
          
          if (dur > 1) {
            const fd = new FormData();
            fd.append('file', audioBlob, 'voicemessage.webm');
            fd.append('text', `🎙️ Voice message (${dur}s)`);
            fd.append('isVoice', 'true');
            fd.append('voiceDuration', dur.toString());
            try {
              const res = await api.uploadClientChatFile(fd);
              if (res.message) {
                setChatMessages(prev => [...prev, res.message]);
                showToast('Voice message sent.');
              }
            } catch { showToast('Upload failed.'); }
          }
          
          // Stop tracks to release mic
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      } catch (err) {
        showToast('Microphone access denied or unavailable.');
      }
    }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async (order) => {
    setProcessingPayment(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      const { id: order_id, amount, currency } = await api.createPaymentOrder({ projectId: order.id, amount: order.totalAmount });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: currency || 'INR',
        name: 'Assets Weber Studio',
        description: order.title,
        order_id,
        handler: async (response) => {
          try {
            await api.verifyPayment({
              projectId: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.totalAmount
            });
            showToast('Payment successful!');
            await loadOrders();
          } catch {
            showToast('Payment verification failed.');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#ff2d55' }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', () => showToast('Payment failed.'));
      paymentObject.open();
    } catch (e) {
      showToast(e.message || 'Payment initiation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Filters
  const filteredOrders = orders.filter(o => {
    if (ordersFilter === 'active') return o.projectState === 'active' && o.status !== 'Completed';
    if (ordersFilter === 'completed') return o.projectState === 'finished' || o.status === 'Completed';
    if (ordersFilter === 'pending') return o.paymentStatus === 'pending';
    return true;
  });

  const activeCount = orders.filter(o => o.projectState === 'active' && o.status !== 'Completed').length;
  const completedCount = orders.filter(o => o.projectState === 'finished' || o.status === 'Completed').length;

  // ── Shared styles ────────────────────────────────────────────────────────
  const card = {
    borderRadius: 16,
    backgroundColor: 'rgba(14, 14, 20, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  };

  const pill = (active) => ({
    padding: '8px 18px',
    borderRadius: 999,
    backgroundColor: active ? '#ff2d55' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#ff2d55' : 'rgba(255,255,255,0.1)'}`,
    color: '#fff',
    fontSize: '0.84rem',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 80px', color: '#fff', fontFamily: "'Inter', sans-serif", position: 'relative', zIndex: 10 }}>

      {/* ── Simple Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 28px', borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(20,20,30,0.95), rgba(12,12,18,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 28, flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div 
            onClick={() => avatarInputRef.current?.click()}
            style={{
              position: 'relative',
              width: 50, height: 50, flexShrink: 0,
              cursor: uploadingAvatar ? 'wait' : 'pointer'
            }}
            title="Click to upload profile picture"
          >
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'rgba(255,45,85,0.2)',
              border: '1px solid #ff2d55', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={mediaUrl(user.avatar)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#ff2d55', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {(user?.name || 'C').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Camera badge */}
            <div style={{
              position: 'absolute', bottom: -2, right: -2, width: 20, height: 20,
              backgroundColor: '#ff2d55', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', border: '2px solid #000'
            }}>
              <Upload size={10} color="#fff" />
            </div>

            {uploadingAvatar && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <div style={{ width: 16, height: 16, border: '2px solid #ff2d55', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
          </div>
          <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />

          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.04em', margin: 0 }}>
              Welcome back, {user?.name || 'Client'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', margin: '4px 0 0' }}>
              {user?.email} · Client Portal
            </p>
          </div>
        </div>
        <button
          onClick={handleSwitchToStudent}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <ArrowRightLeft size={14} /> Switch to Student 🎓
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { id: 'orders', label: 'My Orders', icon: PackageCheck, badge: orders.length || null },
          { id: 'chat', label: 'Chat', icon: MessageSquare, badge: '🟢' }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12,
              backgroundColor: active ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? '#ff2d55' : 'rgba(255,255,255,0.08)'}`,
              color: active ? '#ff2d55' : 'rgba(255,255,255,0.7)',
              fontWeight: active ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              <Icon size={16} />
              {tab.label}
              {tab.badge && (
                <span style={{
                  padding: '2px 7px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                  backgroundColor: active ? '#ff2d55' : 'rgba(255,255,255,0.08)', color: '#fff'
                }}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ TAB: MY ORDERS ══ */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', margin: 0 }}>My Orders</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', margin: '4px 0 0' }}>
                {activeCount > 0 ? `${activeCount} in progress` : 'No active orders'} · {completedCount} delivered
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'In Progress' },
                { id: 'completed', label: 'Delivered' },
                { id: 'pending', label: 'Pending' }
              ].map(f => (
                <button key={f.id} onClick={() => setOrdersFilter(f.id)} style={pill(ordersFilter === f.id)}>{f.label}</button>
              ))}
            </div>
          </div>

          {loadingOrders ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading your orders…</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 24px',
              border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 20,
              color: 'rgba(255,255,255,0.5)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {ordersFilter === 'all' ? 'No orders yet' : `No ${ordersFilter} orders`}
              </div>
              <p style={{ fontSize: '0.88rem', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.6 }}>
                Browse our services and place your first order, or start a project from the home page.
              </p>
              <button onClick={() => setActiveTab('store')} style={{
                padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}>
                Browse Services →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredOrders.map(order => {
                const done = order.status === 'Completed' || order.status === 'Delivered' || order.projectState === 'finished';
                const paid = order.paymentStatus === 'fully_paid' || (order.amountPaid >= order.totalAmount && order.totalAmount > 0);
                const steps = [
                  { label: 'Placed', done: true },
                  { label: 'In Progress', done: order.status !== 'Pending Payment' },
                  { label: 'Review', done: order.status === 'Review' || done },
                  { label: 'Delivered', done }
                ];

                return (
                  <div key={order.id} style={card}>
                    {/* Order header */}
                    <div style={{
                      padding: '14px 20px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: 12, fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: 'rgba(255,255,255,0.6)' }}>
                        <span>Ordered {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ color: '#34c759', fontWeight: 700 }}>₹{(order.totalAmount || 0).toLocaleString()}</span>
                        <span>{order.service}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                        #{order.id?.slice(-8)?.toUpperCase()}
                      </span>
                    </div>

                    {/* Order body */}
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <span style={{ fontSize: '1.2rem' }}>{done ? '✅' : '⚡'}</span>
                        <div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: done ? '#34c759' : '#ff2d55' }}>
                            {done ? 'Delivered' : order.status?.toUpperCase() || 'IN PROGRESS'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            {order.servicePlan || 'Custom'} · Payment: <span style={{ color: paid ? '#34c759' : '#ff9500', fontWeight: 600 }}>{paid ? 'Paid' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress steps */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                        {steps.map((s, i) => (
                          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                              height: 4, borderRadius: 2, marginBottom: 6,
                              backgroundColor: s.done ? '#ff2d55' : 'rgba(255,255,255,0.08)'
                            }} />
                            <span style={{ fontSize: '0.72rem', color: s.done ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: s.done ? 600 : 400 }}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Title & description */}
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 4 }}>{order.title}</div>
                      {order.description && (
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.84rem', lineHeight: 1.5, margin: '0 0 12px' }}>
                          {order.description}
                        </p>
                      )}

                      {/* Delivery Link */}
                      {order.deliveryLink && (
                        <div style={{ marginBottom: 16 }}>
                          <a href={order.deliveryLink} target="_blank" rel="noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                            borderRadius: 12, background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                            color: '#fff', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(255,45,85,0.2)'
                          }}>
                            📦 Access Final Delivery
                          </a>
                        </div>
                      )}

                      {/* Downloadable files */}
                      {(order.files || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          {order.files.map(f => (
                            <a key={f.id} href={mediaUrl(f.url)} target="_blank" rel="noreferrer" style={{
                              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                              borderRadius: 8, backgroundColor: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.3)',
                              color: '#34c759', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none'
                            }}>
                              <Download size={13} /> {f.originalName || f.filename || 'Download'}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action buttons and Reviews */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        <button onClick={() => { setActiveTab('chat'); handleSendMessage(`Question about order "${order.title}"`); }} style={{
                          padding: '8px 16px', borderRadius: 10, backgroundColor: '#25D366',
                          border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.82rem',
                          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                        }}>
                          <MessageSquare size={14} /> Chat
                        </button>

                        <button onClick={() => setActiveTab('store')} style={{
                          padding: '8px 16px', borderRadius: 10,
                          backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer'
                        }}>
                          Order Again
                        </button>
                        
                        {!paid && (
                          <button onClick={() => handlePayment(order)} disabled={processingPayment} style={{
                            padding: '8px 16px', borderRadius: 10,
                            backgroundColor: processingPayment ? 'rgba(255,45,85,0.5)' : '#ff2d55',
                            border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: processingPayment ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}>
                            <IndianRupee size={14} /> Pay Now
                          </button>
                        )}
                      </div>

                      {(() => {
                        const projectReviews = clientTestimonials.filter(t => t.projectId === order.id || t.projectTitle === order.title);
                        return (
                          <>
                            {projectReviews.map((existingReview, idx) => (
                              <div key={idx} style={{ marginTop: 16, padding: '12px 16px', backgroundColor: 'rgba(255,210,121,0.05)', border: '1px solid rgba(255,210,121,0.15)', borderRadius: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <div style={{ color: '#ffd279', fontSize: '0.9rem', letterSpacing: 2 }}>
                                    {'★'.repeat(Number(existingReview.rating || existingReview.result?.replace(/\D/g, '') || 5))}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Your Review</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                  "{existingReview.quote || existingReview.review}"
                                </p>
                              </div>
                            ))}
                            {order.status !== 'Pending Payment' && (
                              <div style={{ marginTop: 12 }}>
                                <button onClick={() => { setReviewingOrder(order); setReviewRating(5); setReviewText(''); }} style={{
                                  padding: '8px 16px', borderRadius: 10,
                                  backgroundColor: 'rgba(255,210,121,0.12)', border: '1px solid rgba(255,210,121,0.3)',
                                  color: '#ffd279', fontWeight: 600, fontSize: '0.82rem',
                                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                                }}>
                                  <Star size={14} /> Write a Review
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {/* ══ TAB: CHAT ══ */}
      {activeTab === 'chat' && (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#0b141a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            height: '72vh', minHeight: 500
          }}>
            {/* Chat header */}
            <div style={{
              backgroundColor: '#1f2c34', padding: '12px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <img src={LOGO_URL} alt={COMPANY_NAME}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#000', border: '2px solid #25D366' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#25D366', border: '2px solid #1f2c34' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e9edef' }}>Assets Weber ✓</div>
                  <div style={{ fontSize: '0.76rem', color: '#8696a0' }}>Online · Replies in under 5 min</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setShowCallModal(true)} style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', color: '#aebac1', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                  <Phone size={16} />
                </button>
                <a href="https://wa.me/919416085060?text=Hello%20from%20the%20portal!" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 999, backgroundColor: '#25D366', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                  <ExternalLink size={13} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Quick chips */}
            <div style={{ backgroundColor: '#111b21', padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {['📦 Order status', '🎨 Request revision', '💳 Payment help', '⚡ Express delivery', '📞 Schedule call'].map((chip, i) => (
                <button key={i} onClick={() => handleSendMessage(chip)} style={{
                  padding: '5px 10px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#8696a0', fontSize: '0.74rem',
                  whiteSpace: 'nowrap', cursor: 'pointer'
                }}>{chip}</button>
              ))}
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 20px', backgroundColor: '#0b141a',
              display: 'flex', flexDirection: 'column', gap: 10
            }}>
              <div style={{ alignSelf: 'center', backgroundColor: '#182229', borderRadius: 8, padding: '5px 12px', color: '#ffd279', fontSize: '0.72rem', textAlign: 'center', maxWidth: 380 }}>
                🔒 Messages are synced with our studio team
              </div>

              {chatLoading ? (
                <div style={{ textAlign: 'center', color: '#8696a0', padding: 20 }}>Loading chat…</div>
              ) : chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8696a0', margin: 'auto', padding: 24 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
                  <div style={{ fontWeight: 600, color: '#e9edef' }}>Start a conversation</div>
                  <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Ask about orders, request revisions, or get help!</div>
                </div>
              ) : chatMessages.map((msg, i) => {
                const isMe = msg.senderRole === 'client';
                const isBot = msg.senderRole === 'system';
                return (
                  <div key={msg.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{
                      backgroundColor: isMe ? '#005c4b' : isBot ? '#182229' : '#202c33',
                      color: '#e9edef', padding: '9px 13px',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      fontSize: '0.88rem', lineHeight: 1.4, wordBreak: 'break-word'
                    }}>
                      {!isMe && (
                        <div style={{ fontSize: '0.73rem', color: isBot ? '#ffd279' : '#53bdeb', fontWeight: 700, marginBottom: 3 }}>
                          {msg.senderName || (isBot ? 'Studio Assistant' : 'Assets Weber Team')}
                        </div>
                      )}
                      {msg.fileUrl && (
                        <div style={{ marginBottom: 6 }}>
                          {msg.fileType === 'image' ? (
                            <img src={mediaUrl(msg.fileUrl)} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }} />
                          ) : msg.fileType === 'audio' || msg.isVoice ? (
                            <audio controls src={mediaUrl(msg.fileUrl)} style={{ height: 36, maxWidth: 220 }} />
                          ) : (
                            <a href={mediaUrl(msg.fileUrl)} target="_blank" rel="noreferrer" style={{ color: '#53bdeb', fontSize: '0.84rem' }}>
                              <Download size={13} /> {msg.fileName || 'Download'}
                            </a>
                          )}
                        </div>
                      )}
                      <div>{msg.text}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 3, fontSize: '0.66rem', color: 'rgba(255,255,255,0.4)' }}>
                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                        {isMe && <span style={{ color: '#53bdeb' }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Composer */}
            <div style={{
              backgroundColor: '#202c33', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <button onClick={() => chatFileRef.current?.click()} style={{ background: 'transparent', border: 'none', color: '#8696a0', cursor: 'pointer' }}>
                <Paperclip size={18} />
              </button>
              <input ref={chatFileRef} type="file" style={{ display: 'none' }} onChange={handleUploadAttachment} />

              <button onClick={handleToggleVoice} style={{
                background: isRecording ? '#ff2d55' : 'transparent', border: 'none',
                color: isRecording ? '#fff' : '#8696a0', borderRadius: '50%',
                width: 30, height: 30, cursor: 'pointer', display: 'grid', placeItems: 'center'
              }}>
                {isRecording ? <MicOff size={16} /> : <Mic size={18} />}
              </button>

              {isRecording ? (
                <div style={{ flex: 1, color: '#ff2d55', fontWeight: 600, fontSize: '0.86rem' }}>
                  🔴 Recording… {recordingTime}s
                </div>
              ) : (
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder="Type a message…"
                  style={{ flex: 1, backgroundColor: '#2a3942', border: 'none', borderRadius: 8, padding: '9px 14px', color: '#d1d7db', fontSize: '0.9rem', outline: 'none' }}
                />
              )}

              <button onClick={() => handleSendMessage()} disabled={sendingMsg || (!chatInput.trim() && !isRecording)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', backgroundColor: '#00a884',
                  border: 'none', color: '#fff', display: 'grid', placeItems: 'center',
                  cursor: (!chatInput.trim() && !isRecording) ? 'not-allowed' : 'pointer',
                  opacity: (!chatInput.trim() && !isRecording) ? 0.4 : 1
                }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CHECKOUT MODAL ══ */}
      {checkoutSkill && selectedTier && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'grid', placeItems: 'center', padding: 20 }}
          onClick={() => setCheckoutSkill(null)}>
          <div style={{ maxWidth: 560, width: '100%', backgroundColor: '#0e0e14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{checkoutSkill.category}</span>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', margin: '2px 0 0' }}>Place Order</h3>
              </div>
              <button onClick={() => setCheckoutSkill(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Choose plan */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Choose a plan</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {checkoutSkill.tiers.map(tier => {
                  const sel = selectedTier.name === tier.name;
                  return (
                    <button key={tier.name} onClick={() => setSelectedTier(tier)} style={{
                      padding: '10px 8px', borderRadius: 10,
                      backgroundColor: sel ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${sel ? '#ff2d55' : 'rgba(255,255,255,0.08)'}`,
                      color: '#fff', textAlign: 'left', cursor: 'pointer'
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{tier.name}</div>
                      <div style={{ color: '#ff2d55', fontWeight: 700, fontSize: '1rem', marginTop: 3 }}>₹{tier.price.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, marginTop: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                <strong>What you get:</strong> {selectedTier.deliverables}
              </div>
            </div>

            {/* Project name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Project name *</label>
              <input value={orderForm.title} onChange={e => setOrderForm({ ...orderForm, title: e.target.value })}
                placeholder="e.g. YouTube Video for Brand Launch"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            {/* Brief */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Details (optional)</label>
              <textarea value={orderForm.brief} onChange={e => setOrderForm({ ...orderForm, brief: e.target.value })}
                placeholder="Describe your requirements, references, deadlines…"
                style={{ width: '100%', minHeight: 80, padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Total & confirm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Total</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#34c759' }}>₹{selectedTier.price.toLocaleString()}</div>
              </div>
              <button onClick={handlePlaceOrder} disabled={submittingOrder} style={{
                padding: '14px 28px', borderRadius: 999, background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem',
                cursor: submittingOrder ? 'not-allowed' : 'pointer', opacity: submittingOrder ? 0.7 : 1
              }}>
                {submittingOrder ? 'Placing…' : 'Confirm Order →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVIEW MODAL ══ */}
      {reviewingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'grid', placeItems: 'center', padding: 20 }}
          onClick={() => setReviewingOrder(null)}>
          <div style={{ maxWidth: 480, width: '100%', backgroundColor: '#0e0e14', border: '1px solid rgba(255,210,121,0.2)', borderRadius: 20, padding: 28 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', margin: 0 }}>Write a Review</h3>
              <button onClick={() => setReviewingOrder(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', marginBottom: 16 }}>
              How was your experience with <strong style={{ color: '#fff' }}>"{reviewingOrder.title}"</strong>?
            </p>

            {/* Star rating */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.6rem',
                  color: s <= reviewRating ? '#ffd279' : 'rgba(255,255,255,0.15)', transition: 'color 0.15s'
                }}>★</button>
              ))}
              <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', alignSelf: 'center' }}>
                {reviewRating}/5
              </span>
            </div>

            {/* Review text */}
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Share your thoughts about the project, quality, and team…"
              style={{ width: '100%', minHeight: 100, padding: '12px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem', outline: 'none', resize: 'vertical', marginBottom: 16 }}
            />

            <button onClick={handleSubmitReview} disabled={submittingReview} style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: 'linear-gradient(135deg, #ffd279, #e5a100)',
              border: 'none', color: '#000', fontWeight: 700, fontSize: '0.9rem',
              cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1
            }}>
              {submittingReview ? 'Submitting…' : 'Submit Review ⭐'}
            </button>
          </div>
        </div>
      )}

      {/* ══ CALL MODAL ══ */}
      {showCallModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'grid', placeItems: 'center', padding: 20 }}
          onClick={() => setShowCallModal(false)}>
          <div style={{ maxWidth: 400, width: '100%', backgroundColor: '#12121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📞</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', margin: '0 0 8px' }}>Call Us</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', marginBottom: 20 }}>
              Connect directly with our team for urgent needs or consultations.
            </p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>+91 94160 85060</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="tel:+919416085060" style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#007aff', color: '#fff', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none', textAlign: 'center' }}>
                Call Now
              </a>
              <a href="https://wa.me/919416085060" target="_blank" rel="noreferrer" style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none', textAlign: 'center' }}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
