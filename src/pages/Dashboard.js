import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

// ─── Piece icons by rank ───────────────────────────────────────────────
const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];
const rankPiece = rank => RANK_PIECES[Math.min(rank - 1, 5)] || '♙';

// ─── Poll Component ────────────────────────────────────────────────────
const Poll = ({ token }) => {
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/poll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPoll(data);
      setVoted(data.userVoted || false);
    } catch (_) {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchPoll(); }, [fetchPoll]);

  const handleVote = async option => {
    if (voted) return;
    try {
      await fetch(`${API_BASE_URL}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ option }),
      });
      setVoted(true);
      fetchPoll();
    } catch (_) {}
  };

  if (loading) return <div className="text-muted" style={{ fontSize: 13 }}>Loading poll…</div>;
  if (!poll) return null;

  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <div>
      <p className="section-label mb-4">Monthly Poll</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16, fontWeight: 700 }}>
        Who will win this month's tournament?
      </p>
      {poll.options.map(opt => {
        const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
        return (
          <div
            key={opt.option}
            className={`poll-option${voted ? ' voted' : ''}`}
            style={{ '--fill': `${pct}%` }}
            onClick={() => !voted && handleVote(opt.option)}
          >
            <span style={{ fontSize: 16, minWidth: 20 }}>
              {rankPiece(poll.options.indexOf(opt) + 1)}
            </span>
            <span className="poll-option-name">{opt.option}</span>
            {voted && <span className="poll-option-pct">{pct}%</span>}
          </div>
        );
      })}
      {voted && (
        <p style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 8 }}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
        </p>
      )}
      {!voted && (
        <p style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 8 }}>
          Click a player to cast your vote
        </p>
      )}
    </div>
  );
};

// ─── Match History Item ────────────────────────────────────────────────
const MatchItem = ({ match, currentChessID }) => {
  const isWin = match.winnerChessID === currentChessID;
  const opponent = isWin ? match.loserChessID : match.winnerChessID;
  const date = new Date(match.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });

  return (
    <div className="match-item">
      <div className={`match-result-icon ${isWin ? 'win' : 'loss'}`}>
        {isWin ? '✓' : '✗'}
      </div>
      <div className="match-details">
        <div className="match-vs">
          {isWin ? 'Beat' : 'Lost to'} <strong>{opponent}</strong>
        </div>
        <div className="match-meta">
          <span className={`badge badge-${match.matchType}`} style={{ marginRight: 6 }}>
            {match.matchType}
          </span>
          {date}
        </div>
      </div>
      <div className={`match-points${isWin ? '' : ' text-muted'}`} style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, color: isWin ? 'var(--green-accent)' : 'var(--white-dim)' }}>
        {isWin ? `+${match.pointsAwarded}` : '—'}
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────
const Dashboard = ({ user, token, onNavigate }) => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [rank, setRank] = useState(null);
  const [chessAvatar, setChessAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  const MATCH_LIMIT = 20;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch player profile & rank from leaderboard
        const [lbRes, matchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/matches?chessID=${user.chessID}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const lb = await lbRes.json();
        const matchData = await matchRes.json();

        const me = lb.find(p => p.chessID === user.chessID);
        if (me) {
          setProfile(me);
          setRank(lb.indexOf(me) + 1);
        }
        setMatches(Array.isArray(matchData) ? matchData : []);

        // Fetch Chess.com avatar
        try {
          const avatarRes = await fetch(`https://api.chess.com/pub/player/${user.chessID}`);
          const avatarData = await avatarRes.json();
          if (avatarData.avatar) setChessAvatar(avatarData.avatar);
        } catch (_) {}

      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, [user, token]);

  const matchesLeft = MATCH_LIMIT - (profile?.matchesPlayed || 0);
  const progressPct = ((profile?.matchesPlayed || 0) / MATCH_LIMIT) * 100;

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      {/* Header */}
      <div className="flex-between mb-6 animate-up" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="section-label">{currentMonth} Tournament</p>
          <h1 className="page-title">
            Welcome back, <span className="accent">{user.chessID}</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={() => onNavigate('register')}>
            + Register Match
          </button>
          <button className="btn btn-ghost" onClick={() => onNavigate('leaderboard')}>
            View Leaderboard
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4 animate-up-delay-1" style={{ marginBottom: 28 }}>
        <div className="card flex-center gap-3">
          <div className="avatar" style={{ width: 44, height: 44 }}>
            {chessAvatar
              ? <img src={chessAvatar} alt={user.chessID} />
              : <span style={{ fontSize: 22 }}>♟</span>}
          </div>
          <div className="stat-block">
            <div className="stat-value" style={{ fontSize: 20 }}>{user.chessID}</div>
            <div className="stat-key">Your ID</div>
          </div>
        </div>

        <div className="card">
          <div className="stat-block">
            <div className="stat-value accent">{profile?.totalPoints ?? 0}</div>
            <div className="stat-key">Total Points</div>
          </div>
        </div>

        <div className="card">
          <div className="stat-block">
            <div className="stat-value">
              {rank ? <>{rankPiece(rank)} #{rank}</> : '—'}
            </div>
            <div className="stat-key">Current Rank</div>
          </div>
        </div>

        <div className="card">
          <div className="stat-block">
            <div className="stat-value">{profile?.matchesPlayed ?? 0}<span style={{ fontSize: 16, color: 'var(--white-dim)', fontWeight: 400 }}>/{MATCH_LIMIT}</span></div>
            <div className="stat-key">Matches Played</div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ fontSize: 11, color: matchesLeft <= 3 ? '#ef5350' : 'var(--white-dim)', marginTop: 6 }}>
            {matchesLeft > 0 ? `${matchesLeft} remaining` : 'Monthly limit reached'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid-2 animate-up-delay-2">
        {/* Match History */}
        <div className="card">
          <div className="flex-between mb-6">
            <p className="section-label">Match History</p>
            <span style={{ fontSize: 12, color: 'var(--white-dim)' }}>
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--white-dim)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>♟</div>
              <p>No matches yet this month.</p>
              <button
                className="btn btn-ghost mt-4"
                style={{ fontSize: 12 }}
                onClick={() => onNavigate('register')}
              >
                Register your first match
              </button>
            </div>
          ) : (
            <div>
              {matches.slice(0, 8).map(m => (
                <MatchItem key={m._id} match={m} currentChessID={user.chessID} />
              ))}
              {matches.length > 8 && (
                <button
                  className="btn btn-ghost btn-full mt-4"
                  style={{ fontSize: 12 }}
                  onClick={() => onNavigate('profile')}
                >
                  View all {matches.length} matches →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Poll */}
        <div className="card">
          <Poll token={token} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
