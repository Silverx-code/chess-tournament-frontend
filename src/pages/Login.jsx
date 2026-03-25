import React, { useState } from 'react';
import { API_BASE_URL } from '../config.jsx';

const Login = ({ onLoginSuccess, onNavigate }) => {
  const [form, setForm]     = useState({ chessID: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.chessID.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chessID: form.chessID.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
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
          <span className="auth-logo">♔</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Enter the arena. Claim your rank.</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Chess.com ID</label>
              <input
                className="form-input"
                type="text"
                name="chessID"
                placeholder="e.g. SilverChess"
                value={form.chessID}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <a
                  href="#"
                  style={{ fontSize: 12, color: 'var(--green-bright)', textDecoration: 'none' }}
                  onClick={e => { e.preventDefault(); onNavigate('forgot-password'); }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full mt-4"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Signing in…</> : '♟ Sign In'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          No account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('signup'); }}>
            Create one — it's free
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
