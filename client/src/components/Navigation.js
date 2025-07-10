import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const Navigation = ({ currentUser, isAuthenticated, onSignIn, onSignOut }) => {
  const navigate = useNavigate();
  
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);

  const performSearch = () => {
    if (searchTerm.trim()) {
      alert(`Searching for: "${searchTerm}"`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') performSearch();
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      if (window.confirm('Sign out?')) {
        onSignOut();
      }
    } else {
      onSignIn();
    }
  };

  const checkAuthAndAddToWatchlist = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add movies to your watchlist');
      onSignIn();
    } else {
      alert('Watchlist feature - you are signed in!');
    }
  };

  return (
    <header className="header">
      <div className="nav-container">
        <a href="#" className="logo" onClick={(e) => e.preventDefault()}>
          FilmFusion
        </a>

        <div className="hamburger-container" ref={menuRef}>
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="menu-text">Menu</span>
          <div className={`menu-dropdown ${showMenu ? 'show' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Movies</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>TV Shows</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Documentaries</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Top Rated</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Most Viewed</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Upcoming</a>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search for movies, TV shows, documentaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="search-btn" onClick={performSearch}>🔍</button>
        </div>

        <div className="nav-actions">
          <button className="watchlist-btn" onClick={checkAuthAndAddToWatchlist}>
            ⭐ Watchlist
          </button>
          {/* <button className="signin-btn" onClick={handleSignInClick}>
            {isAuthenticated ? (currentUser?.name || currentUser?.username) : 'Sign In'}
          </button> */}
          <button
  className="signin-btn"
  onClick={() => {
    if (!isAuthenticated) {
      onSignIn();
    } else {
      const role = currentUser?.role || 'user'; // Default to 'user' if role not set
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }}
>
  {isAuthenticated ? (currentUser?.name || currentUser?.username) : 'Sign In'}
</button>



        </div>
      </div>
    </header>
  );
};

export default Navigation;
