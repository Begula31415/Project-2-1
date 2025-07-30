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
        // Navigate to search results page with query parameters
        const category = searchType.toLowerCase() === 'all' ? 'all' : 
                        searchType.toLowerCase() === 'titles' ? 'titles' : 
                        searchType.toLowerCase() === 'celebs' ? 'celebs' : 'all';
        navigate(`/search?q=${encodeURIComponent(searchTerm)}&category=${category}`);
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

  const handleUserButtonClick = () => {  
    if (!isAuthenticated) {  
      onSignIn();  
    } else {  
      console.log('Current User:', currentUser);  
      const userRole = currentUser?.role;  
        
      if (userRole === 'admin') {  
        console.log('Navigating to admin dashboard');  
        navigate('/admin-dashboard');  
      } else {  
        console.log('Navigating to user dashboard');  
        navigate('/dashboard');  
      }  
    }  
  }; 

  const navigateToTop50 = () => {
    navigate('/top-50');
  };

  const navigateToBrowseByGenre = () => {
    navigate('/advanced-search');
  };

  const navigateToAwards = () => {
    navigate('/awards');
  };

  const searchOptions = [
    { value: 'All', label: 'All' },
    { value: 'Titles', label: 'Titles' },
    { value: 'Celebs', label: 'Celebs' },
    { value: 'Advanced search', label: 'Advanced search' }
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
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); navigateToTop50(); }}>Top 50</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); navigateToBrowseByGenre(); }}>Browse by Genre</a>
            <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); navigateToAwards(); }}>Awards</a>
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
                    <span className="option-label">{option.label}</span>
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
                  navigate('/user-dashboard');
                }
              }
            }}
          >
            {isAuthenticated ? (currentUser?.name || currentUser?.username) : 'Sign In'}
          </button>
          
          {isAuthenticated && (
            <button
              className="signin-btn signout-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  onSignOut();
                }
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
