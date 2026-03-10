import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];

const PlayerProfile = ({ user, token, profileChessID, onNavigate }) => {
  // profileChessID = whose profile to show (default: own)
  const targetID = profileChessID || user.chessID;
  const isOwnProfile = targetID === user.chessID;

  const [profile, setProfile]       = useState(null);
  const [matches, setMatches]       = useState([]);
  const [rank, setRank]             = useState(null);
  const [avatar, setAvatar]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all'); // all | rapid | daily

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [lbRes, matchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/matches?chessID=${targetID}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const lb = await lbRes.json();
        const matchData = await matchRes.json();

        const me = lb.find(p => p.chessID === targetID);
        if (me) {
          setProfile(me);
          setRank(lb.indexOf(me) + 1);
        }
        setMatches(Array.isArray(matchData) ? matchData : []);

        // Chess.com avatar
        try {
          const avRes = await fetch(`https://api.chess.com/pub/player/${targetID}`);
          const avData = await avRes.json();
          if (avData.avatar) setAvatar(avData.avatar);
        } catch (_) {}
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, [targetID, token]);

  const wins   = matches.filter(m => m.winnerChessID === targetID);
  const losses = matches.filter(m => m.loserChessID  === targetID);
  const winRate = matches.length ? Math.round((wins.length / matches.length) * 100) : 0;

  const filtered = filter === 'all' ? matches
    : matches.filter(m => m.matchType === filter);

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      {/* Back */}
      <button
        className="btn btn-ghost"
        style={{ marginBottom: 24, fontSize: 12 }}
        onClick={() => onNavigate('dashboard')}
      >
        ← Back to Dashboard
      </button>

      {/* Hero */}
      <div className="card animate-up" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: 38, flexShrink: 0 }}>
            {avatar
              ? <img src={avatar} alt={targetID} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : '♟'}
          </div>
          <div style={{ flex: 1 }}>
            <div className="section-label">{currentMonth}</div>
            <h1 className="page-title" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
              {rank && <span style={{ color: 'var(--gold)', marginRight: 10 }}>{RANK_PIECES[Math.min(rank-1,5)]}</span>}
              {targetID}
              {isOwnProfile && (
                <span style={{ marginLeft: 12, fontSize: 14, color: 'var(--green-bright)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                  (you)
                </span>
              )}
            </h1>
            {profile?.name && (
              <p style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {profile.name}
              </p>
            )}
          </div>
          {rank && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, color: rank <= 3 ? ['var(--gold)','#b0bec5','#a1887f'][rank-1] : 'var(--white)', lineHeight: 1 }}>
                #{rank}
              </div>
              <div className="section-label">Rank</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 animate-up-delay-1" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="stat-value accent">{profile?.totalPoints ?? 0}</div>
          <div className="stat-key">Total Points</div>
        </div>
        <div className="card">
          <div className="stat-value">{matches.length}<span style={{ fontSize: 14, color: 'var(--white-dim)', fontWeight: 400 }}>/20</span></div>
          <div className="stat-key">Matches Played</div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${(matches.length/20)*100}%` }} />
          </div>
        </div>
        <div className="card">
          <div className="stat-value" style={{ color: 'var(--green-accent)' }}>{wins.length}</div>
          <div className="stat-key">Wins</div>
        </div>
        <div className="card">
          <div className="stat-value">{winRate}<span style={{ fontSize: 18, fontWeight: 400 }}>%</span></div>
          <div className="stat-key">Win Rate</div>
        </div>
      </div>

      {/* Match history with filter */}
      <div className="card animate-up-delay-2">
        <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: 12 }}>
          <p className="section-label">Match History</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all','rapid','daily'].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 14px', fontSize: 11 }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--white-dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>♟</div>
            <p>No {filter !== 'all' ? filter : ''} matches yet.</p>
          </div>
        ) : (
          filtered.map(m => {
            const isWin = m.winnerChessID === targetID;
            const opponent = isWin ? m.loserChessID : m.winnerChessID;
            const date = new Date(m.date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            return (
              <div key={m._id} className="match-item">
                <div className={`match-result-icon ${isWin ? 'win' : 'loss'}`}>
                  {isWin ? '✓' : '✗'}
                </div>
                <div className="match-details">
                  <div className="match-vs">
                    {isWin ? 'Beat' : 'Lost to'} <strong>{opponent}</strong>
                  </div>
                  <div className="match-meta">
                    <span className={`badge badge-${m.matchType}`} style={{ marginRight: 6 }}>
                      {m.matchType}
                    </span>
                    {date}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: isWin ? 'var(--green-accent)' : 'var(--white-dim)',
                }}>
                  {isWin ? `+${m.pointsAwarded}` : '—'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
