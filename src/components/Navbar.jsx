import React from 'react';

const Navbar = ({ currentPage = '', user = null, onNavigate = () => {}, onLogout = () => {} }) => {
  const navTo = page => e => { e.preventDefault(); onNavigate(page); };

  return (
    <nav className="navbar" role="navigation">
      <a className="navbar-brand" href="#" onClick={navTo('dashboard')}>
        <span className="logo-piece">♟</span>
        <span className="logo-text">Chess<span>Arena</span></span>
      </a>

      <ul className="navbar-nav">
        {user ? (
          <>
            <li><a href="#" className={currentPage==='dashboard'?'active':''} onClick={navTo('dashboard')} aria-current={currentPage==='dashboard'?'page':undefined}>Dashboard</a></li>
            <li><a href="#" className={currentPage==='leaderboard'?'active':''} onClick={navTo('leaderboard')} aria-current={currentPage==='leaderboard'?'page':undefined}>Leaderboard</a></li>
            <li><a href="#" className={currentPage==='register'?'active':''} onClick={navTo('register')} aria-current={currentPage==='register'?'page':undefined}>+ Match</a></li>
            <li><a href="#" className={currentPage==='profile'?'active':''} onClick={navTo('profile')} aria-current={currentPage==='profile'?'page':undefined}>{user.chessID}</a></li>
            <li><button className="btn-nav-auth" onClick={onLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><a href="#" className={currentPage==='login'?'active':''} onClick={navTo('login')} aria-current={currentPage==='login'?'page':undefined}>Logins</a></li>
            <li><a href="#" className="btn-nav-auth" onClick={navTo('signup')}>Sign Up</a></li>
          </>
        )}
      </ul>

      {/* Hidden admin link - only visible to admins */}
      {user?.isAdmin && (
        <a href="#" className="admin-hidden-link" onClick={navTo('admin')} aria-label="Admin Panel" title="Admin Panel">♛</a>
      )}
    </nav>
  );
};

export default Navbar;