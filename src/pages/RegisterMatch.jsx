import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config.jsx';

const RegisterMatch = ({ user, token, onNavigate }) => {
  const [form, setForm] = useState({
    opponentChessID: '',
    matchType: 'rapid',
    winner: user.chessID,
  });
  const [screenshot, setScreenshot]         = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotMimeType, setScreenshotMimeType] = useState('image/png');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed (PNG, JPG, WEBP).');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be under 5MB.');
      return;
    }

    setScreenshotMimeType(file.type);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      // Strip the data URL prefix — store only the base64 string
      const base64 = reader.result.split(',')[1];
      setScreenshot(base64);
      setScreenshotPreview(reader.result); // full data URL for preview
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (!screenshot) {
      setError('Please upload a screenshot of the match result.');
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
          screenshot,
          screenshotMimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register match.');

      setSuccess(`Match registered! +${data.pointsAwarded} point${data.pointsAwarded !== 1 ? 's' : ''} awarded.`);
      setForm(prev => ({ ...prev, opponentChessID: '' }));
      handleRemoveScreenshot();
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
            A screenshot of the result is required.
          </p>
        </div>

        {/* Point info cards */}
        <div className="grid-2 animate-up-delay-1" style={{ marginBottom: 28 }}>
          <div
            className="card"
            style={{
              textAlign: 'center', cursor: 'pointer',
              border: form.matchType === 'rapid' ? '1px solid var(--green-bright)' : undefined,
              boxShadow: form.matchType === 'rapid' ? '0 0 16px rgba(76,175,80,0.15)' : undefined,
            }}
            onClick={() => setForm(p => ({ ...p, matchType: 'rapid' }))}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--green-accent)' }}>1 pt</div>
            <div className="stat-key" style={{ marginTop: 4 }}>Rapid Game</div>
          </div>
          <div
            className="card"
            style={{
              textAlign: 'center', cursor: 'pointer',
              border: form.matchType === 'daily' ? '1px solid var(--gold)' : undefined,
              boxShadow: form.matchType === 'daily' ? '0 0 16px rgba(212,168,67,0.12)' : undefined,
            }}
            onClick={() => setForm(p => ({ ...p, matchType: 'daily' }))}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>3 pts</div>
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
              <select className="form-select" name="matchType" value={form.matchType} onChange={handleChange}>
                <option value="rapid">⚡ Rapid (1 point)</option>
                <option value="daily">📅 Daily / 3-day (3 points)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Winner</label>
              <select className="form-select" name="winner" value={form.winner} onChange={handleChange}
                disabled={!form.opponentChessID.trim()}>
                <option value={user.chessID}>♔ {user.chessID} (you)</option>
                {form.opponentChessID.trim() && (
                  <option value={form.opponentChessID.trim()}>♟ {form.opponentChessID.trim()} (opponent)</option>
                )}
              </select>
            </div>

            {/* Screenshot Upload */}
            <div className="form-group">
              <label className="form-label">Match Screenshot <span style={{ color: '#ef5350' }}>*</span></label>

              {!screenshotPreview ? (
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    background: 'var(--bg-deep)',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const fakeEvent = { target: { files: [file] } };
                      handleFileChange(fakeEvent);
                    }
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                  <div style={{ fontSize: 14, color: 'var(--white-dim)', marginBottom: 6 }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(158,176,158,0.5)' }}>
                    PNG, JPG, WEBP — max 5MB
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--green-bright)' }}>
                  <img
                    src={screenshotPreview}
                    alt="Match screenshot"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#000', display: 'block' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(198,40,40,0.85)', color: '#fff',
                      border: 'none', borderRadius: 4, padding: '4px 10px',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    ✕ Remove
                  </button>
                  <div style={{ padding: '8px 12px', background: 'rgba(76,175,80,0.1)', fontSize: 12, color: 'var(--green-bright)' }}>
                    ✓ Screenshot uploaded
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
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
                    {form.winner === user.chessID
                      ? `You win · +${points[form.matchType]} pt${points[form.matchType] > 1 ? 's' : ''}`
                      : `${form.opponentChessID} wins`}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !screenshot}>
              {loading ? <><span className="spinner" /> Registering…</> : '♟ Register Match'}
            </button>

            {!screenshot && (
              <p style={{ fontSize: 11, color: 'rgba(158,176,158,0.5)', textAlign: 'center', marginTop: 8 }}>
                Upload a screenshot to enable submission
              </p>
            )}
          </form>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--white-dim)', textAlign: 'center' }}>
          Monthly limit: 20 matches · Screenshots are reviewed by admin
        </div>
      </div>
    </div>
  );
};

export default RegisterMatch;
