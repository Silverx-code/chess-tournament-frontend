import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../config.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '♟'];
const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];

// ── Single Message Bubble ──────────────────────────────────────────────
const MessageBubble = ({ msg, currentUser, token, onDelete, onPin, onReact, isAdmin }) => {
  const isMe       = msg.chessID === currentUser.chessID;
  const isAdminMsg = msg.chessID && msg.chessID === currentUser.chessID && isAdmin;
  const time       = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date       = new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const [showActions, setShowActions] = useState(false);

  const totalReactions = EMOJIS.reduce((s, e) => s + (msg.reactions?.[e]?.length || 0), 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        gap: 10,
        marginBottom: 16,
        alignItems: 'flex-end',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: isMe ? 'rgba(76,175,80,0.2)' : 'var(--bg-raised)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
        color: isMe ? 'var(--green-accent)' : 'var(--white-dim)',
      }}>
        {msg.chessID?.[0]?.toUpperCase() || '?'}
      </div>

      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        {/* Name + time */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          marginBottom: 4,
        }}>
          {msg.isPinned && (
            <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.05em' }}>📌 PINNED</span>
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: isMe ? 'var(--green-accent)' : 'var(--white-dim)' }}>
            {isMe ? 'You' : msg.chessID}
            {msg.isAdminPost && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--gold)', background: 'rgba(212,168,67,0.15)', padding: '1px 6px', borderRadius: 10 }}>ADMIN</span>}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(158,176,158,0.5)' }}>{time} · {date}</span>
        </div>

        {/* Bubble */}
        <div style={{
          background: isMe ? 'rgba(46,125,50,0.25)' : 'var(--bg-card)',
          border: `1px solid ${isMe ? 'rgba(76,175,80,0.3)' : 'var(--border)'}`,
          borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
          padding: '10px 14px',
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--white)',
          wordBreak: 'break-word',
          boxShadow: msg.isPinned ? '0 0 12px rgba(212,168,67,0.15)' : undefined,
          borderColor: msg.isPinned ? 'rgba(212,168,67,0.4)' : undefined,
        }}>
          {msg.content}
        </div>

        {/* Reactions display */}
        {totalReactions > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            {EMOJIS.map(emoji => {
              const count = msg.reactions?.[emoji]?.length || 0;
              if (!count) return null;
              const iReacted = msg.reactions?.[emoji]?.includes(currentUser.chessID);
              return (
                <button key={emoji} onClick={() => onReact(msg._id, emoji)}
                  style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    background: iReacted ? 'rgba(76,175,80,0.2)' : 'var(--bg-raised)',
                    border: `1px solid ${iReacted ? 'rgba(76,175,80,0.4)' : 'var(--border)'}`,
                    color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  {emoji} {count}
                </button>
              );
            })}
          </div>
        )}

        {/* Action bar on hover */}
        {showActions && (
          <div style={{
            display: 'flex', gap: 4, marginTop: 6,
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* Emoji picker */}
            {EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => onReact(msg._id, emoji)}
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 7px', fontSize: 13, cursor: 'pointer' }}>
                {emoji}
              </button>
            ))}
            {/* Pin (admin only) */}
            {isAdmin && (
              <button onClick={() => onPin(msg._id)}
                style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--gold)' }}>
                {msg.isPinned ? 'Unpin' : '📌 Pin'}
              </button>
            )}
            {/* Delete (admin or own message) */}
            {(isAdmin || isMe) && (
              <button onClick={() => onDelete(msg._id)}
                style={{ background: 'rgba(198,40,40,0.1)', border: '1px solid rgba(198,40,40,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: '#ef5350' }}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Chat Page ─────────────────────────────────────────────────────
const Chat = ({ user, token }) => {
  const [channel, setChannel]   = useState('general');
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);
  const isAdmin                 = user?.isAdmin;

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/chat/${channel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        if (!silent) setLoading(false);
      }
    } catch (_) {
      if (!silent) setLoading(false);
    }
  }, [channel, token]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
  }, [channel]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data]);
        setInput('');
      }
    } catch (_) {}
    setSending(false);
  };

  const handleDelete = async id => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (_) {}
  };

  const handlePin = async id => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/chat/${id}/pin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMessages(true);
    } catch (_) {}
  };

  const handleReact = async (id, emoji) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/chat/${id}/react`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => prev.map(m =>
          m._id === id ? { ...m, reactions: data.reactions } : m
        ));
      }
    } catch (_) {}
  };

  const canPost = channel === 'general' || isAdmin;
  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ padding: '20px 0 12px', flexShrink: 0 }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="section-label">ChessArena</p>
            <h1 className="page-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
              {channel === 'general' ? '💬 General Chat' : '📢 Announcements'}
            </h1>
          </div>
          {/* Channel switcher */}
          <div className="flex gap-3">
            <button
              className={`btn ${channel === 'general' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setChannel('general')}
            >
              💬 General
            </button>
            <button
              className={`btn ${channel === 'announcements' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setChannel('announcements')}
            >
              📢 Announcements
            </button>
          </div>
        </div>

        {/* Announcements notice */}
        {channel === 'announcements' && !isAdmin && (
          <div style={{ marginTop: 10, padding: '8px 14px', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 6, fontSize: 12, color: 'var(--gold)' }}>
            📢 Only admins can post here. This channel is for official announcements.
          </div>
        )}

        {/* Pinned messages preview */}
        {pinnedMessages.length > 0 && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>📌 Pinned</div>
            {pinnedMessages.map(m => (
              <div key={m._id} style={{ fontSize: 13, color: 'var(--white)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid var(--gold)' }}>
                <strong style={{ color: 'var(--gold)' }}>{m.chessID}:</strong> {m.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px 4px',
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {channel === 'general' ? '💬' : '📢'}
            </div>
            <p>{channel === 'general' ? 'No messages yet. Say something!' : 'No announcements yet.'}</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentUser={user}
              token={token}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onPin={handlePin}
              onReact={handleReact}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ flexShrink: 0, padding: '12px 0 16px', borderTop: '1px solid var(--border)' }}>
        {canPost ? (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              placeholder={channel === 'general' ? 'Message everyone…' : 'Post an announcement…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={500}
              style={{ flex: 1 }}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 20px', flexShrink: 0 }}
              disabled={sending || !input.trim()}
            >
              {sending ? <span className="spinner" /> : '↑ Send'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: 'var(--white-dim)', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            🔒 Only admins can post in Announcements
          </div>
        )}
        {input.length > 400 && (
          <div style={{ fontSize: 11, color: input.length > 490 ? '#ef5350' : 'var(--white-dim)', marginTop: 4, textAlign: 'right' }}>
            {input.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
