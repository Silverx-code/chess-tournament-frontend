import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];

const medalClass = rank => {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
};

const PlayerAvatar = ({ chessID }) => {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.chess.com/pub/player/${chessID}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.avatar) setAvatar(d.avatar); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [chessID]);

  return (
    <div className="avatar">
      {avatar
        ? <img src={avatar} alt={chessID} />
        : <span style={{ fontSize: 18 }}>♟</span>}
    </div>
  );
};

const Leaderboard = ({ user, token, onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlayers(data);
        setLastUpdated(new Date());
      }
    } catch (_) {}
    setLoading(false);
  }, [token]);

  // Initial fetch + poll every 10 seconds
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const myRank = players.findIndex(p => p.chessID === user?.chessID) + 1;

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      {/* Header */}
      <div className="flex-between mb-6 animate-up" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="section-label">{currentMonth}</p>
          <h1 className="page-title">
            <span className="accent">Leaderboard</span>
          </h1>
          {lastUpdated && (
            <p style={{ fontSize: 11, color: 'var(--white-dim)', marginTop: 4 }}>
              Live · refreshes every 10s · last update {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        {myRank > 0 && (
          <div className="card" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--green-accent)' }}>
              {RANK_PIECES[Math.min(myRank - 1, 5)]} #{myRank}
            </div>
            <div className="section-label" style={{ marginTop: 4 }}>Your Rank</div>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {!loading && players.length >= 3 && (
        <div className="animate-up-delay-1" style={{ marginBottom: 32 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr 1fr',
            gap: 16,
            alignItems: 'end',
          }}>
            {/* 2nd */}
            <PodiumCard player={players[1]} rank={2} token={token} onNavigate={onNavigate} />
            {/* 1st */}
            <PodiumCard player={players[0]} rank={1} token={token} onNavigate={onNavigate} highlight />
            {/* 3rd */}
            <PodiumCard player={players[2]} rank={3} token={token} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card animate-up-delay-2" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        ) : players.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--white-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>♟</div>
            <p>No players yet. Be the first to register!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Player</th>
                  <th>Points</th>
                  <th>Matches</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  const rank = i + 1;
                  const isMe = player.chessID === user?.chessID;
                  const remaining = 20 - player.matchesPlayed;
                  return (
                    <tr
                      key={player.chessID}
                      style={isMe ? { background: 'rgba(46,125,50,0.08)' } : {}}
                    >
                      <td>
                        <span className={`${medalClass(rank)}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                          {RANK_PIECES[Math.min(rank - 1, 5)]} {rank}
                        </span>
                      </td>
                      <td>
                        <div className="flex-center gap-3">
                          <PlayerAvatar chessID={player.chessID} />
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {player.chessID}
                              {isMe && (
                                <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(76,175,80,0.15)', color: 'var(--green-bright)', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--white-dim)' }}>{player.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${rank <= 3 ? medalClass(rank) : 'text-accent'}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                          {player.totalPoints}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--white-dim)', marginLeft: 4 }}>pts</span>
                      </td>
                      <td>{player.matchesPlayed}</td>
                      <td>
                        <span style={{ color: remaining <= 3 ? '#ef5350' : 'var(--white-dim)', fontSize: 13 }}>
                          {remaining > 0 ? `${remaining} left` : <span style={{ color: '#ef5350' }}>Maxed</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--white-dim)', textAlign: 'right' }}>
        Point system: Rapid = 1pt · Daily (3-day) = 3pts · Max 20 matches/month
      </div>
    </div>
  );
};

const PodiumCard = ({ player, rank, highlight, onNavigate }) => {
  const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const colors = { 1: 'var(--gold)', 2: '#b0bec5', 3: '#a1887f' };

  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '24px 16px',
        border: highlight ? `1px solid ${colors[rank]}` : undefined,
        boxShadow: highlight ? `0 0 24px rgba(212,168,67,0.15)` : undefined,
        cursor: 'pointer',
      }}
      onClick={() => onNavigate('profile', player.chessID)}
    >
      <div style={{ fontSize: 32, marginBottom: 8, color: colors[rank] }}>
        {RANK_PIECES[rank - 1]}
      </div>
      <div className="avatar" style={{ margin: '0 auto 10px', width: 48, height: 48 }}>
        <PlayerAvatarInline chessID={player.chessID} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{player.chessID}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: colors[rank] }}>
        {player.totalPoints}
      </div>
      <div style={{ fontSize: 11, color: 'var(--white-dim)' }}>points</div>
    </div>
  );
};

const PlayerAvatarInline = ({ chessID }) => {
  const [avatar, setAvatar] = useState(null);
  useEffect(() => {
    fetch(`https://api.chess.com/pub/player/${chessID}`)
      .then(r => r.json())
      .then(d => { if (d.avatar) setAvatar(d.avatar); })
      .catch(() => {});
  }, [chessID]);
  return avatar
    ? <img src={avatar} alt={chessID} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    : <span style={{ fontSize: 22 }}>♟</span>;
};

export default Leaderboard;
