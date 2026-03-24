import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config.jsx';

const RegisterMatch = ({ user, token, onNavigate }) => {
  const [form, setForm] = useState({
    opponentChessID: '',
    matchType: 'rapid',
    result: 'win',
    winner: user.chessID,
  });
  const [fixtures, setFixtures]               = useState([]);
  const [selectedFixture, setSelectedFixture] = useState('');
  const [screenshot, setScreenshot]           = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotMimeType, setScreenshotMimeType] = useState('image/png');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load player's scheduled fixtures
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/fixtures/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setFixtures(data.filter(f => f.status === 'scheduled'));
        }
      } catch (_) {}
    };
    fetchFixtures();
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Reset winner to current user when switching to draw
      if (name === 'result' && value === 'draw') updated.winner = '';
      if (name === 'result' && value === 'win') updated.winner = user.chessID;
      return updated;
    });
    setError('');
  };

  const handleFixtureSelect = e => {
    const id = e.target.value;
    setSelectedFixture(id);
    if (id) {
      const fix = fixtures.find(f => f._id === id);
      if (fix) {
        const opponent = fix.player1ChessID === user.chessID
          ? fix.player2ChessID : fix.player1ChessID;
        setForm(prev => ({ ...prev, opponentChessID: opponent }));
      }
    }
    setError('');
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Screenshot must be under 5MB.'); return; }
    setScreenshotMimeType(file.type);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result.split(',')[1]);
      setScreenshotPreview(reader.result);
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
    if (!form.opponentChessID.trim()) { setError("Enter your opponent's Chess.com ID."); return; }
    if (form.opponentChessID.trim().toLowerCase() === user.chessID.toLowerCase()) {
      setError("You can't register a match against yourself."); return;
    }
    if (!screenshot) { setError('Please upload a screenshot of the match result.'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/match/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          opponentChessID:  form.opponentChessID.trim(),
          matchType:        form.matchType,
          result:           form.result,
          winner:           form.result === 'win' ? form.winner : null,
          screenshot,
          screenshotMimeType,
          fixtureId:        selectedFixture || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register match.');
      setSuccess(data.message);
      setForm(prev => ({ ...prev, opponentChessID: '' }));
      setSelectedFixture('');
      handleRemoveScreenshot();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="animate-up" style={{ marginBottom: 32 }}>
          <p className="section-label">League Match Registration</p>
          <h1 className="page-title">Record a <span className="accent">Match</span></h1>
          <p className="page-subtitle" style={{ marginTop: 8 }}>Screenshot required. Win = 3pts · Draw = 1pt each.</p>
        </div>

        {/* Result selector */}
        <div className="grid-2 animate-up-delay-1" style={{ marginBottom: 28 }}>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer',
            border: form.result === 'win' ? '1px solid var(--green-bright)' : undefined,
            boxShadow: form.result === 'win' ? '0 0 16px rgba(76,175,80,0.15)' : undefined }}
            onClick={() => setForm(p => ({ ...p, result: 'win', winner: user.chessID }))}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--green-accent)' }}>3 pts</div>
            <div className="stat-key" style={{ marginTop: 4 }}>Win</div>
          </div>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer',
            border: form.result === 'draw' ? '1px solid var(--gold)' : undefined,
            boxShadow: form.result === 'draw' ? '0 0 16px rgba(212,168,67,0.12)' : undefined }}
            onClick={() => setForm(p => ({ ...p, result: 'draw', winner: '' }))}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🤝</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>1 pt each</div>
            <div className="stat-key" style={{ marginTop: 4 }}>Draw</div>
          </div>
        </div>

        <div className="card animate-up-delay-2">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Link to fixture */}
            {fixtures.length > 0 && (
              <div className="form-group">
                <label className="form-label">Link to Scheduled Fixture (optional)</label>
                <select className="form-select" value={selectedFixture} onChange={handleFixtureSelect}>
                  <option value="">— Select a fixture —</option>
                  {fixtures.map(f => {
                    const opponent = f.player1ChessID === user.chessID ? f.player2ChessID : f.player1ChessID;
                    const date = new Date(f.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    return (
                      <option key={f._id} value={f._id}>
                        vs {opponent} — {date} (Round {f.round})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Opponent Chess.com ID</label>
              <input className="form-input" type="text" name="opponentChessID"
                placeholder="e.g. MagicChess" value={form.opponentChessID} onChange={handleChange} autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Match Type</label>
              <select className="form-select" name="matchType" value={form.matchType} onChange={handleChange}>
                <option value="rapid">⚡ Rapid</option>
                <option value="daily">📅 Daily / 3-day</option>
              </select>
            </div>

            {form.result === 'win' && (
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
            )}

            {form.result === 'draw' && (
              <div className="card card-raised" style={{ padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--white-dim)' }}>
                🤝 Draw — both <strong style={{ color: 'var(--gold)' }}>{user.chessID}</strong> and <strong style={{ color: 'var(--gold)' }}>{form.opponentChessID || 'opponent'}</strong> receive <strong style={{ color: 'var(--gold)' }}>+1 point</strong>
              </div>
            )}

            {/* Screenshot upload */}
            <div className="form-group">
              <label className="form-label">Match Screenshot <span style={{ color: '#ef5350' }}>*</span></label>
              {!screenshotPreview ? (
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-deep)' }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileChange({ target: { files: [file] } }); }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                  <div style={{ fontSize: 14, color: 'var(--white-dim)', marginBottom: 6 }}>Click to upload or drag & drop</div>
                  <div style={{ fontSize: 11, color: 'rgba(158,176,158,0.5)' }}>PNG, JPG, WEBP — max 5MB</div>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--green-bright)' }}>
                  <img src={screenshotPreview} alt="Match screenshot" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#000', display: 'block' }} />
                  <button type="button" onClick={handleRemoveScreenshot}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(198,40,40,0.85)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    ✕ Remove
                  </button>
                  <div style={{ padding: '8px 12px', background: 'rgba(76,175,80,0.1)', fontSize: 12, color: 'var(--green-bright)' }}>✓ Screenshot uploaded</div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
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
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 700, color: form.result === 'draw' ? 'var(--gold)' : 'var(--green-accent)' }}>
                    {form.result === 'draw' ? '🤝 Draw · +1pt each' : form.winner === user.chessID ? '🏆 You win · +3pts' : `🏆 ${form.opponentChessID} wins · +3pts`}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !screenshot}>
              {loading ? <><span className="spinner" /> Registering…</> : '♟ Register Match'}
            </button>
            {!screenshot && (
              <p style={{ fontSize: 11, color: 'rgba(158,176,158,0.5)', textAlign: 'center', marginTop: 8 }}>Upload a screenshot to enable submission</p>
            )}
          </form>
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--white-dim)', textAlign: 'center' }}>
          Win = 3pts · Draw = 1pt each · Loss = 0pts · Screenshots reviewed by admin
        </div>
      </div>
    </div>
  );
};

export default RegisterMatch;
