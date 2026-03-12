import React, { useState, useEffect } from 'react';
import './styles/chessTheme.css';

import Navbar        from './components/Navbar.jsx';
import Login         from './pages/Login.jsx';
import Signup        from './pages/Signup.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Leaderboard   from './pages/Leaderboard.jsx';
import RegisterMatch from './pages/RegisterMatch.jsx';
import PlayerProfile from './pages/PlayerProfile.jsx';
import AdminPanel    from './pages/AdminPanel.jsx';

function App() {
  const [page, setPage]               = useState('login');
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setPage(parsedUser.isAdmin ? 'admin' : 'dashboard'); // Admins go to admin panel
      } catch (_) {
        localStorage.clear();
      }
    }
  }, []);

  const handleLoginSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setPage(userData.isAdmin ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setPage('login');
  };

  // Navigate with optional payload (e.g., profile chessID)
  const navigate = (dest, payload = null) => {
    setProfileTarget(null);
    if (dest === 'profile' && payload) setProfileTarget(payload);
    // Redirect to login if not authenticated
    if (!user && !['login','signup'].includes(dest)) {
      setPage('login');
      return;
    }
    setPage(dest);
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
      case 'signup':
        return <Signup onSignupSuccess={handleLoginSuccess} onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard user={user} token={token} onNavigate={navigate} />;
      case 'leaderboard':
        return <Leaderboard user={user} token={token} onNavigate={navigate} />;
      case 'register':
        return <RegisterMatch user={user} token={token} onNavigate={navigate} />;
      case 'profile':
        return <PlayerProfile user={user} token={token} profileChessID={profileTarget} onNavigate={navigate} />;
      case 'admin':
        // Only allow access if user is admin
        if (user?.isAdmin) {
          return <AdminPanel onNavigate={navigate} />;
        } else {
          return <Dashboard user={user} token={token} onNavigate={navigate} />;
        }
      default:
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }
  };

  const showNav = !['login','signup'].includes(page);

  return (
    <div className="app-wrapper">
      {showNav && (
        <Navbar
          currentPage={page}
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;