import React, { useState } from 'react';
import { API_BASE_URL } from '../config.jsx';

// token is passed as a prop from App.jsx (extracted from URL hash)
const ResetPassword = ({ token, onNavigate }) => {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
      setTimeout(() => onNavigate('login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-up">
          <div className="auth-header">
            <span className="auth-logo">♟</span>
            <h1 className="auth-title">Invalid Link</h1>
            <p className="auth-sub">This reset link is missing or broken.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--white-dim)', marginBottom: 20 }}>
              Please request a new password reset link.
            </p>
            <button className="btn btn-primary btn-full"
              onClick={() => onNavigate('forgot-password')}>
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-up">
        <div className="auth-header">
          <span className="auth-logo">♟</span>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-sub">Choose a strong new password.</p>
        </div>

        <div className="card">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && (
            <div className="alert alert-success">
              ✓ {success}
              <div style={{ marginTop: 8, fontSize: 12 }}>Redirecting to login…</div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                {loading ? <><span className="spinner" /> Resetting…</> : '✓ Set New Password'}
              </button>
            </form>
          )}
        </div>

        <p className="auth-footer">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('login'); }}>
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
