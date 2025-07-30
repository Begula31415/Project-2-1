import React, { useState, useEffect } from 'react';
import { getWatchlist, removeFromWatchlist, getUserDetails, updateProfile,getFavouriteCelebrities,removeFromFavouriteCelebrities } from '../services/api';
import { addToWatchlist,isInWatchlist } from '../services/api';
import { getUserAverageRating } from '../services/api';

import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ currentUser, isAuthenticated = true }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [favouriteCelebrities, setFavouriteCelebrities] = useState([]);  
  const [activeTab, setActiveTab] = useState('watchlist');

  const navigate = useNavigate();
 
  const[userAverageRating,setUserAverageRating]=useState(0);

  const [formData, setFormData] = useState({
    username: '',
   // email: '',
    bio: '',
    profile_picture_url: ''
  });

  





  // useEffect(() => {
  //   if (!isAuthenticated || !mockCurrentUser) return;

  //   const fetchData = async () => {
  //     try {
  //       const details = await getUserDetails(mockCurrentUser.user_id);
  //       setUserDetails({
  //         username: details.username,
  //         official_mail: details.official_mail,
  //         bio: details.bio,
  //         avatar: details.username ? details.username.charAt(0).toUpperCase() : '?',
  //         isOnline: true,
  //         accountStatus: 'Premium',
  //         memberSince: 'March 2023',
  //         totalMoviesWatched: details.total_watched || 89,
  //         favoriteGenre: details.favorite_genre || 'Sci-Fi'
  //       });

  //       setFormData({
  //         username: details.username,
  //         email: details.official_mail,
  //         bio: details.bio
  //       });

  //       const list = await getWatchlist(mockCurrentUser.user_id);
  //       setWatchlist(list.map(movie => ({
  //         ...movie,
  //         year: movie.release_year,
  //         dateAdded: movie.added_date
  //       })));
  //     } catch (err) {
  //       console.error('Error fetching dashboard data:', err);
  //     }
  //   };

  //   fetchData();
  // }, [mockCurrentUser, isAuthenticated]);

  
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.user_id) return;
  
    // Update the fetchData function in your useEffect  
const fetchData = async () => {  
  try {  
    const details = await getUserDetails(currentUser.user_id);  
    console.log("User Details From API:", details);  
  
    setUserDetails({    
      username: details.username || '',    
      bio: details.bio || '',    
      role: details.role || '',    
      email: details.email || 'GOT NO EMAIL TILL NOW',    
      profile_picture: details.profile_picture_url || '',    
      favoriteGenre: details.favorite_genre || 'N/A',    
      birthdate: details.birth_date ? new Date(details.birth_date).toLocaleDateString() : 'Not set',    
      country: details.location || 'Unknown',    
      memberSince: details.created_at ? new Date(details.created_at).toLocaleDateString() : 'Unknown',    
      accountStatus: 'Active'  
    });    
          
    setFormData({    
      username: details.username || '',    
      bio: details.bio || '',    
      profile_picture_url: details.profile_picture_url || '',  
      email: details.email || ''  
    });   
  
    // Fetch favourite celebrities    
    try {    
      const celebData = await getFavouriteCelebrities(currentUser.user_id);    
      setFavouriteCelebrities(celebData);    
    } catch (error) {    
      console.error('Error fetching favourite celebrities:', error);    
      setFavouriteCelebrities([]);    
    }   
  
    // Fetch watchlist - IMPROVED ERROR HANDLING  
    try {    
      console.log('Fetching watchlist for user:', currentUser.user_id);  
      const watchlistData = await getWatchlist(currentUser.user_id);    
      console.log('Watchlist data received:', watchlistData);  
        
      if (Array.isArray(watchlistData)) {  
        setWatchlist(watchlistData.map(movie => ({    
          ...movie,    
          id: movie.content_id,    
          year: movie.release_year || new Date(movie.release_date).getFullYear(),    
          dateAdded: movie.added_at,  
          poster: movie.poster_url    
        })));  
      } else {  
        console.warn('Watchlist data is not an array:', watchlistData);  
        setWatchlist([]);  
      }  
    } catch (error) {    
      console.error('Error fetching watchlist:', error);    
      setWatchlist([]);    
    }    
  
    // Fetch user average rating      
    try {      
      const avgRatingData = await getUserAverageRating(currentUser.user_id);      
      setUserAverageRating(avgRatingData.averageRating || 0);      
    } catch (error) {      
      console.error('Error fetching user average rating:', error);      
      setUserAverageRating(0);      
    }   
  
  } catch (err) {  
    console.error('Error fetching dashboard data:', err);  
  }  
};
  
    fetchData();
  }, [currentUser, isAuthenticated]);

  


  //const mockCurrentUser = currentUser || { user_id: 'mock-user-123' };

  // 🔧 REPLACE WITH THIS

  if (!currentUser || !currentUser.user_id) {
    return <p style={{ color: 'white', textAlign: 'center' }}>Loading user data...</p>;
  }
  

  const handleRemove = async (movieId, e) => {
    e.stopPropagation();
    try {
       console.log('Removing movie from watchlist:', movieId);  
    const response = await removeFromWatchlist(currentUser.user_id, movieId);  
    console.log('Remove response:', response);  
      
    if (response.success) {  
      setWatchlist(prevList => prevList.filter((m) => m.id !== movieId));  
      // Optional: Show success message  
      console.log('Movie removed successfully');  
    } else {  
      throw new Error(response.message || 'Failed to remove movie');  
    }  
  } catch (err) {  
    console.error('Error removing movie:', err);  
    alert('Failed to remove movie. Please try again.');  
  }  
  };


  const handleRemoveCelebrity = async (celebrityId, e) => {  
    e.stopPropagation();  
    try {  
      await removeFromFavouriteCelebrities(currentUser.user_id, celebrityId);  
      setFavouriteCelebrities(prevList => prevList.filter((c) => c.celebrity_id !== celebrityId));  
    } catch (err) {  
      console.error('Error removing celebrity:', err);  
      alert('Failed to remove celebrity. Please try again.');  
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
      await updateProfile(currentUser.user_id, formData);
      setEditing(false);
      setUserDetails(prev => ({
        ...prev,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        profile_picture: formData.profile_picture_url
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

    const handleCelebrityClick = (celebrity) => {  
    navigate(`/celebrity/${celebrity.celebrity_id}`);  
  };  


//   // Replace the existing handleAddToWatchlist function  
// const handleAddToWatchlist = async () => {  
//   if (!isAuthenticated) {  
//     onAuthRequired();  
//     return;  
//   }  
  
//   setWatchlistLoading(true);  
//   try {  
//     if (isInUserWatchlist) {  
//       // Remove from watchlist  
//       const response = await removeFromWatchlist(currentUser.user_id, id);  
//       if (response.success) {  
//         setIsInUserWatchlist(false);  
//         alert('Movie removed from watchlist!');  
//       }  
//     } else {  
//       // Add to watchlist  
//       const response = await addToWatchlist(currentUser.user_id, id);  
//       if (response.success) {  
//         setIsInUserWatchlist(true);  
//         alert('Movie added to watchlist!');  
//       }  
//     }  
//   } catch (error) {  
//     console.error('Error updating watchlist:', error);  
//     if (error.message.includes('already exists')) {  
//       alert('This movie is already in your watchlist!');  
//       setIsInUserWatchlist(true);  
//     } else {  
//       alert(error.message || 'Failed to update watchlist. Please try again.');  
//     }  
//   } finally {  
//     setWatchlistLoading(false);  
//   }  
// };

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
          <radialGradient id="userMainGlow" cx="50%" cy="50%" r="60%">  
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />  
            <stop offset="50%" style={{ stopColor: '#1d4ed8', stopOpacity: 0.1 }} />  
            <stop offset="100%" style={{ stopColor: '#1a1a1a', stopOpacity: 0 }} />  
          </radialGradient>  
          <linearGradient id="userStreamGradient" x1="0%" y1="0%" x2="100%" y2="0%">  
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />  
            <stop offset="50%" style={{ stopColor: '#1d4ed8', stopOpacity: 0.3 }} />  
            <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 0.1 }} />  
          </linearGradient>  
          <filter id="userBlur">  
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />  
          </filter>  
          <filter id="userGlow">  
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>  
            <feMerge>   
              <feMergeNode in="coloredBlur"/>  
              <feMergeNode in="SourceGraphic"/>  
            </feMerge>  
          </filter>  
        </defs>  
    
        {/* Main pulsing background */}  
        <ellipse cx="50%" cy="50%" rx="40%" ry="30%" fill="url(#userMainGlow)">  
          <animate attributeName="rx" dur="12s" values="40%;50%;40%" repeatCount="indefinite" />  
          <animate attributeName="ry" dur="10s" values="30%;40%;30%" repeatCount="indefinite" />  
          <animate attributeName="opacity" dur="8s" values="1;0.6;1" repeatCount="indefinite" />  
        </ellipse>  
    
        {/* Streaming data visualization */}  
        <g opacity="0.6">  
          {/* Data streams */}  
          <rect x="0" y="150" width="800" height="2" fill="url(#userStreamGradient)">  
            <animate attributeName="opacity" dur="3s" values="0.6;1;0.6" repeatCount="indefinite" />  
          </rect>  
          <rect x="0" y="200" width="800" height="1" fill="url(#userStreamGradient)">  
            <animate attributeName="opacity" dur="4s" values="0.4;0.8;0.4" repeatCount="indefinite" begin="1s" />  
          </rect>  
          <rect x="0" y="250" width="800" height="1.5" fill="url(#userStreamGradient)">  
            <animate attributeName="opacity" dur="5s" values="0.5;0.9;0.5" repeatCount="indefinite" begin="2s" />  
          </rect>  
    
          {/* Moving data packets */}  
          <circle cx="0" cy="150" r="3" fill="#3b82f6" opacity="0.8">  
            <animateMotion path="M0,0 L800,0" dur="6s" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="6s" values="0;0.8;0" repeatCount="indefinite" />  
          </circle>  
          <circle cx="0" cy="200" r="2" fill="#1d4ed8" opacity="0.6">  
            <animateMotion path="M0,0 L800,0" dur="8s" repeatCount="indefinite" begin="2s" />  
            <animate attributeName="opacity" dur="8s" values="0;0.6;0" repeatCount="indefinite" begin="2s" />  
          </circle>  
          <circle cx="0" cy="250" r="2.5" fill="#1e40af" opacity="0.7">  
            <animateMotion path="M0,0 L800,0" dur="7s" repeatCount="indefinite" begin="4s" />  
            <animate attributeName="opacity" dur="7s" values="0;0.7;0" repeatCount="indefinite" begin="4s" />  
          </circle>  
        </g>  
    
        {/* Floating user interface elements */}  
        <g opacity="0.5" filter="url(#userGlow)">  
          {/* Play button */}  
          <polygon points="120,80 120,120 150,100" fill="#3b82f6" opacity="0.7">  
            <animate attributeName="opacity" dur="4s" values="0.7;1;0.7" repeatCount="indefinite" />  
            <animateTransform attributeName="transform" type="scale" dur="6s" values="1;1.2;1" repeatCount="indefinite" />  
          </polygon>  
    
          {/* Heart/favorite icon */}  
          <path d="M680,100 C675,95 665,95 660,100 C655,95 645,95 640,100 C640,110 660,125 660,125 C660,125 680,110 680,100 Z"   
                fill="#3b82f6" opacity="0.6">  
            <animate attributeName="opacity" dur="5s" values="0.6;1;0.6" repeatCount="indefinite" begin="1s" />  
            <animateTransform attributeName="transform" type="scale" dur="8s" values="1;1.3;1" repeatCount="indefinite" begin="1s" />  
          </path>  
    
          {/* Star rating */}  
          <g transform="translate(200, 300)">  
            <polygon points="0,0 5,15 20,15 8,25 12,40 0,30 -12,40 -8,25 -20,15 -5,15" fill="#3b82f6" opacity="0.5">  
              <animate attributeName="opacity" dur="3s" values="0.5;0.9;0.5" repeatCount="indefinite" />  
            </polygon>  
            <polygon points="30,0 35,15 50,15 38,25 42,40 30,30 18,40 22,25 10,15 25,15" fill="#1d4ed8" opacity="0.4">  
              <animate attributeName="opacity" dur="3s" values="0.4;0.8;0.4" repeatCount="indefinite" begin="0.5s" />  
            </polygon>  
            <polygon points="60,0 65,15 80,15 68,25 72,40 60,30 48,40 52,25 40,15 55,15" fill="#1e40af" opacity="0.3">  
              <animate attributeName="opacity" dur="3s" values="0.3;0.7;0.3" repeatCount="indefinite" begin="1s" />  
            </polygon>  
          </g>  
    
          {/* Profile circles */}  
          <circle cx="500" cy="80" r="15" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6">  
            <animate attributeName="r" dur="6s" values="15;20;15" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="6s" values="0.6;1;0.6" repeatCount="indefinite" />  
          </circle>  
          <circle cx="500" cy="80" r="8" fill="#3b82f6" opacity="0.4">  
            <animate attributeName="opacity" dur="4s" values="0.4;0.8;0.4" repeatCount="indefinite" />  
          </circle>  
        </g>  
    
        {/* Ambient floating particles */}  
        <g opacity="0.3" filter="url(#userBlur)">  
          <circle cx="100" cy="200" r="2" fill="#3b82f6">  
            <animateMotion path="M0,0 C50,50 -50,50 0,0 Z" dur="15s" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="8s" values="0.3;0.7;0.3" repeatCount="indefinite" />  
          </circle>  
          <circle cx="700" cy="150" r="3" fill="#1d4ed8">  
            <animateMotion path="M0,0 C-50,-50 50,-50 0,0 Z" dur="12s" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="6s" values="0.2;0.6;0.2" repeatCount="indefinite" />  
          </circle>  
          <circle cx="300" cy="320" r="1.5" fill="#1e40af">  
            <animateMotion path="M0,0 C0,80 80,80 80,0 C80,-80 0,-80 0,0 Z" dur="20s" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="10s" values="0.3;0.8;0.3" repeatCount="indefinite" />  
          </circle>  
          <circle cx="600" cy="280" r="2.5" fill="#3b82f6">  
            <animateMotion path="M0,0 C-80,20 80,20 0,0 Z" dur="18s" repeatCount="indefinite" />  
            <animate attributeName="opacity" dur="7s" values="0.2;0.5;0.2" repeatCount="indefinite" />  
          </circle>  
        </g>  
    
        {/* Subtle grid pattern */}  
        <defs>  
          <pattern id="userGrid" width="40" height="40" patternUnits="userSpaceOnUse">  
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.1"/>  
          </pattern>  
        </defs>  
        <rect width="100%" height="100%" fill="url(#userGrid)" opacity="0.3">  
          <animate attributeName="opacity" dur="15s" values="0.3;0.1;0.3" repeatCount="indefinite" />  
        </rect>  
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
              {/* <div style={{
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
              </div> */}
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
  color: '#000',  
  backgroundImage: userDetails.profile_picture ? `url(${userDetails.profile_picture})` : 'none',  
  backgroundSize: 'cover',  
  backgroundPosition: 'center'  
}}>  
  {!userDetails.profile_picture && (userDetails.username?.charAt(0).toUpperCase() || 'U')}  
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
                
                {/* </div>
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
                </div> */}
                </div>  
<div style={{ marginBottom: '1rem' }}>  
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>  
    Profile Picture URL  
  </label>  
  <input  
    type="url"  
    name="profile_picture_url"  
    value={formData.profile_picture_url}  
    onChange={handleChange}  
    placeholder="https://example.com/your-photo.jpg"  
    style={{  
      width: '100%',  
      maxWidth: '400px',  
      padding: '0.75rem',  
      backgroundColor: '#2a2a2a',  
      border: '1px solid #333',  
      borderRadius: '6px',  
      color: '#ffffff',  
      fontSize: '0.875rem',  
      fontFamily: 'inherit'  
    }}  
  />  
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
                  {userDetails.email||'Got no email till now'}
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
            backgroundColor: '#1a1a1a',  
            borderRadius: '12px',  
            padding: '2rem',  
            marginBottom: '3rem',  
            border: '1px solid #333'  
          }}>  
            {/* User Stats Row */}  
            <div style={{  
              display: 'flex',  
              justifyContent: 'space-around',  
              alignItems: 'center',  
              marginBottom: '2rem',  
              padding: '1rem 0',  
              borderBottom: '1px solid #333'  
            }}>  
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#ffffff',  
                  marginBottom: '0.5rem'  
                }}>  
                  {watchlist.length}  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Movies Watched  
                </div>  
              </div>  
                
              {/* <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#3b82f6',  
                  marginBottom: '0.5rem'  
                }}>  
                  24h  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Watch Time  
                </div>  
              </div>   */}
                
             <div style={{ textAlign: 'center' }}>    
  <div style={{    
    fontSize: '2rem',    
    fontWeight: 'bold',    
    color: '#fbbf24',    
    marginBottom: '0.5rem',    
    display: 'flex',    
    alignItems: 'center',    
    justifyContent: 'center',    
    gap: '0.25rem'    
  }}>    
    ⭐ {userAverageRating.toFixed(1)}    
  </div>    
  <div style={{    
    fontSize: '0.875rem',    
    color: '#9ca3af'    
  }}>    
    Your Avg Rating    
  </div>    
</div>  
                
              <div style={{ textAlign: 'center' }}>  
                <div style={{  
                  fontSize: '2rem',  
                  fontWeight: 'bold',  
                  color: '#10b981',  
                  marginBottom: '0.5rem'  
                }}>  
                  {favouriteCelebrities.length}  
                </div>  
                <div style={{  
                  fontSize: '0.875rem',  
                  color: '#9ca3af'  
                }}>  
                  Fav Celebrities  
                </div>  
              </div>  
            </div>  
  
            {/* Profile Details Grid */}  
            <div style={{  
              marginBottom: '1.5rem'  
            }}>  
              <h3 style={{  
                margin: '0 0 1.5rem 0',  
                color: '#fbbf24',  
                fontSize: '1.25rem',  
                display: 'flex',  
                alignItems: 'center',  
                gap: '0.5rem'  
              }}>  
                📊 Profile Details  
              </h3>  
                
              <div style={{  
                display: 'grid',  
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',  
                gap: '1.5rem'  
              }}>  
                {/* Account Status */}  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#10b981',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    📋  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Account Status  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      {userDetails.accountStatus}  
                    </div>  
                  </div>  
                </div>  
  
                {/* Favorite Genre  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#8b5cf6',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    💜  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Favorite Genre  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      {userDetails.favoriteGenre}  
                    </div>  
                  </div>  
                </div>   */}
  
                {/* Birthdate */}  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#f59e0b',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    📅  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Birthdate  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      {userDetails.birthdate}  
                    </div>  
                  </div>  
                </div>  
  
                {/* Country */}  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#3b82f6',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    📍  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Country  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      {userDetails.country}  
                    </div>  
                  </div>  
                </div>  
  
                {/* Member Since */}  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#ef4444',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    🏆  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Member Since  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      {userDetails.memberSince}  
                    </div>  
                  </div>  
                </div>  
  
                {/* Achievement Level */}  
                <div style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  gap: '1rem',  
                  padding: '1rem',  
                  backgroundColor: '#2a2a2a',  
                  borderRadius: '8px',  
                  border: '1px solid #333'  
                }}>  
                  <div style={{  
                    width: '40px',  
                    height: '40px',  
                    backgroundColor: '#8b5cf6',  
                    borderRadius: '8px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'center',  
                    fontSize: '1.25rem'  
                  }}>  
                    🎖️  
                  </div>  
                  <div>  
                    <div style={{  
                      fontSize: '0.875rem',  
                      color: '#9ca3af',  
                      marginBottom: '0.25rem'  
                    }}>  
                      Achievement Level  
                    </div>  
                    <div style={{  
                      fontSize: '1rem',  
                      color: '#ffffff',  
                      fontWeight: '500'  
                    }}>  
                      Movie Enthusiast  
                    </div>  
                  </div>  
                </div>  
              </div>  
            </div>  
          </div>  
        )}  

  
  {/* Content Section - Split Layout */}  
  <div style={{  
    display: 'flex',  
    gap: '2rem',  
    minHeight: '500px'  
  }}>  
    {/* Left Half - Watchlist */}  
    <div style={{  
      flex: 1,  
      backgroundColor: '#1a1a1a',  
      borderRadius: '12px',  
      padding: '2rem',  
      border: '1px solid #333'  
    }}>  
      <div style={{  
        display: 'flex',  
        justifyContent: 'space-between',  
        alignItems: 'center',  
        marginBottom: '2rem'  
      }}>  
        <h2 style={{  
          fontSize: '1.5rem',  
          fontWeight: 'bold',  
          color: '#fbbf24',  
          margin: 0  
        }}>  
          My Watchlist  
        </h2>  
        <span style={{  
          color: '#9ca3af',  
          fontSize: '0.9rem'  
        }}>  
          {watchlist.length} items  
        </span>  
      </div>  

       {watchlist.length > 0 ? (    
        <div style={{    
          display: 'grid',    
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',    
          gap: '1rem',    
          maxHeight: '400px',    
          overflowY: 'auto'    
        }}>    
          {watchlist.map(movie => (    
            <div    
              key={movie.id}    
              onClick={() => handleMovieClick(movie)}    
              style={{    
                backgroundColor: '#2a2a2a',    
                borderRadius: '8px',    
                overflow: 'hidden',    
                cursor: 'pointer',    
                transition: 'transform 0.2s',    
                position: 'relative'    
              }}    
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}    
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}    
            >    
              <button    
                onClick={(e) => handleRemove(movie.id, e)}    
                title="Remove from Watchlist"  
                style={{    
                  position: 'absolute',    
                  top: '0.5rem',    
                  right: '0.5rem',    
                  padding: '0.25rem 0.5rem',  
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',    
                  color: '#ffffff',    
                  border: 'none',    
                  borderRadius: '4px',    
                  cursor: 'pointer',    
                  fontSize: '0.75rem',    
                  fontWeight: '500',  
                  zIndex: 1,  
                  transition: 'all 0.2s'  
                }}  
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}  
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}  
              >    
                Remove  
              </button>    
  
              <div style={{    
                height: '280px',    
                backgroundColor: '#333',    
                display: 'flex',    
                alignItems: 'center',    
                justifyContent: 'center',    
                color: '#9ca3af',    
                fontSize: '0.75rem'    
              }}>    
                {movie.poster ? (    
                  <img     
                    src={movie.poster}     
                    alt={movie.title}    
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}    
                  />    
                ) : 'No Image'}    
              </div>    
  
              <div style={{ padding: '0.75rem' }}>    
                <h4 style={{    
                  margin: '0 0 0.25rem 0',    
                  fontSize: '0.875rem',    
                  fontWeight: '600',    
                  color: '#ffffff',    
                  lineHeight: '1.2'    
                }}>    
                  {movie.title}    
                </h4>    
                <p style={{    
                  margin: '0',    
                  color: '#9ca3af',    
                  fontSize: '0.75rem'    
                }}>    
                  {movie.year}    
                </p>    
              </div>    
            </div>    
          ))}    
        </div> 
      ) : (  
        <div style={{  
          textAlign: 'center',  
          padding: '3rem 1rem',  
          color: '#9ca3af'  
        }}>  
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>  
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Your watchlist is empty</h3>  
          <p style={{ fontSize: '0.9rem' }}>Start adding movies to keep track!</p>  
        </div>  
      )}  
    </div>  

    {/* Right Half - Favourite Celebrities */}  
    <div style={{  
      flex: 1,  
      backgroundColor: '#1a1a1a',  
      borderRadius: '12px',  
      padding: '2rem',  
      border: '1px solid #333'  
    }}>  
      <div style={{  
        display: 'flex',  
        justifyContent: 'space-between',  
        alignItems: 'center',  
        marginBottom: '2rem'  
      }}>  
        <h2 style={{  
          fontSize: '1.5rem',  
          fontWeight: 'bold',  
          color: '#fbbf24',  
          margin: 0  
        }}>  
          Favourite Celebrities  
        </h2>  
        <span style={{  
          color: '#9ca3af',  
          fontSize: '0.9rem'  
        }}>  
          {favouriteCelebrities.length} celebrities  
        </span>  
      </div>  

      {favouriteCelebrities.length > 0 ? (    
        <div style={{    
          display: 'grid',    
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',    
          gap: '1rem',    
          maxHeight: '400px',    
          overflowY: 'auto'    
        }}>    
          {favouriteCelebrities.map(celebrity => (    
            <div    
              key={celebrity.celebrity_id}   
              onClick={() => handleCelebrityClick(celebrity)}   
              style={{    
                backgroundColor: '#2a2a2a',    
                borderRadius: '8px',    
                overflow: 'hidden',    
                cursor: 'pointer',    
                transition: 'transform 0.2s',    
                position: 'relative'    
              }}    
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}    
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}    
            >    
              <button    
                onClick={(e) => handleRemoveCelebrity(celebrity.celebrity_id, e)}    
                title="Remove from Favourites"  
                style={{    
                  position: 'absolute',    
                  top: '0.5rem',    
                  right: '0.5rem',    
                  padding: '0.25rem 0.5rem',  
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',    
                  color: '#ffffff',    
                  border: 'none',    
                  borderRadius: '4px',    
                  cursor: 'pointer',    
                  fontSize: '0.75rem',    
                  fontWeight: '500',  
                  zIndex: 1,  
                  transition: 'all 0.2s'  
                }}  
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}  
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}  
              >    
                Remove  
              </button>    
  
              <div style={{    
                height: '280px',    
                backgroundColor: '#333',    
                display: 'flex',    
                alignItems: 'center',    
                justifyContent: 'center',    
                color: '#9ca3af',    
                fontSize: '0.75rem'    
              }}>    
                {celebrity.photo_url ? (    
                  <img     
                    src={celebrity.photo_url}     
                    alt={celebrity.name}    
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}    
                  />    
                ) : 'No Image'}    
              </div>    
  
              <div style={{ padding: '0.75rem' }}>    
                <h4 style={{    
                  margin: '0 0 0.25rem 0',    
                  fontSize: '0.875rem',    
                  fontWeight: '600',    
                  color: '#ffffff',    
                  lineHeight: '1.2'    
                }}>    
                  {celebrity.name}    
                </h4>    
                <p style={{    
                  margin: '0',    
                  color: '#9ca3af',    
                  fontSize: '0.75rem'    
                }}>    
                  {celebrity.birth_date ? new Date(celebrity.birth_date).toLocaleDateString() : 'N/A'}    
                </p>    
              </div>    
            </div>    
          ))}    
        </div>  
      ) : (  
        <div style={{  
          textAlign: 'center',  
          padding: '3rem 1rem',  
          color: '#9ca3af'  
        }}>  
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>  
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>No favourite celebrities yet</h3>  
          <p style={{ fontSize: '0.9rem' }}>Start adding celebrities to your favourites!</p>  
        </div>  
      )}  
    </div>  
  </div> 
  </div>
 
  
  {/* Footer */}  
  <footer style={{  
    backgroundColor: '#1a1a1a',  
    borderRadius: '12px',  
    padding: '3rem 2rem 2rem',  
    marginTop: '4rem',  
    border: '1px solid #333'  
  }}>  
    <div style={{  
      display: 'grid',  
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',  
      gap: '2rem',  
      marginBottom: '2rem'  
    }}>  
      <div>  
        <h3 style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '1rem' }}>FilmFusion</h3>  
        <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>  
          Your ultimate destination for movies, TV shows, and entertainment content.  
          Discover, explore, and enjoy the world of cinema.  
        </p>  
        <div style={{ display: 'flex', gap: '1rem' }}>  
          <a href="#" style={{ color: '#3b82f6', fontSize: '1.5rem', textDecoration: 'none' }}>📘</a>  
          <a href="#" style={{ color: '#1d9bf0', fontSize: '1.5rem', textDecoration: 'none' }}>🐦</a>  
          <a href="#" style={{ color: '#e4405f', fontSize: '1.5rem', textDecoration: 'none' }}>📷</a>  
          <a href="#" style={{ color: '#ff0000', fontSize: '1.5rem', textDecoration: 'none' }}>▶️</a>  
        </div>  
      </div>  

      <div>  
        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>Movies</h4>  
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
          {['Popular Movies', 'Top Rated', 'Upcoming', 'Now Playing'].map(item => (  
            <li key={item} style={{ marginBottom: '0.5rem' }}>  
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>{item}</a>  
            </li>  
          ))}  
        </ul>  
      </div>  

      <div>  
        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>TV Shows</h4>  
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
          {['Popular Shows', 'Top Rated', 'On The Air', 'Airing Today'].map(item => (  
            <li key={item} style={{ marginBottom: '0.5rem' }}>  
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>{item}</a>  
            </li>  
          ))}  
        </ul>  
      </div>  

      <div>  
        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>Support</h4>  
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>  
          {['Help Center', 'Contact Us', 'API', 'Terms of Service', 'Privacy Policy'].map(item => (  
            <li key={item} style={{ marginBottom: '0.5rem' }}>  
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>{item}</a>  
            </li>  
          ))}  
        </ul>  
      </div>  
    </div>  

    <div style={{  
      borderTop: '1px solid #333',  
      paddingTop: '2rem',  
      display: 'flex',  
      justifyContent: 'space-between',  
      alignItems: 'center',  
      flexWrap: 'wrap',  
      gap: '1rem'  
    }}>  
      <div>  
        <p style={{ color: '#9ca3af', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>  
          © 2025 FilmFusion. All rights reserved.  
        </p>  
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>  
          This product uses the TMDB API but is not endorsed or certified by TMDB. 🎬  
        </p>  
      </div>  
      <div style={{ display: 'flex', gap: '1.5rem' }}>  
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Terms</a>  
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy</a>  
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Cookies</a>  
      </div>  
    </div>  
  </footer>  
</div>  
);  
};  

export default UserDashboard;