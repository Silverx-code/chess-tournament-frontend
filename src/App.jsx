import React, { useState, useEffect } from 'react';
import './styles/chessTheme.css';

import Navbar        from './components/Navbar.jsx';
import Login         from './pages/Login.jsx';
import Signup        from './pages/Signup.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Leaderboard   from './pages/Leaderboard.jsx';
import League        from './pages/League.jsx';
import RegisterMatch from './pages/RegisterMatch.jsx';
import PlayerProfile from './pages/PlayerProfile.jsx';
import AdminPanel    from './pages/AdminPanel.jsx';

function App() {
  const [page, setPage]               = useState('login');
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setPage('dashboard');
      } catch { localStorage.clear(); }
    }
  }, []);

  const handleLoginSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setPage('login');
  };

  const navigate = (dest, payload = null) => {
    setProfileTarget(null);
    if (dest === 'profile' && payload) setProfileTarget(payload);
    if (dest === 'admin') { setPage('admin'); return; }
    if (!user && !['login', 'signup'].includes(dest)) { setPage('login'); return; }
    setPage(dest);
  };

  const renderPage = () => {
    switch (page) {
      case 'login':    return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
      case 'signup':   return <Signup onSignupSuccess={handleLoginSuccess} onNavigate={navigate} />;
      case 'dashboard':return <Dashboard user={user} token={token} onNavigate={navigate} />;
      case 'leaderboard': return <Leaderboard user={user} token={token} onNavigate={navigate} />;
      case 'league':   return <League user={user} token={token} onNavigate={navigate} />;
      case 'register': return <RegisterMatch user={user} token={token} onNavigate={navigate} />;
      case 'profile':  return <PlayerProfile user={user} token={token} profileChessID={profileTarget} onNavigate={navigate} />;
      case 'admin':    return <AdminPanel onNavigate={navigate} />;
      default:         return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }
  };

  const showNavbar = !['login', 'signup', 'admin'].includes(page);

  return (
    <div className="app-wrapper">
      {showNavbar && (
        <Navbar currentPage={page} user={user} onNavigate={navigate} onLogout={handleLogout} />
      )}
      {renderPage()}
    </div>
  );
}

export default App;
