import React, { useState } from 'react';
import { ShieldAlertIcon, PlayIcon, SparklesIcon } from './Icons';

export default function AnomalyDetectorTab() {
  const [formData, setFormData] = useState({
    cpu_usage: 45.0,
    memory_usage: 60.0,
    network_traffic: 120.0,
    power_consumption: 85.0,
    num_executed_instructions: 500000,
    execution_time: 1.2,
    energy_efficiency: 0.85,
    task_type: 'database',
    task_priority: 'high',
    task_status: 'running',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    {
      label: 'Healthy Workload',
      data: {
        cpu_usage: 35.0,
        memory_usage: 45.0,
        network_traffic: 80.0,
        power_consumption: 65.0,
        num_executed_instructions: 300000,
        execution_time: 0.8,
        energy_efficiency: 0.92,
        task_type: 'database',
        task_priority: 'medium',
        task_status: 'running',
      },
    },
    {
      label: 'Critical Spike / Deadlock Risk',
      data: {
        cpu_usage: 98.5,
        memory_usage: 95.0,
        network_traffic: 850.0,
        power_consumption: 250.0,
        num_executed_instructions: 9800000,
        execution_time: 14.5,
        energy_efficiency: 0.15,
        task_type: 'database',
        task_priority: 'critical',
        task_status: 'running',
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
        cpu_usage: Number(formData.cpu_usage),
        memory_usage: Number(formData.memory_usage),
        network_traffic: Number(formData.network_traffic),
        power_consumption: Number(formData.power_consumption),
        num_executed_instructions: Number(formData.num_executed_instructions),
        execution_time: Number(formData.execution_time),
        energy_efficiency: Number(formData.energy_efficiency),
        task_type: formData.task_type,
        task_priority: formData.task_priority,
        task_status: formData.task_status,
      });
      let res;
      try {
        res = await fetch('/api/detect-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/detect-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setError(data.detail || 'Detection failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAnomaly = () => {
    if (result === null || result === undefined) return false;
    const val = Number(result);
    if (!isNaN(val)) return val === 1;
    const str = String(result).toLowerCase();
    return str.includes('true') || str.includes('1') || str.includes('anomaly') || str.includes('yes');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

      {/* Presets Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlertIcon size={18} className="text-rose-600" />
            <span>Database System Anomaly & Saturation Diagnostic</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
            Identify runaway queries, memory exhaustion, and high CPU saturation in database workloads.
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
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF1F2'; e.currentTarget.style.borderColor = '#F43F5E'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="simulator-layout-grid">

        {/* Left: Input Form Card */}
        <form onSubmit={handlePredict} className="studio-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Telemetry Diagnostics
            </span>
            <span style={{ fontSize: '11px', color: '#E11D48', backgroundColor: '#FFF1F2', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Live Inference
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label className="input-label" style={{ margin: 0 }}>CPU Usage</label>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#E11D48', backgroundColor: '#FFF1F2', padding: '1px 6px', borderRadius: '4px' }}>
                  {formData.cpu_usage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData.cpu_usage}
                onChange={(e) => setFormData({ ...formData, cpu_usage: e.target.value })}
                style={{ width: '100%', height: '7px', cursor: 'pointer', accentColor: '#E11D48' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label className="input-label" style={{ margin: 0 }}>Memory Usage</label>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#E11D48', backgroundColor: '#FFF1F2', padding: '1px 6px', borderRadius: '4px' }}>
                  {formData.memory_usage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData.memory_usage}
                onChange={(e) => setFormData({ ...formData, memory_usage: e.target.value })}
                style={{ width: '100%', height: '7px', cursor: 'pointer', accentColor: '#E11D48' }}
              />
            </div>

            <div>
              <label className="input-label">Network Traffic (MB/s)</label>
              <input
                type="number"
                step="0.1"
                value={formData.network_traffic}
                onChange={(e) => setFormData({ ...formData, network_traffic: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Power Consumption (W)</label>
              <input
                type="number"
                step="0.1"
                value={formData.power_consumption}
                onChange={(e) => setFormData({ ...formData, power_consumption: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Executed Instructions</label>
              <input
                type="number"
                value={formData.num_executed_instructions}
                onChange={(e) => setFormData({ ...formData, num_executed_instructions: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Execution Time (s)</label>
              <input
                type="number"
                step="0.1"
                value={formData.execution_time}
                onChange={(e) => setFormData({ ...formData, execution_time: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Task Priority</label>
              <select
                value={formData.task_priority}
                onChange={(e) => setFormData({ ...formData, task_priority: e.target.value })}
                className="studio-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="input-label">Task Status</label>
              <select
                value={formData.task_status}
                onChange={(e) => setFormData({ ...formData, task_status: e.target.value })}
                className="studio-select"
              >
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '13px', marginTop: '4px', backgroundColor: '#E11D48' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            <PlayIcon size={15} />
            <span>{loading ? 'Evaluating Workload...' : 'Run Anomaly Diagnostic 🛡️'}</span>
          </button>
        </form>

        {/* Right: Prediction Output Card */}
        <div className="studio-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              System Health Diagnostic
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {result !== null && result !== undefined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '20px 14px',
                borderRadius: '14px',
                backgroundColor: isAnomaly() ? '#FFF1F2' : '#ECFDF5',
                border: `1px solid ${isAnomaly() ? '#FECDD3' : '#A7F3D0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isAnomaly() ? '#BE123C' : '#047857'
                }}>
                  {isAnomaly() ? '⚠️ Anomaly Detected' : '✓ Normal Operation'}
                </span>
                <div style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  letterSpacing: '-0.02em',
                  color: isAnomaly() ? '#9F1239' : '#065F46'
                }}>
                  {isAnomaly() ? 'Critical Health Risk' : 'Healthy Workload'}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: isAnomaly() ? '#FFE4E6' : '#D1FAE5',
                  color: isAnomaly() ? '#881337' : '#064E3B'
                }}>
                  Status Code: {typeof result === 'object' ? JSON.stringify(result) : String(result)} ({isAnomaly() ? 'Risk Level: HIGH' : 'Risk Level: LOW'})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>CPU Saturation</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData.cpu_usage}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Memory Load</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData.memory_usage}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Instructions</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{Number(formData.num_executed_instructions).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px 14px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '2px dashed #CBD5E1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <ShieldAlertIcon size={32} className="text-slate-300" />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 }}>
                Awaiting Telemetry Parameters
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, maxWidth: '240px' }}>
                Select a preset or click Run Anomaly Diagnostic to evaluate system safety.
              </p>
            </div>
          )}

          {/* Optimizer Agent Tip */}
          <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#FFF1F2', border: '1px solid #FFE4E6', fontSize: '12px', color: '#881337', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <SparklesIcon size={13} className="text-rose-600" /> Diagnostic Insight:
            </span>
            <p style={{ margin: 0, color: '#9F1239', lineHeight: 1.45 }}>
              Spikes above 90% CPU accompanied by high memory consumption are characteristic of unindexed table scans on large tables.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
