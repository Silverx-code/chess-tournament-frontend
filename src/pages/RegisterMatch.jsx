import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const RegisterMatch = ({ user, token, onNavigate }) => {
  const [form, setForm] = useState({
    opponentChessID: '',
    matchType: 'rapid',
    winner: user.chessID,
  });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.opponentChessID.trim()) {
      setError("Enter your opponent's Chess.com ID.");
      return;
    }
    if (form.opponentChessID.trim().toLowerCase() === user.chessID.toLowerCase()) {
      setError("You can't register a match against yourself.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/match/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opponentChessID: form.opponentChessID.trim(),
          matchType: form.matchType,
          winner: form.winner,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register match.');
      setSuccess(`Match registered! +${data.pointsAwarded} point${data.pointsAwarded !== 1 ? 's' : ''} awarded.`);
      setForm(prev => ({ ...prev, opponentChessID: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const points = { rapid: 1, daily: 3 };

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-up" style={{ marginBottom: 32 }}>
          <p className="section-label">Match Registration</p>
          <h1 className="page-title">
            Record a <span className="accent">Match</span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: 8 }}>
            Both players should agree before registering.
          </p>
        </div>

        {/* Point info cards */}
        <div className="grid-2 animate-up-delay-1" style={{ marginBottom: 28 }}>
          <div
            className="card"
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              border: form.matchType === 'rapid' ? '1px solid var(--green-bright)' : undefined,
              boxShadow: form.matchType === 'rapid' ? '0 0 16px rgba(76,175,80,0.15)' : undefined,
            }}
            onClick={() => setForm(p => ({ ...p, matchType: 'rapid' }))}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--green-accent)' }}>
              1 pt
            </div>
            <div className="stat-key" style={{ marginTop: 4 }}>Rapid Game</div>
          </div>
          <div
            className="card"
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              border: form.matchType === 'daily' ? '1px solid var(--gold)' : undefined,
              boxShadow: form.matchType === 'daily' ? '0 0 16px rgba(212,168,67,0.12)' : undefined,
            }}
            onClick={() => setForm(p => ({ ...p, matchType: 'daily' }))}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>
              3 pts
            </div>
            <div className="stat-key" style={{ marginTop: 4 }}>Daily (3-day)</div>
          </div>
        </div>

        {/* Form */}
        <div className="card animate-up-delay-2">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Opponent Chess.com ID</label>
              <input
                className="form-input"
                type="text"
                name="opponentChessID"
                placeholder="e.g. MagicChess"
                value={form.opponentChessID}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Match Type</label>
              <select
                className="form-select"
                name="matchType"
                value={form.matchType}
                onChange={handleChange}
              >
                <option value="rapid">⚡ Rapid  (1 point)</option>
                <option value="daily">📅 Daily / 3-day  (3 points)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Winner</label>
              <select
                className="form-select"
                name="winner"
                value={form.winner}
                onChange={handleChange}
                disabled={!form.opponentChessID.trim()}
              >
                <option value={user.chessID}>♔ {user.chessID} (you)</option>
                {form.opponentChessID.trim() && (
                  <option value={form.opponentChessID.trim()}>
                    ♟ {form.opponentChessID.trim()} (opponent)
                  </option>
                )}
              </select>
            </div>

            {/* Preview */}
            {form.opponentChessID.trim() && (
              <div className="card card-raised" style={{ padding: '14px 18px', marginBottom: 20 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Match Preview</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>{user.chessID}</span>
                  <span style={{ color: 'var(--white-dim)', fontSize: 12 }}>vs</span>
                  <span style={{ fontWeight: 600 }}>{form.opponentChessID}</span>
                  <span className={`badge badge-${form.matchType}`}>{form.matchType}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--green-accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {form.winner === user.chessID ? `You win · +${points[form.matchType]} pt${points[form.matchType] > 1 ? 's' : ''}` : `${form.opponentChessID} wins`}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Registering…</> : '♟ Register Match'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--white-dim)', textAlign: 'center' }}>
          Monthly limit: 20 matches · matches reset on the 1st of each month
        </div>
      </div>
    </div>
  );
};

export default RegisterMatch;
