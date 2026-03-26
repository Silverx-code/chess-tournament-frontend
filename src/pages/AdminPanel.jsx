import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config.jsx';

// ── Screenshot Viewer ──────────────────────────────────────────────────
const ScreenshotViewer = ({ matchId, token }) => {
  const [show, setShow]         = useState(false);
  const [imgData, setImgData]   = useState(null);
  const [mimeType, setMimeType] = useState('image/png');
  const [loading, setLoading]   = useState(false);

  const fetchScreenshot = async () => {
    if (imgData) { setShow(true); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/matches/${matchId}/screenshot`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setImgData(data.screenshot);
        setMimeType(data.screenshotMimeType || 'image/png');
        setShow(true);
      }
    } catch (_) {}
    setLoading(false);
  };

  return (
    <>
      <button
        style={{ padding: '5px 12px', fontSize: 11, background: 'rgba(76,175,80,0.1)', color: 'var(--green-bright)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 4, cursor: 'pointer' }}
        onClick={fetchScreenshot}
        disabled={loading}
      >
        {loading ? '…' : '📸 View'}
      </button>

      {show && imgData && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}
          onClick={() => setShow(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={`data:${mimeType};base64,${imgData}`}
              alt="Match screenshot"
              style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}
            />
            <button
              onClick={() => setShow(false)}
              style={{ position: 'absolute', top: -12, right: -12, background: 'rgba(198,40,40,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--white-dim)' }}>
              Click outside to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Password Reset Modal ───────────────────────────────────────────────
const PasswordResetModal = ({ user, token, onDone, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleReset = async () => {
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.chessID}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="card" style={{ width: 380, maxWidth: '90vw' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Reset Password</h3>
        <p style={{ fontSize: 13, color: 'var(--white-dim)', marginBottom: 20 }}>
          Setting new password for <strong style={{ color: 'var(--green-accent)' }}>{user.chessID}</strong>
        </p>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters"
            value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input className="form-input" type="password" placeholder="Repeat new password"
            value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReset} disabled={loading}>
            {loading ? <span className="spinner" /> : '✓ Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Admin Login ────────────────────────────────────────────────────────
const AdminLogin = ({ onLoginSuccess }) => {
  const [form, setForm]       = useState({ chessID: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
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
          <span className="auth-logo">♛</span>
          <h1 className="auth-title">Admin Access</h1>
          <p className="auth-sub">Restricted — authorised personnel only.</p>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Chess ID</label>
              <input className="form-input" type="text" placeholder="Your Chess.com ID"
                value={form.chessID} onChange={e => setForm(p => ({ ...p, chessID: e.target.value }))} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : '♛ Admin Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────
const StatCard = ({ value, label, color }) => (
  <div className="card">
    <div className="stat-value" style={{ color: color || 'var(--white)' }}>{value}</div>
    <div className="stat-key">{label}</div>
  </div>
);

// ── Points Editor ──────────────────────────────────────────────────────
const PointsEditor = ({ user, token, onDone }) => {
  const [points, setPoints] = useState(user.totalPoints);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.chessID}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ points: Number(points) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone(data.user, `Points updated to ${points} for ${user.chessID}`);
    } catch (err) {
      onDone(null, err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
      <input className="form-input" type="number" min="0" value={points}
        onChange={e => setPoints(e.target.value)} style={{ width: 100 }} />
      <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }} onClick={handleSave} disabled={loading}>
        {loading ? <span className="spinner" /> : 'Save'}
      </button>
    </div>
  );
};

// ── Suspend Modal ──────────────────────────────────────────────────────
const SuspendModal = ({ user, token, onDone, onClose }) => {
  const [days, setDays]     = useState(7);
  const [loading, setLoading] = useState(false);

  const handleSuspend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.chessID}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days: Number(days) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone(data.user, `${user.chessID} suspended for ${days} days`);
    } catch (err) {
      onDone(null, err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="card" style={{ width: 360, maxWidth: '90vw' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Suspend {user.chessID}</h3>
        <div className="form-group">
          <label className="form-label">Suspension duration (days)</label>
          <input className="form-input" type="number" min="1" max="365" value={days} onChange={e => setDays(e.target.value)} />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button style={{ flex: 1, padding: '12px 24px', background: 'rgba(198,40,40,0.2)', color: '#ef5350', border: '1px solid rgba(198,40,40,0.4)', borderRadius: 4, cursor: 'pointer' }}
            onClick={handleSuspend} disabled={loading}>
            {loading ? <span className="spinner" /> : `Suspend ${days}d`}
          </button>
        </div>
      </div>
    </div>
  );
};


// ── Fixture Manager ────────────────────────────────────────────────────
const FixtureManager = ({ token }) => {
  const [fixtures, setFixtures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    player1ChessID: '',
    player2ChessID: '',
    scheduledDate: '',
    round: 1,
    notes: ''
  });

  const [updateForm, setUpdateForm] = useState({
    player1ChessID: '',
    player2ChessID: '',
    scheduledDate: '',
    round: 1,
    status: 'scheduled',
    notes: ''
  });

  const [selectedFixtureId, setSelectedFixtureId] = useState('');
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── FETCH USERS ─────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (_) {}
  };

  // ── FETCH FIXTURES ──────────────────────────
  const fetchFixtures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/fixtures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFixtures(
          data.sort(
            (a, b) =>
              new Date(a.scheduledDate) - new Date(b.scheduledDate)
          )
        );
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchFixtures();
      fetchUsers();
    }
  }, [token]);

  // ── AUTO-FILL UPDATE FORM ───────────────────
  useEffect(() => {
    if (!selectedFixtureId) return;

    const f = fixtures.find(x => x._id === selectedFixtureId);
    if (!f) return;

    setUpdateForm({
      player1ChessID: f.player1ChessID,
      player2ChessID: f.player2ChessID,
      scheduledDate: f.scheduledDate?.slice(0, 16),
      round: f.round,
      status: f.status,
      notes: f.notes || '',
    });
  }, [selectedFixtureId, fixtures]);

  // ── CREATE ──────────────────────────────────
  const handleCreate = async e => {
    e.preventDefault();

    if (!form.player1ChessID || !form.player2ChessID || !form.scheduledDate) {
      setError('All fields except notes are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/fixtures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Fixture created!');
      setForm({
        player1ChessID: '',
        player2ChessID: '',
        scheduledDate: '',
        round: 1,
        notes: ''
      });

      fetchFixtures();
    } catch (err) {
      setError(err.message);
    }

    setSaving(false);
  };

  // ── UPDATE ──────────────────────────────────
  const handleUpdate = async e => {
    e.preventDefault();
    if (!selectedFixtureId) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/fixtures/${selectedFixtureId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...updateForm,
            round: Number(updateForm.round)
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Fixture updated!');
      fetchFixtures();
    } catch (err) {
      setError(err.message);
    }

    setUpdating(false);
  };

  // ── DELETE ──────────────────────────────────
  const handleDelete = async id => {
    if (!window.confirm('Delete this fixture?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/fixtures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFixtures();
      setSelectedFixtureId('');
    } catch (_) {}
  };

  return (
    <div>
      {/* CREATE */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-label">Create New Fixture</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <select
              className="form-input"
              value={form.player1ChessID}
              onChange={e =>
                setForm(p => ({ ...p, player1ChessID: e.target.value }))
              }
            >
              <option value="">Select Player 1</option>
              {users.map(u => (
                <option
                  key={u.chessID}
                  value={u.chessID}
                  disabled={u.chessID === form.player2ChessID}
                >
                  {u.chessID} ({u.name})
                </option>
              ))}
            </select>

            <select
              className="form-input"
              value={form.player2ChessID}
              onChange={e =>
                setForm(p => ({ ...p, player2ChessID: e.target.value }))
              }
            >
              <option value="">Select Player 2</option>
              {users.map(u => (
                <option
                  key={u.chessID}
                  value={u.chessID}
                  disabled={u.chessID === form.player1ChessID}
                >
                  {u.chessID} ({u.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <input
              type="datetime-local"
              className="form-input"
              value={form.scheduledDate}
              onChange={e =>
                setForm(p => ({ ...p, scheduledDate: e.target.value }))
              }
            />

            <input
              type="number"
              className="form-input"
              value={form.round}
              onChange={e =>
                setForm(p => ({ ...p, round: Number(e.target.value) }))
              }
            />
          </div>

          <input
            className="form-input"
            placeholder="Notes"
            value={form.notes}
            onChange={e =>
              setForm(p => ({ ...p, notes: e.target.value }))
            }
          />

          <button className="btn btn-primary" disabled={saving}>
            {saving ? '...' : '+ Create'}
          </button>
        </form>
      </div>

      {/* SELECT */}
      <div className="card">
        <p className="section-label">Manage Fixtures</p>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <select
            className="form-input"
            value={selectedFixtureId}
            onChange={e => setSelectedFixtureId(e.target.value)}
          >
            <option value="">Select fixture</option>
            {fixtures.map(f => (
              <option key={f._id} value={f._id}>
                {f.player1ChessID} vs {f.player2ChessID} — Round {f.round}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* UPDATE */}
      {selectedFixtureId && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="section-label">Update Fixture</p>

          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <select
                className="form-input"
                value={updateForm.player1ChessID}
                onChange={e =>
                  setUpdateForm(p => ({
                    ...p,
                    player1ChessID: e.target.value
                  }))
                }
              >
                {users.map(u => (
                  <option key={u.chessID} value={u.chessID}>
                    {u.chessID} ({u.name})
                  </option>
                ))}
              </select>

              <select
                className="form-input"
                value={updateForm.player2ChessID}
                onChange={e =>
                  setUpdateForm(p => ({
                    ...p,
                    player2ChessID: e.target.value
                  }))
                }
              >
                {users.map(u => (
                  <option key={u.chessID} value={u.chessID}>
                    {u.chessID} ({u.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <input
                type="datetime-local"
                className="form-input"
                value={updateForm.scheduledDate || ''}
                onChange={e =>
                  setUpdateForm(p => ({
                    ...p,
                    scheduledDate: e.target.value
                  }))
                }
              />

              <input
                type="number"
                className="form-input"
                value={updateForm.round}
                onChange={e =>
                  setUpdateForm(p => ({
                    ...p,
                    round: Number(e.target.value)
                  }))
                }
              />
            </div>

            <select
              className="form-input"
              value={updateForm.status}
              onChange={e =>
                setUpdateForm(p => ({
                  ...p,
                  status: e.target.value
                }))
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
            </select>

            <input
              className="form-input"
              value={updateForm.notes}
              onChange={e =>
                setUpdateForm(p => ({
                  ...p,
                  notes: e.target.value
                }))
              }
            />

            <div className="flex gap-3 mt-3">
              <button className="btn btn-primary" disabled={updating}>
                {updating ? '...' : 'Update'}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleDelete(selectedFixtureId)}
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Main Admin Panel ───────────────────────────────────────────────────
const AdminPanel = ({ onNavigate }) => {
  const [adminUser, setAdminUser]   = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [users, setUsers]           = useState([]);
  const [matches, setMatches]       = useState([]);
  const [tab, setTab]               = useState('users');
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [suspendTarget, setSuspendTarget]   = useState(null);
  const [editPointsFor, setEditPointsFor]   = useState(null);
  const [resetPasswordFor, setResetPasswordFor] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const [uRes, mRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`,   { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch(`${API_BASE_URL}/api/admin/matches`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      ]);
      const uData = await uRes.json();
      const mData = await mRes.json();
      if (Array.isArray(uData)) setUsers(uData);
      if (Array.isArray(mData)) setMatches(mData);
    } catch (_) {}
    setLoading(false);
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (url, method = 'PATCH', body = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(data.message);
      fetchData();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const onPointsDone = (updatedUser, msg, isError = false) => {
    showToast(msg, isError);
    setEditPointsFor(null);
    if (!isError) fetchData();
  };

  const onSuspendDone = (updatedUser, msg, isError = false) => {
    showToast(msg, isError);
    setSuspendTarget(null);
    if (!isError) fetchData();
  };

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={(u, t) => { setAdminUser(u); setAdminToken(t); }} />;
  }

  const totalPlayers = users.length;
  const suspended    = users.filter(u => u.isSuspended).length;
  const blocked      = users.filter(u => u.isBlocked).length;
  const totalMatches = matches.length;

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, padding: '12px 20px', borderRadius: 6, background: toast.isError ? 'rgba(198,40,40,0.9)' : 'rgba(46,125,50,0.9)', color: '#fff', fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          {toast.isError ? '✗' : '✓'} {toast.msg}
        </div>
      )}

      {/* Suspend Modal */}
      {suspendTarget && (
        <SuspendModal user={suspendTarget} token={adminToken} onDone={onSuspendDone} onClose={() => setSuspendTarget(null)} />
      )}

      {/* Password Reset Modal */}
      {resetPasswordFor && (
        <PasswordResetModal
          user={resetPasswordFor}
          token={adminToken}
          onDone={(msg) => { showToast(msg); setResetPasswordFor(null); }}
          onClose={() => setResetPasswordFor(null)}
        />
      )}

      {/* Header */}
      <div className="flex-between mb-6 animate-up" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="section-label">Admin Panel</p>
          <h1 className="page-title">♛ <span className="accent">Control</span> Centre</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => onNavigate('dashboard')}>← Back to App</button>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setAdminUser(null); setAdminToken(null); }}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 animate-up-delay-1" style={{ marginBottom: 28 }}>
        <StatCard value={totalPlayers} label="Total Players" color="var(--green-accent)" />
        <StatCard value={totalMatches} label="Total Matches" />
        <StatCard value={suspended} label="Suspended" color="#ff9800" />
        <StatCard value={blocked} label="Blocked" color="#ef5350" />
      </div>

      {/* Tabs */}
      <div className="flex gap-3 animate-up-delay-2" style={{ marginBottom: 20 }}>
        {['users', 'matches', 'fixtures'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 12 }} onClick={() => setTab(t)}>
            {t === 'users' ? `♟ Players (${totalPlayers})` : t === 'matches' ? `📋 Matches (${totalMatches})` : '📅 Fixtures'}
          </button>
        ))}
        <button className="btn btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className="card animate-up-delay-2" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Matches</th>
                    <th>Status</th>
                    <th>Edit Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const status = u.isBlocked ? 'blocked' : u.isSuspended ? 'suspended' : u.isAdmin ? 'admin' : 'active';
                    const statusColors = {
                      blocked:   { bg: 'rgba(198,40,40,0.15)',  color: '#ef5350' },
                      suspended: { bg: 'rgba(255,152,0,0.15)',  color: '#ff9800' },
                      admin:     { bg: 'rgba(118,255,3,0.15)',  color: 'var(--green-accent)' },
                      active:    { bg: 'rgba(76,175,80,0.1)',   color: 'var(--green-bright)' },
                    };
                    const sc = statusColors[status];
                    return (
                      <tr key={u.chessID}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.chessID}</div>
                          <div style={{ fontSize: 11, color: 'var(--white-dim)' }}>{u.name}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--green-accent)' }}>{u.totalPoints}</td>
                        <td>{u.matchesPlayed}</td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>{status}</span>
                          {u.isSuspended && u.suspendedUntil && (
                            <div style={{ fontSize: 10, color: 'var(--white-dim)', marginTop: 3 }}>until {new Date(u.suspendedUntil).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td>
                          {editPointsFor === u.chessID
                            ? <PointsEditor user={u} token={adminToken} onDone={onPointsDone} />
                            : <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setEditPointsFor(u.chessID)}>Edit</button>
                          }
                        </td>
                        <td>
                          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            {!u.isBlocked && (
                              u.isSuspended
                                ? <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => handleAction(`/api/admin/users/${u.chessID}/unsuspend`)}>Unsuspend</button>
                                : <button style={{ padding: '5px 10px', fontSize: 10, background: 'rgba(255,152,0,0.1)', color: '#ff9800', border: '1px solid rgba(255,152,0,0.3)', borderRadius: 4, cursor: 'pointer' }} onClick={() => setSuspendTarget(u)}>Suspend</button>
                            )}
                            {u.isBlocked
                              ? <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => handleAction(`/api/admin/users/${u.chessID}/unblock`)}>Unblock</button>
                              : <button style={{ padding: '5px 10px', fontSize: 10, background: 'rgba(198,40,40,0.1)', color: '#ef5350', border: '1px solid rgba(198,40,40,0.3)', borderRadius: 4, cursor: 'pointer' }} onClick={() => { if (window.confirm(`Permanently block ${u.chessID}?`)) handleAction(`/api/admin/users/${u.chessID}/block`); }}>Block</button>
                            }
                            <button style={{ padding: '5px 10px', fontSize: 10, background: 'rgba(76,175,80,0.08)', color: 'var(--white-dim)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }} onClick={() => { if (window.confirm(`Reset ${u.chessID}'s stats?`)) handleAction(`/api/admin/users/${u.chessID}/reset`); }}>Reset</button>
                            {!u.isAdmin && (
                              <button style={{ padding: '5px 10px', fontSize: 10, background: 'rgba(118,255,3,0.08)', color: 'var(--green-accent)', border: '1px solid rgba(118,255,3,0.2)', borderRadius: 4, cursor: 'pointer' }} onClick={() => { if (window.confirm(`Promote ${u.chessID} to admin?`)) handleAction(`/api/admin/users/${u.chessID}/promote`); }}>Promote</button>
                            )}
                            <button style={{ padding: '5px 10px', fontSize: 10, background: 'rgba(100,149,237,0.1)', color: '#6495ed', border: '1px solid rgba(100,149,237,0.3)', borderRadius: 4, cursor: 'pointer' }} onClick={() => setResetPasswordFor(u)}>🔑 Password</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Matches Table */}
      {tab === 'matches' && (
        <div className="card animate-up-delay-2" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Loser</th>
                    <th>Type</th>
                    <th>Points</th>
                    <th>Date</th>
                    <th>Screenshot</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600, color: 'var(--green-accent)' }}>{m.winnerChessID}</td>
                      <td style={{ color: 'var(--white-dim)' }}>{m.loserChessID}</td>
                      <td><span className={`badge badge-${m.matchType}`}>{m.matchType}</span></td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>+{m.pointsAwarded}</td>
                      <td style={{ fontSize: 12, color: 'var(--white-dim)' }}>
                        {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <ScreenshotViewer matchId={m._id} token={adminToken} />
                      </td>
                      <td>
                        <button
                          style={{ padding: '5px 12px', fontSize: 11, background: 'rgba(198,40,40,0.1)', color: '#ef5350', border: '1px solid rgba(198,40,40,0.3)', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => { if (window.confirm('Delete this match and reverse points?')) handleAction(`/api/admin/matches/${m._id}`, 'DELETE'); }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fixtures Tab */}
      {tab === 'fixtures' && (
        <div className="animate-up-delay-2">
          <FixtureManager token={adminToken} />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
