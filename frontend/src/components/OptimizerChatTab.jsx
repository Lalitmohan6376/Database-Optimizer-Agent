import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ZapIcon,
  BarChartIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  PlusIcon,
  MicIcon,
  ArrowUpIcon,
  CopyIcon,
  CheckIcon,
  PlayIcon,
  SparklesIcon,
  UploadIcon,
  TrashIcon
} from './Icons';

function renderInlineContent(text) {
  if (!text) return null;

  // Split by **bold**, `code`, or *italic*
  const tokens = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // Bold: **text** -> remove asterisks, render clean bold
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const boldText = token.slice(2, -2).trim();
      return (
        <strong key={idx} style={{ color: '#0F172A', fontWeight: 650 }}>
          {boldText}
        </strong>
      );
    }

    // Inline Code: `code` -> remove backticks, render clean styled pill
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      const codeText = token.slice(1, -1).trim();
      return (
        <code
          key={idx}
          style={{
            backgroundColor: '#F1F5F9',
            color: '#4338CA',
            padding: '2px 6px',
            borderRadius: '5px',
            fontSize: '12.5px',
            fontFamily: 'monospace',
            fontWeight: 600,
            border: '1px solid #E2E8F0',
            wordBreak: 'break-all',
          }}
        >
          {codeText}
        </code>
      );
    }

    // Italic: *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      const italicText = token.slice(1, -1).trim();
      return (
        <span key={idx} style={{ color: '#1E293B', fontStyle: 'italic' }}>
          {italicText}
        </span>
      );
    }

    // Regular text: clean any stray markdown asterisks or backticks completely
    const cleanText = token.replace(/[*`]/g, '');
    return <span key={idx}>{cleanText}</span>;
  });
}

function renderTextBlock(block, blockIndex) {
  const lines = block.split('\n');

  return (
    <div key={blockIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {lines.map((rawLine, lineIndex) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={lineIndex} style={{ height: '6px' }} />;
        }

        // Section header with emoji or markdown header ###
        const isHeader =
          /^[#]{1,4}\s+/.test(line) ||
          /^(🔍|⚠️|🛠|⚡|✅|📊|📌|💡|❌|🚀|🎯)/u.test(line) ||
          /^(Current Database Findings|Bottlenecks & Slow Queries|Recommended Fixes|Expected Performance Impact)/i.test(line);

        if (isHeader) {
          const headerClean = line.replace(/^[#]{1,4}\s+/, '');
          return (
            <div
              key={lineIndex}
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#0F172A',
                marginTop: lineIndex === 0 ? '2px' : '10px',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {renderInlineContent(headerClean)}
            </div>
          );
        }

        // Bullet point: - item, * item, • item
        const isBullet = /^[-*•]\s+/.test(line);
        if (isBullet) {
          const bulletText = line.replace(/^[-*•]\s+/, '');
          return (
            <div
              key={lineIndex}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                margin: '2px 0 2px 4px',
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  color: '#6366F1',
                  fontWeight: 800,
                  fontSize: '14px',
                  lineHeight: '22px',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                •
              </span>
              <div style={{ flex: 1, color: '#334155' }}>
                {renderInlineContent(bulletText)}
              </div>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={lineIndex} style={{ margin: '3px 0', lineHeight: 1.6, color: '#334155' }}>
            {renderInlineContent(line)}
          </p>
        );
      })}
    </div>
  );
}

function FormattedMessage({ content, onApplySql }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [applyingIndex, setApplyingIndex] = useState(null);
  const [appliedIndices, setAppliedIndices] = useState(new Set());

  const parts = content.split(/(```(?:sql)?[\s\S]*?```)/gi);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = async (code, index) => {
    setApplyingIndex(index);
    try {
      await onApplySql(code);
      setAppliedIndices((prev) => new Set(prev).add(index));
    } catch (e) {
      console.error(e);
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', lineHeight: 1.6, color: '#1E293B' }}>
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const cleanCode = part.replace(/^```(?:sql)?\s*/i, '').replace(/```$/, '').trim();
          const isCopied = copiedIndex === idx;
          const isApplied = appliedIndices.has(idx);
          const isApplying = applyingIndex === idx;

          return (
            <div key={idx} style={{ margin: '10px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: '#090D16', borderBottom: '1px solid #1E293B', fontSize: '12px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', color: '#818CF8', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                  ⚡ Recommended SQL Optimization
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopy(cleanCode, idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '6px', backgroundColor: '#1E293B', color: '#E2E8F0', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    {isCopied ? <CheckIcon size={12} className="text-emerald-400" /> : <CopyIcon size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleApply(cleanCode, idx)}
                    disabled={isApplied || isApplying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 11px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: isApplied || isApplying ? 'not-allowed' : 'pointer',
                      border: 'none',
                      backgroundColor: isApplied ? '#064E3B' : '#6366F1',
                      color: isApplied ? '#6EE7B7' : '#FFFFFF',
                    }}
                  >
                    <PlayIcon size={11} />
                    <span>{isApplying ? 'Applying...' : isApplied ? 'Applied ✓' : 'Apply Index ⚡'}</span>
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, padding: '14px', fontSize: '12.5px', fontFamily: 'monospace', color: '#6EE7B7', overflowX: 'auto', backgroundColor: '#0F172A' }}>
                <code>{cleanCode}</code>
              </pre>
            </div>
          );
        }

        return renderTextBlock(part, idx);
      })}
    </div>
  );
}

export default function OptimizerChatTab({
  dbInfo,
  messages: externalMessages,
  setMessages: setExternalMessages,
  onTriggerUpload,
  initialQuestion,
  onClearInitialQuestion,
  onResetDb
}) {
  const [internalMessages, setInternalMessages] = useState([]);
  const messages = externalMessages !== undefined ? externalMessages : internalMessages;
  const setMessages = setExternalMessages || setInternalMessages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevDbRef = useRef('');

  const tables = useMemo(() => dbInfo?.tables || [], [dbInfo?.tables]);
  const suggestedQuestions = useMemo(() => dbInfo?.suggested_questions || [], [dbInfo?.suggested_questions]);
  const hasDb = tables.length > 0;

  // As soon as a database file is uploaded, add the connection confirmation message in the chat area
  useEffect(() => {
    if (tables.length > 0) {
      const dbKey = tables.join(',');
      if (prevDbRef.current !== dbKey) {
        prevDbRef.current = dbKey;
        const confirmMsg = {
          id: `db-connected-${Date.now()}`,
          sender: 'bot',
          isConnectionNotice: true,
          content: `Database file connected with ${tables.length} tables: ${tables.join(', ')}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => (prev.length === 0 ? [confirmMsg] : [...prev, confirmMsg]));
      }
    } else {
      prevDbRef.current = '';
    }
  }, [tables, setMessages]);

  const sendMessage = useCallback(async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let res;
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
      }
      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        content: data.reply || 'No analysis returned from agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        content: `Error: Failed to reach optimizer agent (${err.message}). Ensure backend server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, setMessages]);

  useEffect(() => {
    if (!initialQuestion) return;
    const timer = setTimeout(() => {
      sendMessage(initialQuestion);
      onClearInitialQuestion?.();
    }, 10);
    return () => clearTimeout(timer);
  }, [initialQuestion, sendMessage, onClearInitialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast({ type: 'error', text: 'Speech recognition is not supported in this browser.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setToast({ type: 'info', text: '🎙️ Listening... speak your database question now.' });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setToast(null);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setToast({ type: 'error', text: 'Microphone recognition error or permission denied.' });
        setTimeout(() => setToast(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setToast({ type: 'error', text: `Mic error: ${e.message}` });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleApplySqlWrapper = async (sql) => {
    try {
      let res;
      try {
        res = await fetch('/api/apply-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql }),
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/apply-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql }),
        });
      }
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', text: data.message });
      } else {
        setToast({ type: 'error', text: data.error || 'Failed to apply index.' });
      }
    } catch (e) {
      setToast({ type: 'error', text: e.message });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleClearAndReset = async () => {
    try {
      if (onResetDb) {
        await onResetDb();
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
    setMessages([]);
    prevDbRef.current = '';
    setInput('');
    setToast({ type: 'info', text: 'Database data and chat history cleared.' });
    setTimeout(() => setToast(null), 3000);
  };

  // 4 Core Capability Cards (DESCRIPTIVE ONLY - NON-CLICKABLE per user request)
  const capabilityCards = [
    {
      icon: ZapIcon,
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      title: 'Autonomous Scan Detection',
      desc: 'Inspects SQLite execution plans via EXPLAIN QUERY PLAN to detect unindexed table scans and expensive nested loops.'
    },
    {
      icon: BarChartIcon,
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
      title: 'Smart Index Recommendations',
      desc: 'Recommends high-impact single and composite B-Tree indexes to accelerate filter and foreign key JOIN operations.'
    },
    {
      icon: ShieldCheckIcon,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'Automated Query & Health Audit',
      desc: 'Evaluates schema constraints, table cardinalities, and query complexity to safeguard database response times.'
    },
    {
      icon: TrendingUpIcon,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      title: 'Predictive ML Performance',
      desc: 'Leverages trained scikit-learn models to predict query latency, index speedup scores, and hardware anomalies.'
    }
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          padding: '10px 18px',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          zIndex: 60,
          backgroundColor: toast.type === 'success' ? '#ECFDF5' : toast.type === 'info' ? '#EEF2FF' : '#FFF1F2',
          color: toast.type === 'success' ? '#065F46' : toast.type === 'info' ? '#3730A3' : '#9F1239',
          borderBottom: `1px solid ${toast.type === 'success' ? '#A7F3D0' : toast.type === 'info' ? '#C7D2FE' : '#FECDD3'}`
        }}>
          {toast.text}
        </div>
      )}

      {/* Main Scrollable Viewport (Smooth, Unblocked Touch & Wheel Scrolling) */}
      <div className="scroll-view chat-scroll-container">
        <div style={{ width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Hero Section (Only shown when NO database is uploaded) */}
          {!hasDb && messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingTop: '6px' }}>

              {/* Header Title & Subtitle */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '9999px', backgroundColor: '#EEF2FF', border: '1px solid #E0E7FF', color: '#4F46E5', fontSize: '12px', fontWeight: 700 }}>
                  <SparklesIcon size={13} />
                  <span>Professional AI Database Optimizer Tool</span>
                </div>

                <h2 className="gradient-headline" style={{ fontSize: 'clamp(26px, 4.5vw, 38px)', textAlign: 'center', margin: '4px 0' }}>
                  Turn Raw Data Into High-Speed Intelligence
                </h2>

                <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', maxWidth: '600px', lineHeight: 1.55, margin: '0 auto' }}>
                  Attach any SQLite database or SQL dump to inspect schema bottlenecks, audit slow query plans, and generate production-grade index recommendations.
                </p>

                {/* Database Attachment CTA Button */}
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={onTriggerUpload} className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
                    <UploadIcon size={15} />
                    <span>Attach Database File (.db / .sql)</span>
                  </button>
                </div>
              </div>

              {/* 4 Informational Capability Cards (Strictly 2 at top, 2 at bottom - DESCRIPTIVE ONLY) */}
              <div className="capabilities-grid">
                {capabilityCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="capability-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: card.iconBg, color: card.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: '#94A3B8', textTransform: 'uppercase' }}>
                          Capability
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                        {card.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                        {card.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Header Action: Simple Delete/Trash Icon button to clear chat and delete uploaded database */}
          {(messages.length > 0 || hasDb) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
              <button
                type="button"
                onClick={handleClearAndReset}
                className="btn-outline"
                style={{
                  padding: '6px 9px',
                  borderRadius: '8px',
                  color: '#EF4444',
                  borderColor: '#FECDD3',
                  backgroundColor: '#FFF1F2',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(239, 68, 68, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                title="Clear chat and delete uploaded database"
                aria-label="Clear chat and delete uploaded database"
              >
                <TrashIcon size={15} />
              </button>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{ display: 'flex', gap: '12px', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
              >
                {!isUser && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#6366F1', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '2px', boxShadow: '0 2px 6px rgba(99,102,241,0.25)' }}>
                    AI
                  </div>
                )}

                {msg.isConnectionNotice ? (
                  <div className="chat-bubble-notice" style={{
                    padding: '18px 22px',
                    borderRadius: '18px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    borderTopLeftRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          Database Connected Successfully
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                        Active Database
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                      Your database file has been connected. All table schemas are loaded and ready for autonomous scan detection, query plan analysis, and index recommendations.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                        Loaded Tables ({tables.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tables.map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: '3px 10px',
                              borderRadius: '7px',
                              backgroundColor: '#EEF2FF',
                              border: '1px solid #E0E7FF',
                              color: '#4F46E5',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              fontWeight: 600
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>
                        Ask any optimization question or click a prompt below to proceed.
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="chat-bubble-msg" style={{
                    padding: '16px 20px',
                    borderRadius: '18px',
                    fontSize: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    backgroundColor: isUser ? '#6366F1' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    borderTopRightRadius: isUser ? '4px' : '18px',
                    borderTopLeftRadius: isUser ? '18px' : '4px',
                  }}>
                    {isUser ? (
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                    ) : (
                      <FormattedMessage content={msg.content} onApplySql={handleApplySqlWrapper} />
                    )}
                    <span style={{ display: 'block', fontSize: '11px', marginTop: '8px', fontFamily: 'monospace', color: isUser ? '#C7D2FE' : '#94A3B8' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {isUser && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Analyzing Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#6366F1', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                AI
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px 20px', borderRadius: '18px', borderTopLeftRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#6366F1', display: 'inline-block' }} className="animate-pulse" />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#6366F1', display: 'inline-block' }} className="animate-pulse" />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#6366F1', display: 'inline-block' }} className="animate-pulse" />
                </div>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                  Agent is inspecting database schemas, running EXPLAIN QUERY PLAN, and preparing optimizations...
                </span>
              </div>
            </div>
          )}

          {/* Clearance spacer so bottom message & Expected Performance Impact is 100% visible above floating bar */}
          <div style={{ height: '90px', width: '100%', flexShrink: 0 }} aria-hidden="true" />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="floating-bar-wrapper">
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'auto' }}>

          {/* Suggested Prompt Chips */}
          {suggestedQuestions.length > 0 && (
            <div className="prompt-chips-container">
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <SparklesIcon size={12} className="text-indigo-500" /> Prompts:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#334155'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Floating Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="floating-bar"
          >
            {/* '+' File Upload Button */}
            <button
              type="button"
              onClick={onTriggerUpload}
              className="bar-icon-btn"
              title="Attach a SQLite database or SQL dump"
            >
              <PlusIcon size={18} />
            </button>

            {/* '🎙️' Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className="bar-icon-btn"
              style={{
                backgroundColor: isListening ? '#FFE4E6' : '#F1F5F9',
                color: isListening ? '#E11D48' : '#475569'
              }}
              title={isListening ? 'Listening... click to stop' : 'Click to speak query'}
            >
              <MicIcon size={18} />
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or attach a database to optimize..."
              disabled={loading}
              className="floating-input"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '6px 6px',
                fontSize: '13px',
                color: '#0F172A'
              }}
            />

            {/* Purple '↑' Send Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bar-send-btn"
              title="Send Query to Agent"
            >
              <ArrowUpIcon size={18} />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
