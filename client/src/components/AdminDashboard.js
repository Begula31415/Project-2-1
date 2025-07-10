import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ currentUser = null }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddCelebrityModal, setShowAddCelebrityModal] = useState(false);
  const [showAddAwardModal, setShowAddAwardModal] = useState(false);
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    release_date: '',
    language_id: '',
    type: 'Movie',
    duration: '',
    poster_url: '',
    trailer_url: '',
    budget: '',
    box_office_collection: '',
    currency_code: '',
    min_age: ''
  });

  const [celebrityData, setCelebrityFormData] = useState({
    name: '',
    bio: '',
    birth_date: '',
    death_date: '',
    place_of_birth: '',
    gender: '',
    photo_url: ''
  });

  const [awardData, setAwardFormData] = useState({
    name: '',
    year: '',
    type: ''
  });

  // Sample data - replace with actual API calls
  const [contentData, setContentData] = useState([
    { id: 1, title: 'The Matrix', type: 'Movie', year: 1999, rating: 8.7 },
    { id: 2, title: 'Breaking Bad', type: 'Series', year: 2008, rating: 9.5 },
    { id: 3, title: 'Planet Earth', type: 'Documentary', year: 2006, rating: 9.4 }
  ]);

  const [celebrityListData, setCelebrityListData] = useState([
    { id: 1, name: 'Leonardo DiCaprio', profession: 'Actor', movies: 25 },
    { id: 2, name: 'Christopher Nolan', profession: 'Director', movies: 12 },
    { id: 3, name: 'Meryl Streep', profession: 'Actress', movies: 40 }
  ]);

  const [awardListData, setAwardListData] = useState([
    { id: 1, name: 'Academy Awards', year: 2024, category: 'Best Picture', winner: 'Oppenheimer' },
    { id: 2, name: 'Golden Globe', year: 2024, category: 'Best Actor', winner: 'Cillian Murphy' },
    { id: 3, name: 'BAFTA', year: 2024, category: 'Best Director', winner: 'Christopher Nolan' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData(prev => ({ ...prev, [name]: value }));
  };

  const handleCelebrityChange = (e) => {
    const { name, value } = e.target;
    setCelebrityFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAwardChange = (e) => {
    const { name, value } = e.target;
    setAwardFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await addMovie(movieData); // Uncomment when API is available
      console.log('Movie data to be added:', movieData);
      alert('Movie added successfully!');
      setMovieData({
        title: '',
        description: '',
        release_date: '',
        language_id: '',
        type: 'Movie',
        duration: '',
        poster_url: '',
        trailer_url: '',
        budget: '',
        box_office_collection: '',
        currency_code: '',
        min_age: ''
      });
      setShowAddMovieModal(false);
    } catch (err) {
      console.error('Error adding movie:', err);
      alert('Failed to add movie.');
    }
  };

  const handleCelebritySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Celebrity data to be added:', celebrityData);
      alert('Celebrity added successfully!');
      setCelebrityFormData({
        name: '',
        bio: '',
        birth_date: '',
        death_date: '',
        place_of_birth: '',
        gender: '',
        photo_url: ''
      });
      setShowAddCelebrityModal(false);
    } catch (err) {
      console.error('Error adding celebrity:', err);
      alert('Failed to add celebrity.');
    }
  };

  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Award data to be added:', awardData);
      alert('Award added successfully!');
      setAwardFormData({
        name: '',
        year: '',
        type: ''
      });
      setShowAddAwardModal(false);
    } catch (err) {
      console.error('Error adding award:', err);
      alert('Failed to add award.');
    }
  };

  const handleRemoveItem = (id, type) => {
    if (window.confirm(`Are you sure you want to remove this ${type}?`)) {
      switch (type) {
        case 'content':
          setContentData(prev => prev.filter(item => item.id !== id));
          break;
        case 'celebrity':
          setCelebrityListData(prev => prev.filter(item => item.id !== id));
          break;
        case 'award':
          setAwardListData(prev => prev.filter(item => item.id !== id));
          break;
      }
    }
  };

  const adminDetails = {
    username: currentUser?.username || 'Admin',
    email: currentUser?.official_mail || 'admin@filmfusion.com',
    bio: currentUser?.bio || 'No bio provided.',
    avatar: currentUser?.username?.charAt(0).toUpperCase() || 'A'
  };

  const WaterBackground = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      opacity: 0.8,
      pointerEvents: 'none'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        opacity: 0.9
      }} />
      
      <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="cinematicGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.7 }} />
            <stop offset="50%" style={{ stopColor: '#3730a3', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="cinematicGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: '#2563eb', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
          </linearGradient>
          <radialGradient id="spotlightGradient" cx="50%" cy="30%" r="60%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 0.1 }} />
          </radialGradient>
        </defs>
        
        {/* Large flowing shapes */}
        <path d="M0,150 C200,100 400,200 600,150 C700,130 800,170 800,150 L800,400 L0,400 Z" fill="url(#cinematicGradient1)">
          <animate attributeName="d" dur="12s" repeatCount="indefinite" 
            values="M0,150 C200,100 400,200 600,150 C700,130 800,170 800,150 L800,400 L0,400 Z;
                    M0,120 C200,80 400,180 600,120 C700,100 800,140 800,120 L800,400 L0,400 Z;
                    M0,180 C200,130 400,230 600,180 C700,160 800,200 800,180 L800,400 L0,400 Z;
                    M0,150 C200,100 400,200 600,150 C700,130 800,170 800,150 L800,400 L0,400 Z" />
        </path>
        
        <path d="M0,250 C300,200 500,300 800,250 L800,400 L0,400 Z" fill="url(#cinematicGradient2)">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" 
            values="M0,250 C300,200 500,300 800,250 L800,400 L0,400 Z;
                    M0,220 C300,170 500,270 800,220 L800,400 L0,400 Z;
                    M0,280 C300,230 500,330 800,280 L800,400 L0,400 Z;
                    M0,250 C300,200 500,300 800,250 L800,400 L0,400 Z" />
        </path>
        
        {/* Spotlight effect */}
        <ellipse cx="400" cy="150" rx="300" ry="100" fill="url(#spotlightGradient)">
          <animate attributeName="rx" dur="8s" repeatCount="indefinite" values="300;350;300" />
          <animate attributeName="ry" dur="6s" repeatCount="indefinite" values="100;130;100" />
        </ellipse>
        
        {/* Floating geometric elements */}
        <g opacity="0.4">
          <circle cx="100" cy="80" r="30" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" dur="5s" repeatCount="indefinite" values="30;40;30" />
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.5;0.8;0.5" />
          </circle>
          <circle cx="700" cy="300" r="25" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" dur="7s" repeatCount="indefinite" values="25;35;25" />
          </circle>
          <rect x="580" y="60" width="40" height="40" fill="#1e40af" opacity="0.2" transform="rotate(45 600 80)">
            <animateTransform attributeName="transform" type="rotate" dur="15s" repeatCount="indefinite" values="45 600 80;405 600 80;45 600 80" />
          </rect>
        </g>
        
        {/* Film reel pattern */}
        <g opacity="0.2">
          <circle cx="150" cy="320" r="40" fill="none" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="150" cy="320" r="25" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="150" cy="320" r="10" fill="#fbbf24" />
          <circle cx="650" cy="100" r="30" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="650" cy="100" r="15" fill="none" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="650" cy="100" r="5" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Content Management</h3>
              <button
                onClick={() => setShowAddMovieModal(true)}
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Add Movie
              </button>
            </div>
            {contentData.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                  <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>
                    {item.type} • {item.year} • Rating: {item.rating}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, 'content')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      case 'celebrity':
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Celebrity Management</h3>
              <button
                onClick={() => setShowAddCelebrityModal(true)}
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Add Celebrity
              </button>
            </div>
            {celebrityListData.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                  <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>
                    {item.profession} • {item.movies} movies
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, 'celebrity')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      case 'award':
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '1.5rem' }}>Award Management</h3>
              <button
                onClick={() => setShowAddAwardModal(true)}
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Add Award
              </button>
            </div>
            {awardListData.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                  <p style={{ color: '#9ca3af', margin: '0', fontSize: '0.875rem' }}>
                    {item.year} • {item.category} • Winner: {item.winner}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, 'award')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '2000px', 
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Admin Profile Section with Water Background */}
        <div style={{
          backgroundColor: '#1f1f1f',
          borderRadius: '12px',
          padding: '2rem 4rem',
          marginBottom: '2rem',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <WaterBackground />
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#000',
            position: 'relative',
            zIndex: 1
          }}>
            {adminDetails.avatar}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#fbbf24' }}>{adminDetails.username}</h1>
            <p style={{ color: '#9ca3af', margin: '0.1rem 0', fontSize: '0.95rem' }}>📧 {adminDetails.email}</p>
            <p style={{ color: '#9ca3af', fontStyle: !adminDetails.bio ? 'italic' : 'normal', margin: '0.1rem 0', fontSize: '0.875rem' }}>
              {adminDetails.bio ? `"${adminDetails.bio}"` : 'No bio available.'}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { key: 'content', label: 'Content' },
            { key: 'celebrity', label: 'Celebrity' },
            { key: 'award', label: 'Award' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: activeTab === tab.key ? '#fbbf24' : '#2a2a2a',
                color: activeTab === tab.key ? '#000' : '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #444',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: '#1f1f1f',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #333',
          minHeight: '400px'
        }}>
          {renderContent()}
        </div>

        {/* Add Movie Modal */}
        {showAddMovieModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddMovieModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Movie</h2>

                {Object.entries({
                  title: 'Title',
                  description: 'Description',
                  release_date: 'Release Date',
                  language_id: 'Language ID',
                  duration: 'Duration (in minutes)',
                  poster_url: 'Poster URL',
                  trailer_url: 'Trailer URL',
                  budget: 'Budget',
                  box_office_collection: 'Box Office Collection',
                  currency_code: 'Currency Code',
                  min_age: 'Minimum Age'
                }).map(([field, placeholder]) => (
                  field === 'description' ? (
                    <textarea
                      key={field}
                      name={field}
                      placeholder={placeholder}
                      value={movieData[field]}
                      onChange={handleChange}
                      required
                      rows={3}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#0a0a0a',
                        color: 'white',
                        fontSize: '0.95rem',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <input
                      key={field}
                      type={field === 'release_date' ? 'date' : field === 'budget' || field === 'box_office_collection' || field === 'duration' || field === 'language_id' || field === 'min_age' ? 'number' : 'text'}
                      name={field}
                      placeholder={placeholder}
                      value={movieData[field]}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#0a0a0a',
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    />
                  )
                ))}

                <select
                  name="type"
                  value={movieData.type}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="Movie">Movie</option>
                  <option value="Series">Series</option>
                  <option value="Documentary">Documentary</option>
                </select>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddMovieModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Celebrity Modal */}
        {showAddCelebrityModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddCelebrityModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleCelebritySubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Celebrity</h2>

                {Object.entries({
                  name: 'Name',
                  bio: 'Bio',
                  birth_date: 'Birth Date',
                  death_date: 'Death Date',
                  place_of_birth: 'Place of Birth',
                  gender: 'Gender',
                  photo_url: 'Photo URL'
                }).map(([field, placeholder]) => (
                  <input
                    key={field}
                    type={field.includes('date') ? 'date' : 'text'}
                    name={field}
                    placeholder={placeholder}
                    value={celebrityData[field]}
                    onChange={handleCelebrityChange}
                    required
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      backgroundColor: '#0a0a0a',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCelebrityModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Celebrity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Award Modal */}
        {showAddAwardModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAddAwardModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>

              <form onSubmit={handleAwardSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Add New Award</h2>

                {Object.entries({
                  name: 'Award Name',
                  year: 'Year',
                  type: 'Type'
                }).map(([field, placeholder]) => (
                  <input
                    key={field}
                    type={field === 'year' ? 'number' : 'text'}
                    name={field}
                    placeholder={placeholder}
                    value={awardData[field]}
                    onChange={handleAwardChange}
                    required
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      backgroundColor: '#0a0a0a',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddAwardModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#000',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      flex: 1
                    }}
                  >
                    Add Award
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

