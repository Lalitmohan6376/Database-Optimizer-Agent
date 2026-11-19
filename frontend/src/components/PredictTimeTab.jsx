import React, { useState } from 'react';
import { ClockIcon, PlayIcon, SparklesIcon } from './Icons';

export default function PredictTimeTab() {
  const [formData, setFormData] = useState({
    'Rows Returned': 100,
    'Columns Returned': 5,
    'CPU Used (%)': 20.0,
    'RAM Used (MB)': 50.0,
    'Disk Read (MB)': 2.5,
    'Type': 'SELECT',
    'Table(s)': 'customers',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    {
      label: 'Light SELECT',
      data: {
        'Rows Returned': 25,
        'Columns Returned': 4,
        'CPU Used (%)': 8.0,
        'RAM Used (MB)': 20.0,
        'Disk Read (MB)': 0.5,
        'Type': 'SELECT',
        'Table(s)': 'customers',
      },
    },
    {
      label: 'Medium JOIN',
      data: {
        'Rows Returned': 500,
        'Columns Returned': 8,
        'CPU Used (%)': 35.0,
        'RAM Used (MB)': 85.0,
        'Disk Read (MB)': 6.2,
        'Type': 'SELECT',
        'Table(s)': 'orders, customers',
      },
    },
    {
      label: 'Heavy Scan',
      data: {
        'Rows Returned': 2500,
        'Columns Returned': 12,
        'CPU Used (%)': 75.0,
        'RAM Used (MB)': 210.0,
        'Disk Read (MB)': 28.5,
        'Type': 'SELECT',
        'Table(s)': 'order_items, products',
      },
    },
  ];

  const handlePredict = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = JSON.stringify({
        'Rows Returned': Number(formData['Rows Returned']),
        'Columns Returned': Number(formData['Columns Returned']),
        'CPU Used (%)': Number(formData['CPU Used (%)']),
        'RAM Used (MB)': Number(formData['RAM Used (MB)']),
        'Disk Read (MB)': Number(formData['Disk Read (MB)']),
        'Type': formData['Type'],
        'Table(s)': formData['Table(s)'],
      });
      let res;
      try {
        res = await fetch('/api/predict-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/predict-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setError(data.detail || 'Prediction failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLatencyTier = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { label: 'Normal', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
    if (num < 0.1) return { label: 'Lightning Fast (<100ms)', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
    if (num < 1.0) return { label: 'Acceptable (<1s)', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' };
    if (num < 5.0) return { label: 'Slow Scan (>1s)', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
    return { label: 'Critical Latency (>5s)', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

      {/* Presets Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockIcon size={18} className="text-indigo-600" />
            <span>Query Latency Prediction Simulator</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
            Input query metrics to calculate expected execution latency with the trained pipeline.
          </p>
        </div>

        {/* Presets Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFormData(preset.data);
                setResult(null);
              }}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid (Inputs on Left, Result on Right; Stacks cleanly on Mobile) */}
      <div className="simulator-layout-grid">

        {/* Left: Input Form Card */}
        <form onSubmit={handlePredict} className="studio-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Query Telemetry Inputs
            </span>
            <span style={{ fontSize: '11px', color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Live Inference
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>

            <div>
              <label className="input-label">Rows Returned</label>
              <input
                type="number"
                value={formData['Rows Returned']}
                onChange={(e) => setFormData({ ...formData, 'Rows Returned': e.target.value })}
                className="studio-input"
                required
                min="1"
              />
            </div>

            <div>
              <label className="input-label">Columns Returned</label>
              <input
                type="number"
                value={formData['Columns Returned']}
                onChange={(e) => setFormData({ ...formData, 'Columns Returned': e.target.value })}
                className="studio-input"
                required
                min="1"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ margin: 0 }}>CPU Usage</label>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '1px 6px', borderRadius: '4px' }}>
                  {formData['CPU Used (%)']}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData['CPU Used (%)']}
                onChange={(e) => setFormData({ ...formData, 'CPU Used (%)': e.target.value })}
                style={{ width: '100%', height: '7px', cursor: 'pointer', accentColor: '#6366F1' }}
              />
            </div>

            <div>
              <label className="input-label">RAM Used (MB)</label>
              <input
                type="number"
                step="0.1"
                value={formData['RAM Used (MB)']}
                onChange={(e) => setFormData({ ...formData, 'RAM Used (MB)': e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Disk Read (MB)</label>
              <input
                type="number"
                step="0.1"
                value={formData['Disk Read (MB)']}
                onChange={(e) => setFormData({ ...formData, 'Disk Read (MB)': e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Query Type</label>
              <select
                value={formData['Type']}
                onChange={(e) => setFormData({ ...formData, 'Type': e.target.value })}
                className="studio-select"
              >
                <option value="SELECT">SELECT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="JOIN">JOIN</option>
              </select>
            </div>

            <div>
              <label className="input-label">Target Table(s)</label>
              <input
                type="text"
                value={formData['Table(s)']}
                onChange={(e) => setFormData({ ...formData, 'Table(s)': e.target.value })}
                className="studio-input"
                required
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '13px', marginTop: '4px' }}
          >
            <PlayIcon size={15} />
            <span>{loading ? 'Running ML Inference...' : 'Predict Execution Latency ⚡'}</span>
          </button>
        </form>

        {/* Right: Prediction Output Card */}
        <div className="studio-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Inference Result
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {result !== null && result !== undefined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px 14px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Predicted Execution Time
                </span>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#4F46E5', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                  {typeof result === 'number' ? `${result.toFixed(4)}s` : String(result)}
                </div>
                <div>
                  {(() => {
                    const tier = getLatencyTier(result);
                    return (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: tier.bg,
                        color: tier.color,
                        border: `1px solid ${tier.border}`
                      }}>
                        {tier.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Rows Processed</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData['Rows Returned']}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>CPU Footprint</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData['CPU Used (%)']}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Disk Read Load</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData['Disk Read (MB)']} MB</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px 14px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '2px dashed #CBD5E1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <ClockIcon size={32} className="text-slate-300" />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 }}>
                Awaiting Query Telemetry
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, maxWidth: '240px' }}>
                Select a preset or click Predict Execution Latency to generate real model output.
              </p>
            </div>
          )}

          {/* Optimizer Agent Tip */}
          <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#EEF2FF', border: '1px solid #E0E7FF', fontSize: '12px', color: '#312E81', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <SparklesIcon size={13} className="text-indigo-600" /> Performance Analysis:
            </span>
            <p style={{ margin: 0, color: '#4338CA', lineHeight: 1.45 }}>
              Queries requiring over 0.2s under moderate rows typically benefit directly from B-Tree index creation on WHERE/JOIN columns.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
