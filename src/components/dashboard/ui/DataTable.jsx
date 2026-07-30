import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download, Trash2, CheckSquare, Square, Eye, Edit3 } from 'lucide-react';
import { playClickSound, playHoverSound } from '../../../utils/audio.js';

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  onBulkDelete,
  onBulkPublish,
  onRowClick,
  actions
}) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val && String(val).toLowerCase().includes(term)
      )
    );
  }, [data, search]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortCol] ?? '';
      const valB = b[sortCol] ?? '';
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortCol, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (colKey) => {
    playClickSound();
    if (sortCol === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = () => {
    playClickSound();
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((d) => d.id || d._id));
    }
  };

  const toggleSelectRow = (id) => {
    playClickSound();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    playClickSound();
    const headers = columns.map((c) => c.label).join(',');
    const rows = sortedData.map((row) =>
      columns.map((c) => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ backgroundColor: 'rgba(12, 12, 16, 0.75)', border: '1px solid rgba(255, 45, 85, 0.25)', borderRadius: 24, backdropFilter: 'blur(20px)', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}>
      {/* Table Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Actions & Bulk Operations */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <>
              {onBulkDelete && (
                <button
                  onClick={() => { onBulkDelete(selectedIds); setSelectedIds([]); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 59, 48, 0.15)',
                    border: '1px solid rgba(255, 59, 48, 0.4)',
                    color: '#ff3b30',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Trash2 size={14} /> Bulk Delete ({selectedIds.length})
                </button>
              )}
              {onBulkPublish && (
                <button
                  onClick={() => { onBulkPublish(selectedIds); setSelectedIds([]); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(52, 199, 89, 0.15)',
                    border: '1px solid rgba(52, 199, 89, 0.4)',
                    color: '#34c759',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Bulk Publish
                </button>
              )}
            </>
          )}

          <button
            onClick={exportCSV}
            onMouseEnter={playHoverSound}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              color: '#ffffff',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '12px 16px', width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', accentColor: '#ff2d55' }}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: '12px 16px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {col.label}
                    {sortCol === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} color="#ff2d55" /> : <ChevronDown size={14} color="#ff2d55" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 2 : 1)} style={{ padding: 40, textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id || row._id || idx;
                const isSelected = selectedIds.includes(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: isSelected ? 'rgba(255, 45, 85, 0.08)' : 'transparent',
                      transition: 'background 0.2s ease',
                      cursor: onRowClick ? 'pointer' : 'default'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(rowId)}
                        style={{ cursor: 'pointer', accentColor: '#ff2d55' }}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.85)' }}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        <div>
          Showing {paginatedData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} items
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: page === 1 ? 'rgba(255,255,255,0.2)' : '#ffffff',
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: page === totalPages ? 'rgba(255,255,255,0.2)' : '#ffffff',
              cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(255, 45, 85, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
