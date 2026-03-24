import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config.jsx';

const RANK_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];

const League = ({ user, token, onNavigate }) => {
  const [players, setPlayers]   = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [tab, setTab]           = useState('standings');
  const [loading, setLoading]   = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [lbRes, fixRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/fixtures`,    { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const lbData  = await lbRes.json();
      const fixData = await fixRes.json();
      if (Array.isArray(lbData))  setPlayers(lbData);
      if (Array.isArray(fixData)) setFixtures(fixData);
    } catch (_) {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Group fixtures by date
  const fixturesByDate = fixtures.reduce((acc, f) => {
    const dateKey = new Date(f.scheduledDate).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(f);
    return acc;
  }, {});

  const myFixtures = fixtures.filter(
    f => f.player1ChessID === user.chessID || f.player2ChessID === user.chessID
  );

  const myRank = players.findIndex(p => p.chessID === user.chessID) + 1;

  const statusColor = status => ({
    scheduled:  { color: '#64b5f6', bg: 'rgba(100,181,246,0.1)',  border: 'rgba(100,181,246,0.3)'  },
    completed:  { color: 'var(--green-bright)', bg: 'rgba(76,175,80,0.1)', border: 'rgba(76,175,80,0.3)' },
    postponed:  { color: '#ff9800', bg: 'rgba(255,152,0,0.1)',    border: 'rgba(255,152,0,0.3)'    },
  }[status] || {});

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      {/* Header */}
      <div className="flex-between mb-6 animate-up" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="section-label">March 2026 · 16 Matches · Mar 20–31</p>
          <h1 className="page-title">♟ <span className="accent">League</span></h1>
        </div>
        <div className="flex gap-3">
          {myRank > 0 && (
            <div className="card" style={{ padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--green-accent)' }}>
                {RANK_PIECES[Math.min(myRank - 1, 5)]} #{myRank}
              </div>
              <div className="section-label" style={{ marginTop: 4 }}>Your Rank</div>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => onNavigate('register')}>+ Register Match</button>
        </div>
      </div>

      {/* Point system info */}
      <div className="grid-3 animate-up-delay-1" style={{ marginBottom: 28 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏆</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--green-accent)' }}>3</div>
          <div className="stat-key">Points for Win</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>1</div>
          <div className="stat-key">Points for Draw</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>💀</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--white-dim)' }}>0</div>
          <div className="stat-key">Points for Loss</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 animate-up-delay-2" style={{ marginBottom: 20 }}>
        {[
          { key: 'standings', label: '🏆 Standings' },
          { key: 'fixtures',  label: '📅 All Fixtures' },
          { key: 'mine',      label: '♟ My Fixtures' },
        ].map(t => (
          <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12 }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
        <button className="btn btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={fetchAll}>↻ Refresh</button>
      </div>

      {/* Standings Table */}
      {tab === 'standings' && (
        <div className="card animate-up-delay-2" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th title="Matches Played">MP</th>
                    <th title="Wins">W</th>
                    <th title="Draws">D</th>
                    <th title="Losses">L</th>
                    <th title="Points">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    const rank   = i + 1;
                    const isMe   = p.chessID === user.chessID;
                    const medals = { 1: 'var(--gold)', 2: '#b0bec5', 3: '#a1887f' };
                    return (
                      <tr key={p.chessID} style={isMe ? { background: 'rgba(46,125,50,0.08)' } : {}}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: medals[rank] || 'var(--white-dim)' }}>
                            {RANK_PIECES[Math.min(rank - 1, 5)]} {rank}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {p.chessID}
                            {isMe && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(76,175,80,0.15)', color: 'var(--green-bright)', padding: '2px 8px', borderRadius: 20 }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--white-dim)' }}>{p.name}</div>
                        </td>
                        <td style={{ color: 'var(--white-dim)' }}>{p.matchesPlayed || 0}</td>
                        <td style={{ color: 'var(--green-bright)', fontWeight: 600 }}>{p.wins || 0}</td>
                        <td style={{ color: 'var(--gold)' }}>{p.draws || 0}</td>
                        <td style={{ color: '#ef5350' }}>{p.losses || 0}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: medals[rank] || 'var(--green-accent)' }}>
                            {p.totalPoints}
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
      )}

      {/* All Fixtures */}
      {tab === 'fixtures' && (
        <div className="animate-up-delay-2">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : Object.keys(fixturesByDate).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--white-dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <p>No fixtures scheduled yet. Check back soon.</p>
            </div>
          ) : (
            Object.entries(fixturesByDate).map(([date, dayFixtures]) => (
              <div key={date} style={{ marginBottom: 24 }}>
                <div className="flex-center gap-3" style={{ marginBottom: 12 }}>
                  <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 12, color: 'var(--green-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {date}
                  </span>
                  <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dayFixtures.map(f => {
                    const sc = statusColor(f.status);
                    const isMyMatch = f.player1ChessID === user.chessID || f.player2ChessID === user.chessID;
                    return (
                      <div key={f._id} className="card" style={{
                        padding: '14px 20px',
                        border: isMyMatch ? '1px solid rgba(76,175,80,0.4)' : undefined,
                        background: isMyMatch ? 'rgba(46,125,50,0.06)' : undefined,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{f.player1ChessID}</span>
                          <span style={{ color: 'var(--white-dim)', fontSize: 13, fontStyle: 'italic' }}>vs</span>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{f.player2ChessID}</span>
                          {f.round && (
                            <span style={{ fontSize: 11, color: 'var(--white-dim)', marginLeft: 4 }}>Round {f.round}</span>
                          )}
                          <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, fontSize: 11, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>
                            {f.status}
                          </span>
                          {isMyMatch && f.status === 'scheduled' && (
                            <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}
                              onClick={() => onNavigate('register')}>
                              Register Result
                            </button>
                          )}
                        </div>
                        {f.notes && <div style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 8 }}>{f.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Fixtures */}
      {tab === 'mine' && (
        <div className="animate-up-delay-2">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : myFixtures.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--white-dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>♟</div>
              <p>You have no fixtures scheduled yet.</p>
            </div>
          ) : (
            myFixtures.map(f => {
              const opponent = f.player1ChessID === user.chessID ? f.player2ChessID : f.player1ChessID;
              const sc = statusColor(f.status);
              const date = new Date(f.scheduledDate).toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long',
              });
              return (
                <div key={f._id} className="card" style={{ marginBottom: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>
                        You vs <span style={{ color: 'var(--green-accent)' }}>{opponent}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 3 }}>
                        📅 {date} · Round {f.round}
                      </div>
                      {f.notes && <div style={{ fontSize: 12, color: 'var(--white-dim)', marginTop: 3 }}>{f.notes}</div>}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>
                        {f.status}
                      </span>
                      {f.status === 'scheduled' && (
                        <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 12 }}
                          onClick={() => onNavigate('register')}>
                          Register Result
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default League;
