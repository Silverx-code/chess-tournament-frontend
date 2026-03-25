import React, { useState } from 'react';
import { API_BASE_URL } from '../config.jsx';

const ForgotPassword = ({ onNavigate }) => {
  const [chessID, setChessID] = useState('');
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!chessID.trim() || !email.trim()) {
      setError('Both Chess ID and email are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chessID: chessID.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-up">
        <div className="auth-header">
          <span className="auth-logo">♟</span>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-sub">Enter your Chess ID and email to receive a reset link.</p>
        </div>

        <div className="card">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && (
            <div className="alert alert-success">
              ✓ {success}
              <div style={{ marginTop: 8, fontSize: 12 }}>
                Check your inbox — the link expires in 1 hour.
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Chess.com ID</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. SilverChess"
                  value={chessID}
                  onChange={e => { setChessID(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending…</> : '♟ Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="auth-footer">
          Remembered it?{' '}
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('login'); }}>
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
