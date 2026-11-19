import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import OptimizerChatTab from './components/OptimizerChatTab';
import DatabaseStudioTab from './components/DatabaseStudioTab';
import PerformanceMLTab from './components/PerformanceMLTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [dbInfo, setDbInfo] = useState({ tables: [], suggested_questions: [] });
  const [initialQuestion, setInitialQuestion] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Persistent Chat Messages (Survives tab switching and page refresh)
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('optimizer_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('optimizer_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('Failed to save chat to sessionStorage:', e);
    }
  }, [chatMessages]);

  const fetchTables = useCallback(async () => {
    try {
      let res;
      try {
        res = await fetch('/api/tables-info');
      } catch {
        res = await fetch('http://127.0.0.1:8000/tables-info');
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data.connected && data.tables && data.tables.length > 0) {
          setDbInfo({
            tables: data.tables.map((t) => t.name),
            suggested_questions: data.tables.map((t) => `How can I optimize the '${t.name}' table?`),
          });
        }
      }
    } catch (e) {
      console.log('Backend not connected or no database loaded yet:', e.message);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchTables();
    }
    return () => {
      isMounted = false;
    };
  }, [fetchTables]);

  const handleUploadFile = async (file) => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      let res;
      try {
        res = await fetch('/api/upload-db', {
          method: 'POST',
          body: formData,
        });
      } catch (proxyErr) {
        console.warn('Proxy upload failed, attempting direct fetch to http://127.0.0.1:8000/upload-db...', proxyErr);
        res = await fetch('http://127.0.0.1:8000/upload-db', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Server responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      setDbInfo(data);
      fetchTables();
      setActiveTab('chat');
    } catch (err) {
      alert(`Upload failed: ${err.message}.\n\nPlease ensure your backend server is running:\npython -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (type) => {
    const url = type === 'sql' ? '/api/download-sql' : '/api/download-db';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', type === 'sql' ? 'optimized_database.sql' : 'optimized_database.db');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDb = async () => {
    try {
      let res;
      try {
        res = await fetch('/api/reset-db', { method: 'POST' });
      } catch {
        res = await fetch('http://127.0.0.1:8000/reset-db', { method: 'POST' });
      }
      if (res && res.ok) {
        setDbInfo({ tables: [], suggested_questions: [] });
      }
    } catch (e) {
      console.error('Failed to reset database:', e);
      setDbInfo({ tables: [], suggested_questions: [] });
    }
    setChatMessages([]);
    try {
      sessionStorage.removeItem('optimizer_chat_messages');
    } catch {
      // Ignore storage error
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>

      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUploadFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept=".sql,.db,.sqlite"
        style={{ display: 'none' }}
      />

      {/* Uploading Overlay */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px 32px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div className="brand-dot" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Importing and auditing SQLite database...
            </span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbInfo={dbInfo}
        onDownload={handleDownload}
      />

      {/* Main Tab Views (100% width, unblocked natural scroll, persistent state) */}
      <main style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', overflow: 'hidden' }}>

        <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', height: '100%', width: '100%', flexDirection: 'column' }}>
          <OptimizerChatTab
            dbInfo={dbInfo}
            messages={chatMessages}
            setMessages={setChatMessages}
            onTriggerUpload={() => fileInputRef.current?.click()}
            initialQuestion={initialQuestion}
            onClearInitialQuestion={() => setInitialQuestion(null)}
            onResetDb={handleResetDb}
          />
        </div>

        <div style={{ display: activeTab === 'studio' ? 'block' : 'none', height: '100%', width: '100%', overflowY: 'auto' }}>
          <DatabaseStudioTab
            dbInfo={dbInfo}
          />
        </div>

        <div style={{ display: activeTab === 'models' ? 'block' : 'none', height: '100%', width: '100%', overflowY: 'auto' }}>
          <PerformanceMLTab />
        </div>

      </main>

    </div>
  );
}
