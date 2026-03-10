import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const Signup = ({ onSignupSuccess, onNavigate }) => {
  const [form, setForm] = useState({ name: '', chessID: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.chessID.trim()) return 'Chess.com ID is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          chessID: form.chessID.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => onNavigate('login'), 1800);
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
          <span className="auth-logo">♕</span>
          <h1 className="auth-title">Join the tournament</h1>
          <p className="auth-sub">Register and begin your ascent.</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Silver"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chess.com ID</label>
                <input
                  className="form-input"
                  type="text"
                  name="chessID"
                  placeholder="SilverChess"
                  value={form.chessID}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                name="confirm"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange}
              />
            </div>

            <div
              className="card card-raised mt-4 mb-4"
              style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--white-dim)' }}
            >
              ♟ Your Chess.com ID is used to verify match results and fetch your profile.
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : '♟ Create Account'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          Already registered?{' '}
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('login'); }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
