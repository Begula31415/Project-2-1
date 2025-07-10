import React, { useState, useEffect } from 'react';
import { getWatchlist, removeFromWatchlist, getUserDetails, updateProfile } from '../services/api';

const UserDashboard = ({ currentUser, isAuthenticated = true }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  });

  const mockCurrentUser = currentUser || { user_id: 'mock-user-123' };

  useEffect(() => {
    if (!isAuthenticated || !mockCurrentUser) return;

    const fetchData = async () => {
      try {
        const details = await getUserDetails(mockCurrentUser.user_id);
        setUserDetails({
          username: details.username,
          official_mail: details.official_mail,
          bio: details.bio,
          avatar: details.username ? details.username.charAt(0).toUpperCase() : '?',
          isOnline: true,
          accountStatus: 'Premium',
          memberSince: 'March 2023',
          totalMoviesWatched: details.total_watched || 89,
          favoriteGenre: details.favorite_genre || 'Sci-Fi'
        });

        setFormData({
          username: details.username,
          email: details.official_mail,
          bio: details.bio
        });

        const list = await getWatchlist(mockCurrentUser.user_id);
        setWatchlist(list.map(movie => ({
          ...movie,
          year: movie.release_year,
          dateAdded: movie.added_date
        })));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [mockCurrentUser, isAuthenticated]);

  const handleRemove = async (movieId, e) => {
    e.stopPropagation();
    try {
      await removeFromWatchlist(mockCurrentUser.user_id, movieId);
      setWatchlist(prevList => prevList.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error('Error removing movie:', err);
      alert('Failed to remove movie. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(mockCurrentUser.user_id, formData);
      setEditing(false);
      setUserDetails(prev => ({
        ...prev,
        username: formData.username,
        official_mail: formData.email,
        bio: formData.bio,
        avatar: formData.username ? formData.username.charAt(0).toUpperCase() : prev.avatar
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleMovieClick = (movie) => {
    alert(`Opening ${movie.title} (${movie.year})`);
  };

  if (!userDetails) {
    return (
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #333',
            borderTop: '3px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#9ca3af' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const UserWaterBackground = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      opacity: 0.7,
      pointerEvents: 'none',
      borderRadius: '12px',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(160deg, #1a1a1a 0%, #2b2b2b 50%, #3c3c3c 100%)',
        opacity: 0.9,
      }} />
      <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.15 }} />
            <stop offset="70%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
            <stop offset="100%" style={{ stopColor: '#1a1a1a', stopOpacity: 0 }} />
          </radialGradient>
          <filter id="subtleBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Pulsing Glow */}
        <circle cx="50%" cy="50%" r="35%" fill="url(#userGlow)">
          <animate attributeName="r" dur="8s" values="35%;45%;35%" repeatCount="indefinite" />
          <animate attributeName="opacity" dur="8s" values="1;0.6;1" repeatCount="indefinite" />
        </circle>

        {/* Drifting Particles */}
        <g fill="#3b82f6" opacity="0.5" filter="url(#subtleBlur)">
          <circle cx="100" cy="200" r="2">
            <animateMotion path="M0,0 C50,50 -50,50 0,0 Z" dur="15s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="150" r="3">
            <animateMotion path="M0,0 C-50,-50 50,-50 0,0 Z" dur="12s" repeatCount="indefinite" />
          </circle>
           <circle cx="200" cy="300" r="1.5">
            <animateMotion path="M0,0 C0,80 80,80 80,0 C80,-80 0,-80 0,0 Z" dur="20s" repeatCount="indefinite" />
          </circle>
           <circle cx="600" cy="250" r="2.5">
            <animateMotion path="M0,0 C-80,20 80,20 0,0 Z" dur="18s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );

  return (

    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '2rem'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
  
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#fbbf24',
            margin: 0
          }}>
            FilmFusion
          </h1>
        </div>

        {/* User Profile Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid #333',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <UserWaterBackground />
          <div style={{
            display: 'flex',
            alignItems: editing ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}>
          {/* Left Side - User Info */}
          <div style={{
            display: 'flex',
            alignItems: editing ? 'flex-start' : 'center',
            flex: 1
          }}>
            <div style={{
              position: 'relative',
              marginRight: '1.5rem',
              flexShrink: 0
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {userDetails.avatar}
              </div>
              {userDetails.isOnline && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '3px solid #1a1a1a'
                }}></div>
              )}
            </div>
            
            {editing ? (
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  />
                  
                {/* </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Birthdate
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. United States"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  /> */}
                
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '0.75rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.75rem',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                  {userDetails.username}
                </h2>
                <p style={{
                  margin: '0 0 0.75rem 0',
                  color: '#fbbf24',
                  fontSize: '0.95rem'
                }}>
                  {userDetails.official_mail||'Got no email till now'}
                </p>
                <p style={{
                  margin: 0,
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  fontStyle: !userDetails.bio ? 'italic' : 'normal'
                }}>
                  {userDetails.bio||'Add bio'}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexShrink: 0
          }}>
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#fbbf24',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f59e0b'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fbbf24'}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = '#666';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#9ca3af';
                    e.target.style.borderColor = '#333';
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = '#fbbf24';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#9ca3af';
                    e.target.style.borderColor = '#333';
                  }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = '#fbbf24';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#9ca3af';
                    e.target.style.borderColor = '#333';
                  }}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Additional Details Section */}
        {showDetails && (
          <div style={{
            backgroundColor: '#3b2f2f',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '3rem',
            border: '1px solid #333'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#fbbf24',
              fontSize: '1.25rem'
            }}>
              Profile Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}>
              <div>
                <strong style={{ color: '#ffffff' }}>Account Status:</strong> {userDetails.accountStatus}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Member Since:</strong> {userDetails.memberSince}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Total Movies Watched:</strong> {userDetails.totalMoviesWatched}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Favorite Genre:</strong> {userDetails.favoriteGenre}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Birthdate:</strong> {userDetails.birthdate}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Country:</strong> {userDetails.country}
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div>
          {/* Watchlist Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fbbf24',
              margin: 0
            }}>
              My Watchlist
            </h2>
            <span style={{
              color: '#9ca3af',
              fontSize: '1rem'
            }}>
              {watchlist.length} movies
            </span>
          </div>

          {/* Movies Grid */}
          {watchlist.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {watchlist.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid #333',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(movie.id, e)}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '30px',
                      height: '30px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>

                  {/* Movie Poster Placeholder */}
                  <div style={{
                    height: '200px',
                    backgroundColor: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : 'No Image Available'}
                  </div>

                  {/* Movie Info */}
                  <div style={{
                    padding: '1.25rem'
                  }}>
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      lineHeight: '1.3'
                    }}>
                      {movie.title}
                    </h3>
                    <p style={{
                      margin: '0 0 0.75rem 0',
                      color: '#9ca3af',
                      fontSize: '0.875rem'
                    }}>
                      {movie.year}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        color: '#fbbf24',
                        fontSize: '1rem'
                      }}>
                        ★
                      </span>
                      <span style={{
                        color: '#fbbf24',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {movie.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Your watchlist is empty</h3>
              <p>Start adding movies to keep track of what you want to watch!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default UserDashboard;