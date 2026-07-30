import React, { useState } from 'react';
import { Search, Inbox, Phone, Mail, MessageSquare, Calendar, Check, X, UserCheck, Clock } from 'lucide-react';
import { DataTable } from '../ui/DataTable.jsx';
import { GlassModal } from '../ui/GlassModal.jsx';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';
import { api } from '../../../api.js';

export function RequestCRM({ inquiries = [], onLoad, showToast, settings = {} }) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [noteText, setNoteText] = useState('');

  const statusTabs = ['All', 'New', 'In Progress', 'Meeting Scheduled', 'Completed', 'Rejected'];

  const filteredInquiries = inquiries.filter((inq) => {
    if (activeTab === 'All') return true;
    return inq.status === activeTab;
  });

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateInquiry(id, status);
      showToast(`Request status updated to: ${status}`);
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status }));
      }
      await onLoad();
    } catch (err) {
      showToast(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'CLIENT', render: (val, row) => <div style={{ fontWeight: 600, color: '#fff' }}>{val}<div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{row.company || 'Private Client'}</div></div> },
    { key: 'service', label: 'SERVICE', render: (val) => <span style={{ color: '#ff2d55', fontFamily: 'monospace', fontWeight: 600 }}>{val}</span> },
    { key: 'budget', label: 'BUDGET', render: (val) => val || '$1,000+' },
    { key: 'email', label: 'EMAIL', render: (val) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{val}</span> },
    { key: 'phone', label: 'PHONE', render: (val) => val || 'N/A' },
    {
      key: 'status',
      label: 'STATUS',
      render: (val) => {
        let bg = 'rgba(255, 45, 85, 0.15)';
        let color = '#ff2d55';
        if (val === 'In Progress') { bg = 'rgba(0, 122, 255, 0.15)'; color = '#007aff'; }
        if (val === 'Completed') { bg = 'rgba(52, 199, 89, 0.15)'; color = '#34c759'; }
        if (val === 'Rejected') { bg = 'rgba(255, 59, 48, 0.15)'; color = '#ff3b30'; }
        return <span style={{ padding: '4px 10px', borderRadius: 8, backgroundColor: bg, color, fontSize: '0.75rem', fontWeight: 700 }}>{val || 'New'}</span>;
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff2d55', letterSpacing: '0.15em' }}>
          CLIENT CRM // INQUIRIES & DEPLOYMENT REQUESTS
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#ffffff', margin: '4px 0 0' }}>
          PROJECT INQUIRY CONTROL CENTER
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
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredInquiries}
        searchPlaceholder="Search client requests..."
        onRowClick={(row) => setSelectedInquiry(row)}
        onBulkDelete={async (ids) => {
          await api.bulkDelete('inquiries', ids);
          showToast('Selected requests deleted.');
          await onLoad();
        }}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(row.id, 'In Progress'); }}
              style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(0,122,255,0.15)', border: '1px solid rgba(0,122,255,0.3)', color: '#007aff', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Start
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(row.id, 'Completed'); }}
              style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)', color: '#34c759', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Complete
            </button>
          </div>
        )}
      />

      {/* Inquiry Detail Drawer Modal */}
      <GlassModal isOpen={Boolean(selectedInquiry)} onClose={() => setSelectedInquiry(null)} title="CLIENT INQUIRY DETAILS" maxWidth={720}>
        {selectedInquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>{selectedInquiry.name}</h3>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>Company: {selectedInquiry.company || 'N/A'}</div>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(255,45,85,0.2)', color: '#ff2d55', fontWeight: 700, fontFamily: 'monospace' }}>
                {selectedInquiry.service}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>EMAIL</div>
                <div style={{ color: '#fff', marginTop: 4, fontWeight: 600 }}>{selectedInquiry.email}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>PHONE</div>
                <div style={{ color: '#fff', marginTop: 4, fontWeight: 600 }}>{selectedInquiry.phone || 'N/A'}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>BUDGET RANGE</div>
                <div style={{ color: '#34c759', marginTop: 4, fontWeight: 700 }}>{selectedInquiry.budget || '$1,000+'}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>STATUS</div>
                <div style={{ color: '#ff2d55', marginTop: 4, fontWeight: 700 }}>{selectedInquiry.status || 'New'}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 6 }}>PROJECT SCOPE / DESCRIPTION</div>
              <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                {selectedInquiry.description || 'No detailed scope description provided.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', padding: '10px 18px', borderRadius: 10, backgroundColor: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageSquare size={16} /> WhatsApp Client
                </a>
              )}
              <a
                href={`mailto:${selectedInquiry.email}`}
                style={{ textDecoration: 'none', padding: '10px 18px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Mail size={16} /> Email Client
              </a>
              <button
                onClick={() => handleUpdateStatus(selectedInquiry.id, 'Completed')}
                style={{ padding: '10px 18px', borderRadius: 10, backgroundColor: 'rgba(52,199,89,0.2)', border: '1px solid #34c759', color: '#34c759', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}
              >
                Mark Completed
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
