import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Search, ExternalLink, Mail, MessageSquare, Check, X, FileText, IndianRupee, Clock, CheckCircle, Send, Paperclip, Download, Phone, Trash2 } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api, mediaUrl } from '../../../api.js';

export function RequestCRM({ projects = [], inquiries = [], onLoad, showToast }) {
  const [categoryTab, setCategoryTab] = useState('all'); // all | packages | custom | transmissions
  const [activeTab, setActiveTab] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTransmission, setSelectedTransmission] = useState(null);
  const [deliveryLinkInput, setDeliveryLinkInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [updatingTransmissionId, setUpdatingTransmissionId] = useState(null);
  const [deletingTransmissionId, setDeletingTransmissionId] = useState(null);

  // Split projects into Custom and Standard packages
  const customProjects = useMemo(() => {
    return projects.filter(p => {
      const isCustomPlan = (p.servicePlan || '').toLowerCase().includes('custom');
      const isZeroPrice = (p.totalAmount || 0) === 0;
      const isCustomStatus = (p.status || '').toLowerCase().includes('custom quote') || (p.status || '').toLowerCase().includes('under review');
      const isCustomTitle = (p.title || '').toLowerCase().includes('custom');
      return isCustomPlan || isZeroPrice || isCustomStatus || isCustomTitle;
    });
  }, [projects]);

  const standardProjects = useMemo(() => {
    return projects.filter(p => !customProjects.includes(p));
  }, [projects, customProjects]);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef(null);
  const chatFileRef = useRef(null);

  useEffect(() => {
    if (selectedProject) {
      setChatLoading(true);
      api.getClientChat(selectedProject.clientId)
        .then(res => setChatMessages(res.messages || []))
        .catch(() => showToast('Failed to load chat history.'))
        .finally(() => setChatLoading(false));
    } else {
      setChatMessages([]);
      setChatInput('');
    }
  }, [selectedProject, showToast]);

  useEffect(() => {
    const socket = io(window.location.origin);
    socket.on('clientChatMessage', (msg) => {
      if (selectedProject && msg.userId === selectedProject.clientId) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return () => socket.disconnect();
  }, [selectedProject]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedProject) return;
    setSendingMsg(true);
    try {
      await api.sendClientChatMessage({ text: chatInput.trim(), targetUserId: selectedProject.clientId });
      setChatInput('');
    } catch {
      showToast('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('text', `📎 Sent: ${file.name}`);
      fd.append('targetUserId', selectedProject.clientId);
      await api.uploadClientChatFile(fd);
      showToast('File sent to client.');
    } catch {
      showToast('Upload failed.');
    }
    e.target.value = '';
  };

  const getDisplayStatus = (status) => status || 'Placed';
  const statusTabs = ['All', 'Placed', 'In Progress', 'Review', 'Delivered'];

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateStatus(id, status);
      showToast(`Order status updated to: ${status}`);
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject((prev) => ({ ...prev, status }));
      }
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleSaveDeliveryLink = async (id) => {
    try {
      await api.updateDeliveryLink(id, deliveryLinkInput);
      showToast('Delivery link saved and client notified.');
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject((prev) => ({ ...prev, deliveryLink: deliveryLinkInput }));
      }
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleUpdatePrice = async (id) => {
    const amount = Number(priceInput);
    if (isNaN(amount) || amount < 0) {
      showToast('Please enter a valid price in INR.');
      return;
    }
    setSavingPrice(true);
    try {
      await api.updateProjectPrice(id, amount);
      showToast(`Quote price updated to ₹${amount.toLocaleString('en-IN')}! Client notified.`);
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject((prev) => ({ ...prev, totalAmount: amount, status: 'Quote Ready - Awaiting Payment' }));
      }
      await onLoad();
    } catch (err) {
      showToast(err.message || 'Failed to update price.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleUpdateInquiryStatus = async (inqId, status) => {
    setUpdatingTransmissionId(inqId);
    try {
      await api.updateInquiry(inqId, status);
      showToast(`Transmission marked as ${status}.`);
      if (onLoad) await onLoad();
      if (selectedTransmission?.id === inqId) {
        setSelectedTransmission(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update transmission.');
    } finally {
      setUpdatingTransmissionId(null);
    }
  };

  const handleDeleteInquiry = async (inqId) => {
    if (!window.confirm('Delete this transmission?')) return;
    setDeletingTransmissionId(inqId);
    try {
      await api.deleteInquiry(inqId);
      showToast('Transmission deleted.');
      if (selectedTransmission?.id === inqId) setSelectedTransmission(null);
      if (onLoad) await onLoad();
    } catch (err) {
      showToast(err.message || 'Failed to delete.');
    } finally {
      setDeletingTransmissionId(null);
    }
  };

  const openProjectModal = (proj) => {
    playClickSound();
    setSelectedProject(proj);
    setDeliveryLinkInput(proj.deliveryLink || '');
    setPriceInput(proj.totalAmount || '');
  };

  const getStatusColor = (status) => {
    const s = getDisplayStatus(status).toLowerCase();
    if (s === 'in progress') return '#007aff';
    if (s === 'review') return '#ff9f0a';
    if (s === 'delivered' || s === 'finished') return '#34c759';
    return '#ff2d55';
  };

  // Build list based on active categoryTab
  const projectsToShow = useMemo(() => {
    if (categoryTab === 'transmissions') return [];
    let base = categoryTab === 'custom' ? customProjects : (categoryTab === 'packages' ? standardProjects : projects);
    if (activeTab === 'All') return base;
    return base.filter(p => getDisplayStatus(p.status).toLowerCase() === activeTab.toLowerCase());
  }, [categoryTab, activeTab, projects, customProjects, standardProjects]);

  const inquiriesToShow = useMemo(() => {
    if (categoryTab === 'packages' || categoryTab === 'custom') return [];
    if (activeTab === 'All') return inquiries;
    if (activeTab.toLowerCase() === 'placed') return inquiries.filter(i => (i.status || 'New') === 'New');
    if (activeTab.toLowerCase() === 'in progress') return inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted');
    if (activeTab.toLowerCase() === 'delivered') return inquiries.filter(i => (i.status || '').toLowerCase() === 'completed' || (i.status || '').toLowerCase() === 'archived');
    return [];
  }, [categoryTab, activeTab, inquiries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
          CLIENT ORDERS // PROJECT MANAGEMENT
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
          CLIENT REQUESTS & ORDERS
        </h2>
      </div>

      {/* 1. Category Switcher (Packages, Custom Orders, Contact Transmissions, All) */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { id: 'all', label: `All Requests (${projects.length + inquiries.length})` },
          { id: 'packages', label: `📦 Package Orders (${standardProjects.length})` },
          { id: 'custom', label: `⚡ Custom Orders (${customProjects.length})` },
          { id: 'transmissions', label: `📡 Contact Transmissions (${inquiries.length})` }
        ].map(cat => {
          const isActive = categoryTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { playClickSound(); setCategoryTab(cat.id); }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: isActive ? '#ff2d55' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                border: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
        {statusTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { playClickSound(); setActiveTab(tab); }}
              onMouseEnter={playHoverSound}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: isActive ? 'rgba(255, 45, 85, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {projectsToShow.length === 0 && inquiriesToShow.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          No requests or transmissions found for this filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {/* A. Render Inquiries / Contact Transmissions */}
          {inquiriesToShow.map((inq) => {
            const isNew = inq.status === 'New' || !inq.status;
            return (
              <div
                key={`inq_${inq.id}`}
                onClick={() => setSelectedTransmission(inq)}
                onMouseEnter={playHoverSound}
                style={{
                  background: 'rgba(25,25,32,0.7)',
                  border: `1px solid ${isNew ? 'rgba(255, 45, 85, 0.4)' : 'rgba(0, 122, 255, 0.2)'}`,
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  boxShadow: isNew ? '0 0 20px rgba(255, 45, 85, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'inline-block', fontSize: '0.68rem', fontFamily: 'monospace', color: '#007aff', backgroundColor: 'rgba(0, 122, 255, 0.12)', padding: '2px 8px', borderRadius: 6, marginBottom: 4 }}>
                      📡 CONTACT TRANSMISSION
                    </div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{inq.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{inq.company || 'Direct Contact Form'}</div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 8, background: isNew ? 'rgba(255,45,85,0.2)' : 'rgba(52,199,89,0.2)', color: isNew ? '#ff2d55' : '#34c759', fontSize: '0.75rem', fontWeight: 700 }}>
                    {inq.status || 'New'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Service</span>
                    <span style={{ color: '#ff2d55', fontFamily: 'monospace', fontWeight: 600 }}>{inq.service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Budget</span>
                    <span style={{ color: '#34c759', fontWeight: 700 }}>{inq.budget || 'Custom Quote'}</span>
                  </div>
                </div>

                {/* Direct Phone / Call link */}
                {inq.phone && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    <a
                      href={`tel:${inq.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, backgroundColor: 'rgba(52,199,89,0.15)', color: '#34c759', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Phone size={12} /> {inq.phone}
                    </a>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(inq.createdAt || inq.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                      style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,149,0,0.15)', border: '1px solid rgba(255,149,0,0.3)', color: '#ff9500', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      ✓ Contacted
                    </button>
                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)', color: '#ff2d55', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* B. Render Projects (Standard & Custom) */}
          {projectsToShow.map((proj) => {
            const statusStr = getDisplayStatus(proj.status);
            const statusColor = getStatusColor(statusStr);
            const isCustom = customProjects.includes(proj);
            
            return (
              <div
                key={`proj_${proj.id}`}
                onClick={() => openProjectModal(proj)}
                onMouseEnter={playHoverSound}
                style={{
                  background: 'rgba(25,25,25,0.6)',
                  border: `1px solid ${isCustom ? 'rgba(255,149,0,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#ff2d55';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = isCustom ? 'rgba(255,149,0,0.25)' : 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {isCustom && (
                      <div style={{ display: 'inline-block', fontSize: '0.68rem', fontFamily: 'monospace', color: '#ff9500', backgroundColor: 'rgba(255, 149, 0, 0.12)', padding: '2px 8px', borderRadius: 6, marginBottom: 4 }}>
                        ⚡ CUSTOM ORDER
                      </div>
                    )}
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>{proj.clientName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{proj.title || 'Untitled Project'}</div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 8, background: `${statusColor}22`, color: statusColor, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {statusStr}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Service</span>
                    <span style={{ color: '#ff2d55', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>{proj.service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Amount</span>
                    <span style={{ color: (proj.totalAmount || 0) > 0 ? '#34c759' : '#ff9500', fontWeight: 700, fontSize: '0.9rem' }}>
                      {(proj.totalAmount || 0) > 0 ? `₹${Number(proj.totalAmount).toLocaleString('en-IN')}` : 'Custom Quote Under Review'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Date</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transmission Details Modal */}
      <GlassModal isOpen={Boolean(selectedTransmission)} onClose={() => setSelectedTransmission(null)} title="CONTACT TRANSMISSION DETAILS" maxWidth={640}>
        {selectedTransmission && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
                  {selectedTransmission.name}
                </h3>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: 2 }}>
                  🏢 {selectedTransmission.company || 'Individual Client'}
                </div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 8, backgroundColor: selectedTransmission.status === 'New' ? 'rgba(255,45,85,0.2)' : 'rgba(52,199,89,0.2)', color: selectedTransmission.status === 'New' ? '#ff2d55' : '#34c759', fontWeight: 700, fontSize: '0.8rem' }}>
                {selectedTransmission.status || 'New'}
              </span>
            </div>

            {/* Direct Contact Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedTransmission.phone && (
                <a
                  href={`tel:${selectedTransmission.phone}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)', color: '#34c759', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  <Phone size={14} /> Call: {selectedTransmission.phone}
                </a>
              )}
              {selectedTransmission.phone && (
                <a
                  href={`https://wa.me/${selectedTransmission.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, backgroundColor: '#25D36622', border: '1px solid #25D36644', color: '#25D366', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={14} /> WhatsApp Client
                </a>
              )}
              {selectedTransmission.email && (
                <a
                  href={`mailto:${selectedTransmission.email}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  <Mail size={14} /> {selectedTransmission.email}
                </a>
              )}
            </div>

            <div style={{ display: 'flex', gap: 20, fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Service: </span>
                <strong style={{ color: '#ff2d55' }}>{selectedTransmission.service}</strong>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Budget: </span>
                <strong style={{ color: '#34c759' }}>{selectedTransmission.budget || 'Custom Quote'}</strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
              {selectedTransmission.description || 'No description provided.'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleUpdateInquiryStatus(selectedTransmission.id, 'Contacted')}
                  disabled={updatingTransmissionId === selectedTransmission.id}
                  style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(255,149,0,0.2)', border: '1px solid rgba(255,149,0,0.4)', color: '#ff9500', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ✓ Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateInquiryStatus(selectedTransmission.id, 'Completed')}
                  disabled={updatingTransmissionId === selectedTransmission.id}
                  style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(52,199,89,0.2)', border: '1px solid rgba(52,199,89,0.4)', color: '#34c759', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ✓ Mark Completed
                </button>
              </div>

              <button
                onClick={() => handleDeleteInquiry(selectedTransmission.id)}
                disabled={deletingTransmissionId === selectedTransmission.id}
                style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={13} /> Delete Transmission
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Project Details Modal */}
      <GlassModal isOpen={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} title="ORDER DETAILS" maxWidth={720}>
        {selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
                  {selectedProject.clientName || selectedProject.answers?.name || 'Client Order'}
                </h3>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 4 }}>
                  {selectedProject.title || 'Untitled Project'}
                </div>
                {/* Client Direct Contact: Phone & Email */}
                <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  {(selectedProject.answers?.phone || selectedProject.clientPhone) && (
                    <a
                      href={`tel:${selectedProject.answers?.phone || selectedProject.clientPhone}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34c759', fontSize: '0.86rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(52,199,89,0.1)', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(52,199,89,0.3)' }}
                    >
                      📞 Call: {selectedProject.answers?.phone || selectedProject.clientPhone}
                    </a>
                  )}
                  {(selectedProject.answers?.email || selectedProject.clientEmail) && (
                    <a
                      href={`mailto:${selectedProject.answers?.email || selectedProject.clientEmail}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#007aff', fontSize: '0.86rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(0,122,255,0.1)', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(0,122,255,0.3)' }}
                    >
                      ✉️ {selectedProject.answers?.email || selectedProject.clientEmail}
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', color: '#ff2d55', fontWeight: 700, fontFamily: 'monospace' }}>
                  {selectedProject.service}
                </span>
                <span style={{ color: '#34c759', fontWeight: 700, fontSize: '1.2rem' }}>₹{Number(selectedProject.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Form Answers (Details) */}
            <div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 12 }}>CLIENT REQUIREMENTS (FROM FORM)</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Specific answers formatting */}
                {selectedProject.answers && Object.entries(selectedProject.answers).map(([key, val]) => (
                  <div key={key} style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#ff2d55', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    {typeof val === 'string' && val.startsWith('http') ? (
                      <a href={val} target="_blank" rel="noreferrer" style={{ color: '#007aff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem' }}>
                        <ExternalLink size={16} /> Open Link
                      </a>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {val}
                      </div>
                    )}
                  </div>
                ))}
                
                {(!selectedProject.answers || Object.keys(selectedProject.answers).length === 0) && (
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#ff2d55', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selectedProject.description || 'No description provided.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Delivery Management */}
            <div style={{ padding: 20, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 16 }}>ORDER MANAGEMENT</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Status Update */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Update Status</label>
                  <select
                    value={getDisplayStatus(selectedProject.status)}
                    onChange={(e) => handleUpdateStatus(selectedProject.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Placed">Placed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                {/* Delivery Link Update */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Final Delivery (Drive Link)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/..."
                      value={deliveryLinkInput}
                      onChange={(e) => setDeliveryLinkInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => handleSaveDeliveryLink(selectedProject.id)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        background: '#ff2d55',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Set / Update Price Order (Team Quote) */}
                <div style={{ gridColumn: '1 / -1', marginTop: 8, padding: 14, borderRadius: 10, backgroundColor: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.2)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#ff2d55', fontWeight: 700, marginBottom: 8 }}>
                    SET / UPDATE ORDER PRICE (₹ INR) — CLIENT WILL PAY VIA RAZORPAY
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontWeight: 700 }}>₹</span>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 30px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,45,85,0.4)',
                          color: '#fff',
                          fontSize: '1rem',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleUpdatePrice(selectedProject.id)}
                      disabled={savingPrice}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #ff2d55, #c81e42)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: savingPrice ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 15px rgba(255,45,85,0.3)'
                      }}
                    >
                      {savingPrice ? 'Updating…' : 'Update Price & Send Quote to Client ⚡'}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                    Once updated, the client will immediately see this quote and a "Pay via Razorpay" button on their Client Portal.
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div style={{ padding: 20, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>CLIENT CHAT LOG</div>
              
              <div style={{ height: 300, overflowY: 'auto', paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatLoading ? (
                  <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 }}>Loading messages...</div>
                ) : chatMessages.length === 0 ? (
                  <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 }}>No messages yet.</div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isTeam = msg.senderRole === 'team' || msg.senderRole === 'system';
                    return (
                      <div key={msg.id || i} style={{ alignSelf: isTeam ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{
                          backgroundColor: isTeam ? 'rgba(255,45,85,0.1)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isTeam ? 'rgba(255,45,85,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: '0.9rem', lineHeight: 1.4
                        }}>
                          {!isTeam && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{msg.senderName}</div>}
                          {isTeam && <div style={{ fontSize: '0.75rem', color: '#ff2d55', marginBottom: 4 }}>{msg.senderName}</div>}
                          
                          {msg.fileUrl && (
                            <div style={{ marginBottom: 6 }}>
                              {msg.fileType === 'image' ? (
                                <img src={mediaUrl(msg.fileUrl)} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }} />
                              ) : msg.fileType === 'audio' || msg.isVoice ? (
                                <audio controls src={mediaUrl(msg.fileUrl)} style={{ height: 36, maxWidth: 220 }} />
                              ) : (
                                <a href={mediaUrl(msg.fileUrl)} target="_blank" rel="noreferrer" style={{ color: '#ff2d55', fontSize: '0.84rem' }}>
                                  <Download size={13} /> {msg.fileName || 'Download'}
                                </a>
                              )}
                            </div>
                          )}
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => chatFileRef.current?.click()} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  <Paperclip size={18} />
                </button>
                <input ref={chatFileRef} type="file" style={{ display: 'none' }} onChange={handleUploadAttachment} />
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message to the client..."
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || sendingMsg}
                  style={{
                    width: 48, borderRadius: 8, background: '#ff2d55', color: '#fff', border: 'none',
                    display: 'grid', placeItems: 'center', cursor: !chatInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: !chatInput.trim() ? 0.5 : 1
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

          </div>
        )}
      </GlassModal>
    </div>
  );
}
