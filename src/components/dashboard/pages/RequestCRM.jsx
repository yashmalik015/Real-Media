import React, { useState } from 'react';
import { Search, ExternalLink, Mail, MessageSquare, Check, X, FileText, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

export function RequestCRM({ projects = [], onLoad, showToast }) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [deliveryLinkInput, setDeliveryLinkInput] = useState('');

  // Default status for projects might be null if they didn't have one initially.
  // We'll treat null/empty as 'Placed' for display purposes.
  const getDisplayStatus = (status) => status || 'Placed';

  const statusTabs = ['All', 'Placed', 'In Progress', 'Review', 'Delivered'];

  const filteredProjects = projects.filter((proj) => {
    if (activeTab === 'All') return true;
    return getDisplayStatus(proj.status).toLowerCase() === activeTab.toLowerCase();
  });

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

  const openProjectModal = (proj) => {
    playClickSound();
    setSelectedProject(proj);
    setDeliveryLinkInput(proj.deliveryLink || '');
  };

  const getStatusColor = (status) => {
    const s = getDisplayStatus(status).toLowerCase();
    if (s === 'in progress') return '#007aff';
    if (s === 'review') return '#ff9f0a';
    if (s === 'delivered' || s === 'finished') return '#34c759';
    return '#ff2d55'; // placed or new
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
          CLIENT ORDERS // PROJECT MANAGEMENT
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
          CLIENT REQUESTS & ORDERS
        </h2>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
        {statusTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { playClickSound(); setActiveTab(tab); }}
              onMouseEnter={playHoverSound}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                backgroundColor: isActive ? 'rgba(255, 45, 85, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isActive ? '#ff2d55' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          No orders found for this status.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredProjects.map((proj) => {
            const statusStr = getDisplayStatus(proj.status);
            const statusColor = getStatusColor(statusStr);
            
            return (
              <div
                key={proj.id}
                onClick={() => openProjectModal(proj)}
                onMouseEnter={playHoverSound}
                style={{
                  background: 'rgba(25,25,25,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,45,85,0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{proj.clientName}</div>
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
                    <span style={{ color: '#34c759', fontWeight: 700, fontSize: '0.9rem' }}>₹{proj.totalAmount || 0}</span>
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

      {/* Project Details Modal */}
      <GlassModal isOpen={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} title="ORDER DETAILS" maxWidth={720}>
        {selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
                  {selectedProject.clientName}
                </h3>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 4 }}>
                  {selectedProject.title || 'Untitled Project'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.15)', color: '#ff2d55', fontWeight: 700, fontFamily: 'monospace' }}>
                  {selectedProject.service}
                </span>
                <span style={{ color: '#34c759', fontWeight: 700, fontSize: '1.2rem' }}>₹{selectedProject.totalAmount || 0}</span>
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
              </div>
            </div>

          </div>
        )}
      </GlassModal>
    </div>
  );
}
