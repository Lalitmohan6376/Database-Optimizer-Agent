import React, { useState } from 'react';
import PredictTimeTab from './PredictTimeTab';
import PredictIndexTab from './PredictIndexTab';
import AnomalyDetectorTab from './AnomalyDetectorTab';
import { ClockIcon, TrendingUpIcon, ShieldAlertIcon, CheckIcon, SparklesIcon } from './Icons';

export default function PerformanceMLTab() {
  const [activeModel, setActiveModel] = useState('time');

  const models = [
    {
      id: 'time',
      name: 'Query Latency Model',
      icon: ClockIcon,
      accentColor: '#6366F1',
      bgColor: '#EEF2FF',
      desc: 'Estimates SQLite query execution latency in seconds based on row count and CPU telemetry.',
      tag: 'Latency Inference'
    },
    {
      id: 'index',
      name: 'Index Benefit Model',
      icon: TrendingUpIcon,
      accentColor: '#9333EA',
      bgColor: '#FAF5FF',
      desc: 'Calculates throughput improvement and efficiency gain score for secondary indexes.',
      tag: 'Speedup Scoring'
    },
    {
      id: 'anomaly',
      name: 'System Anomaly Detector',
      icon: ShieldAlertIcon,
      accentColor: '#E11D48',
      bgColor: '#FFF1F2',
      desc: 'Identifies memory saturation, high CPU spikes, and rogue runaway queries before crashes.',
      tag: 'Health Diagnostics'
    },
  ];

  return (
    <div className="scroll-view" style={{ padding: '24px 16px 80px 16px', backgroundColor: '#F8FAFC' }}>

      {/* Centered Wrapper for the ENTIRE ML Page */}
      <div style={{ width: '100%', maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Page Title & Intro */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '9999px', backgroundColor: '#EEF2FF', border: '1px solid #E0E7FF', color: '#4F46E5', fontSize: '12px', fontWeight: 700 }}>
            <SparklesIcon size={13} />
            <span>Interactive Machine Learning Suite</span>
          </div>

          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Trained Database Intelligence Models
          </h2>

          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>
            Select one of the 3 predictive models below to input metrics and run live scikit-learn machine learning inferences.
          </p>
        </div>

        {/* 3-MODEL SELECTOR CARDS (Responsive & Clean - No .pkl file names) */}
        <div className="ml-models-grid">
          {models.map((m) => {
            const Icon = m.icon;
            const isActive = activeModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setActiveModel(m.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  border: isActive ? `2px solid ${m.accentColor}` : '2px solid #E2E8F0',
                  boxShadow: isActive ? `0 8px 20px -4px ${m.accentColor}24` : '0 2px 4px rgba(0,0,0,0.02)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Top Row: Icon + Active Check Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: m.bgColor,
                    color: m.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>

                  {isActive ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      backgroundColor: m.accentColor,
                      color: '#FFFFFF'
                    }}>
                      <CheckIcon size={11} /> Active
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#F1F5F9',
                      color: '#64748B'
                    }}>
                      {m.tag}
                    </span>
                  )}
                </div>

                {/* Model Title */}
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {m.name}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Model Interface (Rendered Centered Below) */}
        <div style={{ width: '100%', marginTop: '4px' }}>
          {activeModel === 'time' && <PredictTimeTab />}
          {activeModel === 'index' && <PredictIndexTab />}
          {activeModel === 'anomaly' && <AnomalyDetectorTab />}
        </div>

      </div>

    </div>
  );
}
