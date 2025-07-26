import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ currentUser, isAuthenticated, onSignIn, onSignOut }) => {
  const navigate = useNavigate();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('All');
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);
  const toggleSearchDropdown = () => setShowSearchDropdown(!showSearchDropdown);

  const performSearch = () => {
    if (searchTerm.trim()) {
      if (searchType === 'Advanced search') {
        navigate('/advanced-search');
      } else {
        alert(`Searching for: "${searchTerm}" in ${searchType}`);
      }
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') performSearch();
  };

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setShowSearchDropdown(false);
    if (type === 'Advanced search') {
      navigate('/advanced-search');
    }
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

  const searchOptions = [
    { value: 'All', label: '🔍 All', icon: '🔍'},
    { value: 'Titles', label: '📺 Titles', icon: '📺' },
    { value: 'TV episodes', label: '📺 TV episodes', icon: '📺' },
    { value: 'Celebs', label: '👥 Celebs', icon: '👥' },
    { value: 'Companies', label: '🏢 Companies', icon: '🏢' },
    { value: 'Keywords', label: '🔤 Keywords', icon: '🔤' },
    { value: 'Advanced search', label: '🔍 Advanced search', icon: '🔍' }
  ];

  return (
    <header className="header">
      <div className="nav-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
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

        <div className="search-container" ref={searchRef}>
          <div className="search-dropdown-container">
            <button className="search-dropdown-btn" onClick={toggleSearchDropdown}>
              <span className="search-type-icon">
                {searchOptions.find(opt => opt.value === searchType)?.icon || '🔍'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showSearchDropdown && (
              <div className="search-dropdown">
                {searchOptions.map(option => (
                  <div
                    key={option.value}
                    className={`search-option ${searchType === option.value ? 'active' : ''}`}
                    onClick={() => handleSearchTypeSelect(option.value)}
                  >
                    <span className="option-icon">{option.icon}</span>
                    <span className="option-label">{option.label.replace(/^.+ /, '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            className="search-bar"
            placeholder={searchType === 'Advanced search' ? 'Click to open Advanced Search' : `Search for ${searchType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            onFocus={() => searchType === 'Advanced search' && navigate('/advanced-search')}
            readOnly={searchType === 'Advanced search'}
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
