import React from 'react';

const Navbar = ({ currentPage = '', user = null, onNavigate = () => {}, onLogout = () => {} }) => {
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>
        <span className="logo-piece">♟</span>
        <span className="logo-text">Chess<span>Arena</span></span>
      </a>

      <ul className="navbar-nav">
        {user ? (
          <>
            <li>
              <a
                href="#"
                className={currentPage === 'dashboard' ? 'active' : ''}
                onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className={currentPage === 'leaderboard' ? 'active' : ''}
                onClick={e => { e.preventDefault(); onNavigate('leaderboard'); }}
              >
                Leaderboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className={currentPage === 'register' ? 'active' : ''}
                onClick={e => { e.preventDefault(); onNavigate('register'); }}
              >
                + Match
              </a>
            </li>
            <li>
              <a
                href="#"
                className={currentPage === 'profile' ? 'active' : ''}
                onClick={e => { e.preventDefault(); onNavigate('profile'); }}
              >
                {user.chessID}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="btn-nav-auth"
                onClick={e => { e.preventDefault(); onLogout(); }}
              >
                Logout
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a
                href="#"
                className={currentPage === 'login' ? 'active' : ''}
                onClick={e => { e.preventDefault(); onNavigate('login'); }}
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="#"
                className="btn-nav-auth"
                onClick={e => { e.preventDefault(); onNavigate('signup'); }}
              >
                Sign Up
              </a>
            </li>
          </>
        )}
      </ul>

      {/* Hidden admin link - nearly invisible, only you know it's there */}
      <a
        href="#"
        style={{ fontSize: 10, color: 'rgba(158,176,158,0.15)', marginLeft: 8, textDecoration: 'none' }}
        onClick={e => { e.preventDefault(); onNavigate('admin'); }}
        title=""
      >
        ♛
      </a>
    </nav>
  );
};

export default Navbar;
