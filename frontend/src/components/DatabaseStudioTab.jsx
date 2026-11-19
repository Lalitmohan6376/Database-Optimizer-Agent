import React, { useState, useEffect } from 'react';
import { TableIcon, DatabaseIcon, RefreshIcon } from './Icons';

export default function DatabaseStudioTab({ dbInfo }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);

  const safeFetch = async (endpoint) => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Fallback direct to port 8000
    }
    const directUrl = endpoint.startsWith('/api')
      ? `http://127.0.0.1:8000${endpoint.replace(/^\/api/, '')}`
      : `http://127.0.0.1:8000${endpoint}`;
    const directRes = await fetch(directUrl);
    return await directRes.json();
  };

  useEffect(() => {
    let isMounted = true;
    safeFetch('/api/tables-info')
      .then((data) => {
        if (!isMounted) return;
        if (data.tables && data.tables.length > 0) {
          setTables(data.tables);
          setSelectedTable((prev) => {
            if (prev) {
              const found = data.tables.find((t) => t.name === prev.name);
              if (found) return found;
            }
            return data.tables[0];
          });
        } else {
          setTables([]);
          setSelectedTable(null);
        }
      })
      .catch((err) => console.error('Error fetching tables info:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dbInfo]);

  useEffect(() => {
    if (!selectedTable?.name) return;
    let isMounted = true;
    const tableName = selectedTable.name;

    setPreviewLoading(true);
    safeFetch(`/api/table-preview/${tableName}`)
      .then((data) => {
        if (isMounted) setPreviewData(data);
      })
      .catch((err) => console.error('Error fetching preview:', err))
      .finally(() => {
        if (isMounted) setPreviewLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTable]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748B' }}>
        <RefreshIcon size={28} className="animate-spin text-indigo-600" />
        <p style={{ fontSize: '13px', fontWeight: 600 }}>Loading database tables...</p>
      </div>
    );
  }

  // Empty State: NO Upload button here
  if (tables.length === 0) {
    return (
      <div className="scroll-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }} className="studio-card p-8">
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DatabaseIcon size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            No Database Connected Yet
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            Attach an SQLite database file (.db) or SQL dump (.sql) in <strong>Optimizer Chat</strong> to view its table records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-view" style={{ padding: '24px 20px 80px 20px', backgroundColor: '#F8FAFC' }}>
      <div style={{ width: '100%', maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TableIcon size={18} className="text-indigo-600" />
              <span>Database Studio</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
              View and inspect uploaded database table records (top 100 rows).
            </p>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #E0E7FF' }}>
            {tables.length} Tables Available
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tables.map((t) => {
            const isSelected = selectedTable?.name === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isSelected ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                  backgroundColor: isSelected ? '#6366F1' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  boxShadow: isSelected ? '0 2px 6px rgba(99,102,241,0.2)' : '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <TableIcon size={13} />
                <span>{t.name}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#64748B'
                }}>
                  {t.row_count?.toLocaleString()} rows
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table Card (Strictly displays table data: top 100 rows, no extra operations) */}
        {selectedTable && (
          <div className="studio-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                  {selectedTable.name}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  ({selectedTable.row_count?.toLocaleString()} total records)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600, backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                Showing {previewData?.rows?.length || 0} rows (max 100)
              </span>
            </div>

            {previewLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <RefreshIcon size={20} className="animate-spin text-indigo-600" />
                <span>Loading records for '{selectedTable.name}'...</span>
              </div>
            ) : previewData?.rows && previewData.rows.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E2E8F0', maxHeight: '520px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' }}>
                  <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '9px 12px', fontWeight: 700, color: '#64748B', width: '48px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0' }}>
                        #
                      </th>
                      {previewData.columns.map((col, idx) => (
                        <th key={idx} style={{ padding: '9px 14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', backgroundColor: '#F8FAFC' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#FFFFFF' }}>
                    {previewData.rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: rIdx % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                        <td style={{ padding: '7px 10px', color: '#94A3B8', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #F1F5F9' }}>
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '7px 14px', color: '#334155', whiteSpace: 'nowrap' }}>
                            {cell === null ? (
                              <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '11px' }}>NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                No records found in this table.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
