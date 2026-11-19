import React, { useState } from 'react';
import { TrendingUpIcon, PlayIcon, SparklesIcon } from './Icons';

export default function PredictIndexTab() {
  const [formData, setFormData] = useState({
    vector_dimensions: 128,
    dataset_scale_millions: 1.0,
    top_k: 10,
    concurrent_clients: 5,
    database_engine: 'PostgreSQL',
    indexing_algorithm: 'HNSW',
    quantization_type: 'None',
    hardware_config: '4x CPU',
    use_case: 'Search',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    {
      label: 'Standard E-commerce',
      data: {
        vector_dimensions: 128,
        dataset_scale_millions: 1.0,
        top_k: 10,
        concurrent_clients: 10,
        database_engine: 'PostgreSQL',
        indexing_algorithm: 'HNSW',
        quantization_type: 'None',
        hardware_config: '4x CPU',
        use_case: 'Search',
      },
    },
    {
      label: 'High-Concurrency Filter',
      data: {
        vector_dimensions: 256,
        dataset_scale_millions: 5.0,
        top_k: 20,
        concurrent_clients: 50,
        database_engine: 'PostgreSQL',
        indexing_algorithm: 'IVF-Flat',
        quantization_type: 'SQ8',
        hardware_config: '8x CPU',
        use_case: 'Recommendation',
      },
    },
    {
      label: 'Lightweight SQLite B-Tree',
      data: {
        vector_dimensions: 64,
        dataset_scale_millions: 0.2,
        top_k: 5,
        concurrent_clients: 2,
        database_engine: 'SQLite',
        indexing_algorithm: 'B-Tree',
        quantization_type: 'None',
        hardware_config: '4x CPU',
        use_case: 'Search',
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
        vector_dimensions: Number(formData.vector_dimensions),
        dataset_scale_millions: Number(formData.dataset_scale_millions),
        top_k: Number(formData.top_k),
        concurrent_clients: Number(formData.concurrent_clients),
        database_engine: formData.database_engine,
        indexing_algorithm: formData.indexing_algorithm,
        quantization_type: formData.quantization_type,
        hardware_config: formData.hardware_config,
        use_case: formData.use_case,
      });
      let res;
      try {
        res = await fetch('/api/predict-index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/predict-index', {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

      {/* Presets Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUpIcon size={18} className="text-purple-600" />
            <span>Index Throughput & Benefit Calculator</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
            Calculate expected throughput speedups when creating indexes across database architectures.
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
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FAF5FF'; e.currentTarget.style.borderColor = '#A855F7'; }}
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
              Index Architecture Parameters
            </span>
            <span style={{ fontSize: '11px', color: '#9333EA', backgroundColor: '#FAF5FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Live Inference
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>

            <div>
              <label className="input-label">Indexed Columns</label>
              <input
                type="number"
                value={formData.vector_dimensions}
                onChange={(e) => setFormData({ ...formData, vector_dimensions: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Dataset Scale (M Rows)</label>
              <input
                type="number"
                step="0.1"
                value={formData.dataset_scale_millions}
                onChange={(e) => setFormData({ ...formData, dataset_scale_millions: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Top-K Query Results</label>
              <input
                type="number"
                value={formData.top_k}
                onChange={(e) => setFormData({ ...formData, top_k: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Concurrent Clients</label>
              <input
                type="number"
                value={formData.concurrent_clients}
                onChange={(e) => setFormData({ ...formData, concurrent_clients: e.target.value })}
                className="studio-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Database Engine</label>
              <select
                value={formData.database_engine}
                onChange={(e) => setFormData({ ...formData, database_engine: e.target.value })}
                className="studio-select"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="SQLite">SQLite</option>
                <option value="MySQL">MySQL</option>
                <option value="Milvus">Milvus</option>
                <option value="Qdrant">Qdrant</option>
              </select>
            </div>

            <div>
              <label className="input-label">Indexing Algorithm</label>
              <select
                value={formData.indexing_algorithm}
                onChange={(e) => setFormData({ ...formData, indexing_algorithm: e.target.value })}
                className="studio-select"
              >
                <option value="HNSW">HNSW</option>
                <option value="IVF-Flat">IVF-Flat</option>
                <option value="B-Tree">B-Tree</option>
                <option value="DiskANN">DiskANN</option>
              </select>
            </div>

            <div>
              <label className="input-label">Quantization</label>
              <select
                value={formData.quantization_type}
                onChange={(e) => setFormData({ ...formData, quantization_type: e.target.value })}
                className="studio-select"
              >
                <option value="None">None (Uncompressed)</option>
                <option value="SQ8">SQ8 (Scalar 8-bit)</option>
                <option value="PQ">PQ (Product Quantization)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Hardware Profile</label>
              <select
                value={formData.hardware_config}
                onChange={(e) => setFormData({ ...formData, hardware_config: e.target.value })}
                className="studio-select"
              >
                <option value="4x CPU">4x CPU (Standard)</option>
                <option value="8x CPU">8x CPU (High Compute)</option>
                <option value="16x CPU">16x CPU (Server Class)</option>
                <option value="GPU T4">GPU T4 (Accelerated)</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '13px', marginTop: '4px', backgroundColor: '#9333EA' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7E22CE'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9333EA'}
          >
            <PlayIcon size={15} />
            <span>{loading ? 'Evaluating Model...' : 'Calculate Index Benefit Score 📈'}</span>
          </button>
        </form>

        {/* Right: Prediction Output Card */}
        <div className="studio-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Index Optimization Score
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {result !== null && result !== undefined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px 14px', borderRadius: '14px', backgroundColor: '#FAF5FF', border: '1px solid #F3E8FF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#9333EA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Throughput / Benefit Rating
                </span>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#7E22CE', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                  {typeof result === 'number' ? `${result.toFixed(2)} QPS` : String(result)}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#F3E8FF',
                  color: '#6B21A8',
                  border: '1px solid #E9D5FF'
                }}>
                  High Indexing ROI
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Database Engine</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData.database_engine}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Algorithm</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData.indexing_algorithm}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Data Volume</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{formData.dataset_scale_millions}M Rows</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px 14px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '2px dashed #CBD5E1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <TrendingUpIcon size={32} className="text-slate-300" />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 }}>
                Awaiting Index Parameters
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, maxWidth: '240px' }}>
                Select a preset and calculate index benefit scores to evaluate throughput gain.
              </p>
            </div>
          )}

          {/* Optimizer Agent Tip */}
          <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#FAF5FF', border: '1px solid #F3E8FF', fontSize: '12px', color: '#581C87', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <SparklesIcon size={13} className="text-purple-600" /> Recommendation:
            </span>
            <p style={{ margin: 0, color: '#6B21A8', lineHeight: 1.45 }}>
              Compound B-Tree indexes on joined columns avoid temporary disk sort structures, scaling throughput significantly.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
