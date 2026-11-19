import React from 'react';
import {
  ChatIcon,
  TableIcon,
  TrendingUpIcon,
  DownloadIcon
} from './Icons';

export default function Navbar({ activeTab, setActiveTab, dbInfo, onDownload }) {
  const tables = dbInfo?.tables || [];
  const hasDb = tables.length > 0;

  const tabs = [
    { id: 'chat', label: 'Optimizer Chat', shortLabel: 'Chat', icon: ChatIcon },
    { id: 'studio', label: 'Database Studio', shortLabel: 'Studio', icon: TableIcon },
    { id: 'models', label: 'Performance ML', shortLabel: 'ML Models', icon: TrendingUpIcon },
  ];

  return (
    <header className="studio-navbar">

      {/* Brand Logo & Name */}
      <div
        onClick={() => setActiveTab('chat')}
        className="studio-brand"
        title="Go to Optimizer Chat"
      >
        <div className="brand-dot" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="brand-title">
            <span className="brand-full-name">AI Database Optimizer</span>
            <span className="brand-short-name">DB Optimizer</span>
          </span>
          <span className="brand-badge">Studio</span>
        </div>
      </div>

      {/* Segmented Center Navigation Tabs */}
      <nav className="studio-nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`studio-nav-tab ${isActive ? 'active' : ''}`}
              title={tab.label}
            >
              <Icon size={15} />
              <span className="tab-full-label">{tab.label}</span>
              <span className="tab-short-label">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="navbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Database Status Badge (When DB is attached) */}
        {hasDb && (
          <div
            className="navbar-status-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '10px',
              border: '1px solid #A7F3D0',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }} />
            <span className="badge-full-label">{tables.length} Tables Connected</span>
            <span className="badge-short-label">{tables.length} Tables</span>
          </div>
        )}

        {/* Export SQL Button (When DB is attached) */}
        {hasDb && (
          <button
            onClick={() => onDownload('sql')}
            className="btn-primary navbar-export-btn"
            style={{ padding: '7px 12px' }}
            title="Download optimized SQL database script"
          >
            <DownloadIcon size={14} />
            <span className="export-full-label">Export SQL</span>
            <span className="export-short-label">SQL</span>
          </button>
        )}

      </div>

    </header>
  );
}
