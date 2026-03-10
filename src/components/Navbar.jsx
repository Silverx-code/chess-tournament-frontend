import React from 'react';

// currentPage: 'dashboard' | 'leaderboard' | 'register' | 'profile' | 'login' | 'signup'
// user: { chessID, name } | null
// onLogout: fn
const Navbar = ({ currentPage = '', user = null, onNavigate = () => {}, onLogout = () => {} }) => {
  const pieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];

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
              <a href="#" className="btn-nav-auth" onClick={e => { e.preventDefault(); onLogout(); }}>
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
    </nav>
  );
};

export default Navbar;
