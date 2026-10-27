import React, { useState, useMemo } from 'react';
import {
  Send,
  Phone,
  MessageSquare,
  Mail,
  ExternalLink,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  IndianRupee,
  AlertCircle,
  FileText,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

export function CustomOrdersManager({ inquiries = [], projects = [], onLoad, showToast }) {
  const [activeTab, setActiveTab] = useState('all'); // all | contact | custom | new | completed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Extract Custom Project Orders
  const customProjects = useMemo(() => {
    return projects.filter(p => {
      const isCustomPlan = (p.servicePlan || '').toLowerCase().includes('custom');
      const isZeroPrice = (p.totalAmount || 0) === 0;
      const isCustomStatus = (p.status || '').toLowerCase().includes('custom quote') || (p.status || '').toLowerCase().includes('under review');
      const isCustomTitle = (p.title || '').toLowerCase().includes('custom');
      return isCustomPlan || isZeroPrice || isCustomStatus || isCustomTitle;
    });
  }, [projects]);

  // Combined Items list
  const combinedItems = useMemo(() => {
    const list = [];

    // 1. Inquiries from Contact Page & Custom Brief Forms
    inquiries.forEach(inq => {
      list.push({
        type: 'contact_transmission',
        id: inq.id,
        rawId: inq.id,
        name: inq.name || 'Anonymous Client',
        email: inq.email || '',
        phone: inq.phone || '',
        company: inq.company || '',
        service: inq.service || 'General Inquiry',
        budget: inq.budget || 'Custom Quote',
        description: inq.description || '',
        status: inq.status || 'New',
        driveLink: inq.driveLink || '',
        createdAt: inq.createdAt || inq.created_at || new Date().toISOString(),
        raw: inq
      });
    });

    // 2. Custom Project Orders
    customProjects.forEach(proj => {
      let answers = {};
      try {
        answers = typeof proj.answers === 'string' ? JSON.parse(proj.answers || '{}') : (proj.answers || {});
      } catch {}

      list.push({
        type: 'custom_order',
        id: proj.id,
        rawId: proj.id,
        name: proj.clientName || answers.name || 'Client',
        email: answers.email || '',
        phone: answers.phone || '',
        company: answers.company || '',
        service: proj.service || 'Custom Project',
        budget: proj.totalAmount > 0 ? `₹${proj.totalAmount.toLocaleString('en-IN')}` : (answers.budget || 'Custom Quote'),
        description: proj.description || '',
        status: proj.status || 'Placed',
        driveLink: answers.driveLink || '',
        createdAt: proj.createdAt || proj.created_at || new Date().toISOString(),
        totalAmount: proj.totalAmount || 0,
        paymentStatus: proj.paymentStatus || 'pending',
        raw: proj
      });
    });

    // Sort by most recent
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [inquiries, customProjects]);

  // Counts
  const newCount = inquiries.filter(i => (i.status || 'New') === 'New').length;
  const customOrdersCount = customProjects.length;
  const contactTransmissionsCount = inquiries.length;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return combinedItems.filter(item => {
      // Tab filter
      if (activeTab === 'contact' && item.type !== 'contact_transmission') return false;
      if (activeTab === 'custom' && item.type !== 'custom_order') return false;
      if (activeTab === 'new') {
        const isNewInq = item.type === 'contact_transmission' && (item.status === 'New' || !item.status);
        const isPendingProj = item.type === 'custom_order' && item.status !== 'Delivered' && item.status !== 'Completed';
        if (!isNewInq && !isPendingProj) return false;
      }
      if (activeTab === 'completed') {
        const isDoneInq = item.type === 'contact_transmission' && (item.status === 'Completed' || item.status === 'Archived');
        const isDoneProj = item.type === 'custom_order' && (item.status === 'Delivered' || item.status === 'Completed');
        if (!isDoneInq && !isDoneProj) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesEmail = (item.email || '').toLowerCase().includes(q);
        const matchesPhone = (item.phone || '').toLowerCase().includes(q);
        const matchesService = (item.service || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCompany = (item.company || '').toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesService || matchesDesc || matchesCompany;
      }

      return true;
    });
  }, [combinedItems, activeTab, searchQuery]);

  // Handlers
  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    setUpdatingStatusId(inquiryId);
    try {
      await api.updateInquiry(inquiryId, newStatus);
      showToast(`Transmission marked as ${newStatus}.`);
      if (onLoad) await onLoad();
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update transmission status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this transmission?')) return;
    setDeletingId(inquiryId);
    try {
      await api.deleteInquiry(inquiryId);
      showToast('Transmission deleted successfully.');
      if (selectedInquiry?.id === inquiryId) setSelectedInquiry(null);
      if (onLoad) await onLoad();
    } catch (err) {
      showToast(err.message || 'Failed to delete transmission.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateProjectPrice = async (projectId) => {
    const amount = Number(priceInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid price in INR.');
      return;
    }
    setSavingPrice(true);
    try {
      await api.updateProjectPrice(projectId, amount, 'Quote Ready - Awaiting Payment');
      showToast(`Order price set to ₹${amount.toLocaleString('en-IN')}. Client notified!`);
      if (onLoad) await onLoad();
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => ({ ...prev, totalAmount: amount, status: 'Quote Ready - Awaiting Payment' }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to set project price.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId, status) => {
    try {
      await api.updateStatus(projectId, status);
      showToast(`Order status updated to: ${status}`);
      if (onLoad) await onLoad();
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status.');
    }
  };

  // Mark all new inquiries as contacted (one-click notification clearer)
  const handleMarkAllContacted = async () => {
    const newItems = inquiries.filter(i => (i.status || 'New') === 'New');
    if (newItems.length === 0) {
      showToast('No unhandled transmissions.');
      return;
    }
    try {
      await Promise.all(newItems.map(i => api.updateInquiry(i.id, 'Contacted')));
      showToast(`Marked ${newItems.length} transmission(s) as Contacted.`);
      if (onLoad) await onLoad();
    } catch (err) {
      showToast(err.message || 'Failed to update all items.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
            COMMAND TRANSMISSIONS // CLIENT BRIEFS PIPELINE
          </span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
            CUSTOM ORDERS & CONTACT TRANSMISSIONS
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Incoming project briefs from the Contact page and custom tailored scope orders from clients.
          </p>
        </div>

        {newCount > 0 && (
          <button
            onClick={handleMarkAllContacted}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 45, 85, 0.15)',
              border: '1px solid #ff2d55',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Check size={16} color="#ff2d55" /> Mark All New as Contacted
          </button>
        )}
      </div>

      {/* Summary Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>TOTAL TRANSMISSIONS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ffffff', margin: '4px 0' }}>{combinedItems.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>All contact forms & custom briefs</div>
        </div>

        <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#ff2d55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>NEW / UNREAD BRIEFS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ff2d55', margin: '4px 0' }}>{newCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Require consultation call & quote</div>
        </div>

        <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#ff9500', fontFamily: 'monospace', letterSpacing: '0.1em' }}>CUSTOM ORDERS (PORTAL)</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#ff9500', margin: '4px 0' }}>{customOrdersCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Projects created in client portal</div>
        </div>

        <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(0,122,255,0.06)', border: '1px solid rgba(0,122,255,0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#007aff', fontFamily: 'monospace', letterSpacing: '0.1em' }}>CONTACT TRANSMISSIONS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#007aff', margin: '4px 0' }}>{contactTransmissionsCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Direct website inquiries</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Requests (${combinedItems.length})` },
            { id: 'contact', label: `📡 Contact Transmissions (${contactTransmissionsCount})` },
            { id: 'custom', label: `⚡ Custom Orders (${customOrdersCount})` },
            { id: 'new', label: `🔴 Action Required (${newCount})` },
            { id: 'completed', label: `🟢 Completed / Archived` }
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { playClickSound(); setActiveTab(t.id); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  backgroundColor: isActive ? 'rgba(255, 45, 85, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={15} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, brief..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Grid of Transmissions & Custom Orders */}
      {filteredItems.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📡</div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: 6 }}>No Transmissions Found</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 420, margin: '0 auto', color: 'rgba(255,255,255,0.5)' }}>
            There are no inquiries or custom orders matching the selected filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filteredItems.map((item) => {
            const isContact = item.type === 'contact_transmission';
            const isNew = item.status === 'New' || (!isContact && (item.status === 'Custom Quote Requested - Under Review' || item.totalAmount === 0));

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(18, 18, 24, 0.75)',
                  border: `1px solid ${isNew ? 'rgba(255, 45, 85, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 18,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: isNew ? '0 0 25px rgba(255, 45, 85, 0.15)' : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                {/* Top Badge Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    backgroundColor: isContact ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                    border: `1px solid ${isContact ? 'rgba(0, 122, 255, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                    color: isContact ? '#007aff' : '#ff9500',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {isContact ? '📡 CONTACT TRANSMISSION' : '⚡ CUSTOM PROJECT ORDER'}
                  </div>

                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    backgroundColor: isNew ? 'rgba(255, 45, 85, 0.2)' : 'rgba(52, 199, 89, 0.15)',
                    color: isNew ? '#ff2d55' : '#34c759',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: `1px solid ${isNew ? 'rgba(255, 45, 85, 0.4)' : 'rgba(52, 199, 89, 0.3)'}`
                  }}>
                    {item.status || 'New'}
                  </span>
                </div>

                {/* Client Identity */}
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                    {item.name}
                  </div>
                  {item.company && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      🏢 {item.company}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                    Received: {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {/* Direct Action Hub: Phone Call, WhatsApp, Email */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  flexWrap: 'wrap'
                }}>
                  {item.phone ? (
                    <a
                      href={`tel:${item.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(52, 199, 89, 0.15)',
                        border: '1px solid rgba(52, 199, 89, 0.3)',
                        color: '#34c759',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                      title="Direct Phone Call"
                    >
                      <Phone size={13} /> {item.phone}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>No phone</span>
                  )}

                  {item.phone && (
                    <a
                      href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: '#25D36622',
                        border: '1px solid #25D36644',
                        color: '#25D366',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                      title="Direct WhatsApp"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  )}

                  {item.email && (
                    <a
                      href={`mailto:${item.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.8rem',
                        textDecoration: 'none'
                      }}
                      title="Direct Email"
                    >
                      <Mail size={13} /> Email
                    </a>
                  )}
                </div>

                {/* Details Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Service / Skill:</span>
                    <span style={{ color: '#ff2d55', fontWeight: 600, fontFamily: 'monospace' }}>{item.service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Estimated Budget:</span>
                    <span style={{ color: '#34c759', fontWeight: 700 }}>{item.budget}</span>
                  </div>
                </div>

                {/* Google Drive / Raw Files link */}
                {item.driveLink && (
                  <div>
                    <a
                      href={item.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#007aff',
                        fontSize: '0.8rem',
                        textDecoration: 'underline'
                      }}
                    >
                      <ExternalLink size={13} /> Open Raw Assets / Drive Folder
                    </a>
                  </div>
                )}

                {/* Description / Message Body */}
                {item.description && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.84rem',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.5,
                    maxHeight: 120,
                    overflowY: 'auto',
                    whiteSpace: 'pre-line'
                  }}>
                    {item.description}
                  </div>
                )}

                {/* Management Action Bar */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  {isContact ? (
                    // Actions for Contact Transmission
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleUpdateInquiryStatus(item.id, 'Contacted')}
                        disabled={updatingStatusId === item.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(255, 149, 0, 0.15)',
                          border: '1px solid rgba(255, 149, 0, 0.3)',
                          color: '#ff9500',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Contacted
                      </button>

                      <button
                        onClick={() => handleUpdateInquiryStatus(item.id, 'Completed')}
                        disabled={updatingStatusId === item.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(52, 199, 89, 0.15)',
                          border: '1px solid rgba(52, 199, 89, 0.3)',
                          color: '#34c759',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Completed
                      </button>

                      <button
                        onClick={() => handleDeleteInquiry(item.id)}
                        disabled={deletingId === item.id}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(255, 45, 85, 0.1)',
                          border: '1px solid rgba(255, 45, 85, 0.25)',
                          color: '#ff2d55',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                        title="Delete transmission"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    // Actions for Custom Project Order
                    <div style={{ display: 'flex', gap: 8, width: '100%', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <span style={{ position: 'absolute', left: 10, top: 9, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>₹</span>
                          <input
                            type="number"
                            placeholder="Set Price Quote (INR)"
                            defaultValue={item.totalAmount > 0 ? item.totalAmount : ''}
                            onChange={(e) => setPriceInput(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '7px 10px 7px 24px',
                              borderRadius: 8,
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#fff',
                              fontSize: '0.82rem'
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateProjectPrice(item.id)}
                          disabled={savingPrice}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 8,
                            backgroundColor: '#ff2d55',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {savingPrice ? 'Saving…' : 'Set Quote'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Placed', 'In Progress', 'Delivered'].map(st => (
                          <button
                            key={st}
                            onClick={() => handleUpdateProjectStatus(item.id, st)}
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              borderRadius: 6,
                              backgroundColor: item.status === st ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${item.status === st ? '#ff2d55' : 'rgba(255,255,255,0.08)'}`,
                              color: item.status === st ? '#fff' : 'rgba(255,255,255,0.6)',
                              fontSize: '0.74rem',
                              cursor: 'pointer'
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
