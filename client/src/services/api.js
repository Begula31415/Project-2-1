//this file working as middle ware between the client and the backend API
const API_BASE_URL = 'http://localhost:5000';

//import axios from 'axios';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Sign in function
export const signIn = async (signInData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signInData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign up function 
export const signUp = async (signUpData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signUpData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// ==================== FILMFUSION API UPDATES START ====================

// Get top rated movies (for trending section)
export const getTopRatedMovies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/top-rated`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get top rated movies error:', error);
    throw error;
  }
};

// Get most viewed movies
export const getMostViewedMovies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/most-viewed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get most viewed movies error:', error);
    throw error;
  }
};

// Get popular series
export const getPopularSeries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/series/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get popular series error:', error);
    throw error;
  }
};

// Get popular celebrities
export const getPopularCelebrities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/celebrities/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get popular celebrities error:', error);
    throw error;
  }
};

// ==================== FILMFUSION API UPDATES END ====================

//Saif changes pull start
export const getUserDetails = async (userId) => { 
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);
  return await handleResponse(response);
};

export const updateProfile = async (userId, data) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await handleResponse(response);
};

// Remove from watchlist  
export const removeFromWatchlist = async (userId, contentId) => {        
  try {        
    console.log('API call - removing from watchlist:', { userId, contentId });      
          
    const response = await fetch(`${API_BASE_URL}/watchlist`, {        
      method: 'DELETE',        
      headers: {        
        'Content-Type': 'application/json',        
      },        
      body: JSON.stringify({        
        user_id: userId,        
        content_id: contentId  
      }),        
    });        
        
    console.log('Response status:', response.status);      
          
    if (!response.ok) {        
      let errorMessage = 'Failed to remove from watchlist';      
      try {      
        const errorData = await response.json();      
        errorMessage = errorData.message || errorMessage;      
      } catch (e) {      
        try {      
          const errorText = await response.text();      
          errorMessage = `Server error: ${errorText}`;      
        } catch (e2) {      
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;      
        }      
      }      
      throw new Error(errorMessage);        
    }        
        
    return await response.json();        
  } catch (error) {        
    console.error('Error removing from watchlist:', error);        
    throw error;        
  }        
};  

// Get movies function
export const getMovies = async (category = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies?category=${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get movies error:', error);
    throw error;
  }
};

// Search movies function
export const searchMovies = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Search movies error:', error);
    throw error;
  }
};

// Movie Details Related APIs
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data); // Debug log
    
    if (!data.success || !data.movie) {
      console.error('Invalid movie data:', data);
      throw new Error(data.message || 'Failed to fetch movie details');
    }
    return data.movie;
  } catch (error) {
    console.error('Error in getMovieDetails:', error);
    throw error;
  }
};

export const getMovieImages = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/images`);
  const data = await response.json();
  return data.images;
};

export const getMovieReviews = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`);
  const data = await response.json();
  return data.reviews;
};

export const getMovieCast = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/cast`);
  const data = await response.json();
  return data.cast;
};

export const getMovieAwards = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/awards`);
  const data = await response.json();
  return data.awards;
};


// Add to watchlist    
export const addToWatchlist = async (userId, contentId) => {    
  try {    
    const response = await fetch(`${API_BASE_URL}/watchlist`, {    
      method: 'POST',    
      headers: {    
        'Content-Type': 'application/json',    
      },    
      body: JSON.stringify({    
        user_id: userId,    
        content_id: contentId    
      }),    
    });    
    
    if (!response.ok) {    
      const errorData = await response.json();    
      throw new Error(errorData.message || 'Failed to add to watchlist');    
    }    
    
    return await response.json();    
  } catch (error) {    
    console.error('Error adding to watchlist:', error);    
    throw error;    
  }    
};   
  

  
// Get watchlist function  
export const getWatchlist = async (userId) => {  
  try {  
    const response = await fetch(`${API_BASE_URL}/watchlist/${userId}`, {  
      method: 'GET',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
    });  
      
    if (!response.ok) {  
      throw new Error('Failed to fetch watchlist');  
    }  
      
    const data = await response.json();  
    return data.watchlist || []; // Return the watchlist array  
  } catch (error) {  
    console.error('Get watchlist error:', error);  
    return []; // Return empty array on error  
  }  
}; 

// Check if content is in watchlist    
export const isInWatchlist = async (userId, contentId) => {    
  try {    
    const response = await fetch(`${API_BASE_URL}/watchlist/check/${userId}/${contentId}`);    
        
    if (!response.ok) {    
      throw new Error('Failed to check watchlist status');    
    }    
    
    const data = await response.json();  
    return data;    
  } catch (error) {    
    console.error('Error checking watchlist status:', error);    
    return { success: false, isInWatchlist: false };  
  }    
};

// Get user's average rating  
export const getUserAverageRating = async (userId) => {  
  try {  
    const response = await fetch(`${API_BASE_URL}/user/${userId}/average-rating`);  
      
    if (!response.ok) {  
      throw new Error('Failed to fetch user average rating');  
    }  
  
    return await response.json();  
  } catch (error) {  
    console.error('Error fetching user average rating:', error);  
    throw error;  
  }  
}; 

//addMovie function for admin to add new movies
export const addMovie = async (movieData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Add movie error:', error);
    throw error;
  }
};








export const getCelebrities = async () => {
  // Replace with real API
  const res = await fetch('/api/celebrities');
  return await res.json();
};

export const getAwards = async () => {
  // Replace with real API
  const res = await fetch('/api/awards');
  return await res.json();
};

export const deleteContentById = async (id) => {
  const res = await fetch(`/api/content/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete content');
  }

  return await res.json();
};


export const deleteCelebrityById = async (id) => {
  return fetch(`/api/celebrities/${id}`, { method: 'DELETE' });
};


export const deleteAwardById = async (id) => {  
  const res = await fetch(`/api/awards/${id}`, {  
    method: 'DELETE'  
  });  
  
  if (!res.ok) {  
    const errorData = await res.json();  
    throw new Error(errorData.error || 'Failed to delete award');  
  }  
  
  return await res.json();  
};  

// Add these functions for movie details functionality

export const rateMovie = async (movieId, rating, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: rating,
        user_id: userId
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Rate movie error:', error);
    throw error;
  }
};

export const getUserRating = async (movieId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/rating/${userId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get user rating error:', error);
    throw error;
  }
};

export const removeRating = async (movieId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/rating`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Remove rating error:', error);
    throw error;
  }
};


export const markAsVisited = async (movieId) => {
  // Mark movie as visited
};

export const submitReview = async (movieId, reviewText, userId, spoilerAlert = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: reviewText,
        user_id: userId,
        spoiler_alert: spoilerAlert
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Submit review error:', error);
    throw error;
  }
};

export const submitReaction = async (reviewId, reactionType, value, userId) => {
  try {
    console.log('Submitting reaction:', { reviewId, reactionType, value, userId });
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: reactionType,
        value: value,
        user_id: userId
      }),
    });
    
    const result = await handleResponse(response);
    console.log('Reaction response:', result);
    return result;
  } catch (error) {
    console.error('Submit reaction error:', error);
    throw error;
  }
};

export const getUserReactions = async (movieId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/reactions/${movieId}/${userId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get user reactions error:', error);
    throw error;
  }
};

// Edit a review
export const editReview = async (reviewId, reviewText, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: reviewText,
        user_id: userId
      }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Edit review error:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId
      }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Delete review error:', error);
    throw error;
  }
};

//new start 

export const getRatingDistribution = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/rating-distribution`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch rating distribution');
    }

    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Error in getRatingDistribution:', error);
    throw error;
  }
};

// Get similar movies by genres
export const getSimilarMovies = async (genres, excludeId) => {
  try {
    // Make sure genres is an array and excludeId is a number
    const genresParam = Array.isArray(genres) ? genres.join(',') : genres;
    const response = await fetch(`${API_BASE_URL}/movies/similar?genres=${encodeURIComponent(genresParam)}&excludeId=${excludeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleResponse(response);
    return data || []; // Ensure we always return an array
  } catch (error) {
    console.error('Get similar movies error:', error);
    return []; // Return empty array on error
  }
};

// ==================== ADVANCED SEARCH API FUNCTIONS START ====================

// Advanced search for movies and series
export const advancedSearch = async (filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Advanced search error:', error);
    throw error;
  }
};

// Advanced search for celebrities
export const searchCelebrities = async (filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/celebrities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Celebrity search error:', error);
    throw error;
  }
};

// Get all available genres
export const getGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/genres`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get genres error:', error);
    throw error;
  }
};

// Get all available languages
export const getLanguages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get languages error:', error);
    throw error;
  }
};

// Get all available countries
export const getCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get countries error:', error);
    throw error;
  }
};

// ==================== ADVANCED SEARCH API FUNCTIONS END ====================



//new code added from here 
export const getAllContent = async () => {
  const res = await fetch('/api/content');
  
  return await res.json();
};

export const getAllCelebrities = async () => {
  const res = await fetch('/api/celebrities');
  return await res.json();
};

export const getAllAwards = async () => {
  const res = await fetch('/api/awards');
  return await res.json();
};

export const getCelebrityById = async (id) => {
  const res = await fetch(`/api/celebrities/${id}`);
  if (!res.ok) throw new Error("Failed to fetch celebrity");
  return res.json();
};




export const checkContentExists = async (title, release_date, type) => {
  const query = new URLSearchParams({
    title,
    release_date,
    type
  }).toString();

  console.log('Checking content exists mewwoooww with query:', query); // Debugging line

  const res = await fetch(`/api/check-content-exists?${query}`);

  console.log(' after meooowwwwww  '); // Debugging line
  if (!res.ok) {
    throw new Error('Failed to check if content exists');
  }

  const data = await res.json();
  return data.exists;
};


export const addContent = async (contentData) => {  
  try {  
    const response = await fetch('/api/content', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify(contentData),  
    });  
  
    if (!response.ok) {  
      throw new Error(`HTTP error! status: ${response.status}`);  
    }  
  
    const result = await response.json();  
    return result; // This should contain { message: '...', content_id: ..., success: true }  
  } catch (error) {  
    console.error('Error in addContent:', error);  
    throw error;  
  }  
}; 


export const addCelebrity = async (celebrityData) => {  
  try {  
    const response = await fetch('/api/celebrities', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify(celebrityData),  
    });  
  
    if (!response.ok) {  
      throw new Error(`HTTP error! status: ${response.status}`);  
    }  
  
    const result = await response.json();  
    return result; // This should contain { message: '...', celebrity_id: ..., success: true }  
  } catch (error) {  
    console.error('Error in addCelebrity:', error);  
    throw error;  
  }  
};


export const checkCelebrityExists = async (name, birth_date) => {
  const query = new URLSearchParams({
    name,
    birth_date
  }).toString();

  const res = await fetch(`/api/check-celebrity-exists?${query}`);

  if (!res.ok) {
    throw new Error('Failed to check if celebrity exists');
  }

  const data = await res.json();
  return data.exists;
};


export const deleteCelebrity = async (id) => {
  const res = await fetch(`/api/celebrities/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete celebrity');
  }

  return await res.json();
};



// Search functions for content, celebrities, and awards

export const searchContent = async (query) => {  
  const res = await fetch(`/api/search/content?q=${encodeURIComponent(query)}`);  
  return await res.json();  
};




  
// export const searchCelebrities = async (query) => {  
//   const res = await fetch(`/api/search/celebrities?q=${encodeURIComponent(query)}`);  
//   return await res.json();  
// };  
  
export const searchAwards = async (query) => {  
  const res = await fetch(`/api/search/awards?q=${encodeURIComponent(query)}`);  
  return await res.json();  
};  
  
export const addSeries = async (seriesData) => {  
  try {  
    const response = await fetch('/api/series', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(seriesData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to add series: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in addSeries:', err);  
    throw err;  
  }  
};  



export const validateCelebrities = async (directors, top_cast) => {  
  try {  
    const response = await fetch('/api/validate-celebrities', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({ directors, top_cast })  
    });  
  
    if (!response.ok) {  
      throw new Error('Failed to validate celebrities');  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in validateCelebrities:', err);  
    throw err;  
  }  
};  


export const getCelebrityMovies = async (celebrityId) => {  
  try {  
    const res = await fetch(`/api/celebrities/${celebrityId}/movies`);  
    if (!res.ok) {  
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));  
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);  
    }  
    return await res.json();  
  } catch (error) {  
    console.error('Get celebrity movies error:', error);  
    throw error;  
  }  
};  
  
export const getCelebrityAwards = async (celebrityId) => {  
  try {  
    const res = await fetch(`/api/celebrities/${celebrityId}/awards`);  
    if (!res.ok) {  
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));  
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);  
    }  
    return await res.json();  
  } catch (error) {  
    console.error('Get celebrity awards error:', error);  
    throw error;  
  }  
};  


// Favourite celebrities functions  
export const addToFavouriteCelebrities = async (userId, celebrityId) => {  
  try {  
    const response = await fetch(`${API_BASE_URL}/user-fav-celeb`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify({  
        registered_user_id: userId,  
        celebrity_id: celebrityId  
      })  
    });  
    return await handleResponse(response);  
  } catch (error) {  
    console.error('Add to favourite celebrities error:', error);  
    throw error;  
  }  
};  
  
export const getFavouriteCelebrities = async (userId) => {  
  try {  
    const response = await fetch(`${API_BASE_URL}/user-fav-celeb/${userId}`, {  
      method: 'GET',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
    });  
    return await handleResponse(response);  
  } catch (error) {  
    console.error('Get favourite celebrities error:', error);  
    throw error;  
  }  
};  
  
export const removeFromFavouriteCelebrities = async (userId, celebrityId) => {  
  try {  
    const response = await fetch(`${API_BASE_URL}/user-fav-celeb/${userId}/${celebrityId}`, {  
      method: 'DELETE',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
    });  
    return await handleResponse(response);  
  } catch (error) {  
    console.error('Remove from favourite celebrities error:', error);  
    throw error;  
  }  
};


export const getRelatedCelebrities = async (celebrityId) => {  
  try {  
    const res = await fetch(`${API_BASE_URL}/api/celebrities/${celebrityId}/related`);  
    if (!res.ok) {  
      throw new Error(`HTTP error! status: ${res.status}`);  
    }  
    return await res.json();  
  } catch (error) {  
    console.error('Get related celebrities error:', error);  
    throw error;  
  }  
};  



// Update functions for edit functionality  
export const updateContent = async (id, contentData) => {  
  try {  
    const response = await fetch(`/api/content/${id}`, {  
      method: 'PUT',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(contentData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to update content: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in updateContent:', err);  
    throw err;  
  }  
};  
  
export const updateCelebrity = async (id, celebrityData) => {  
  try {  
    const response = await fetch(`/api/celebrities/${id}`, {  
      method: 'PUT',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(celebrityData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to update celebrity: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in updateCelebrity:', err);  
    throw err;  
  }  
};  
  
export const updateAward = async (id, awardData) => {  
  try {  
    const response = await fetch(`/api/awards/${id}`, {  
      method: 'PUT',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(awardData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to update award: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in updateAward:', err);  
    throw err;  
  }  
};  
  
// Fix the addAward function  
export const addAward = async (awardData) => {  
  try {  
    const response = await fetch('/api/awards', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(awardData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to add award: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in addAward:', err);  
    throw err;  
  }  
};  


export const checkAwardExists = async (name, year) => {  
  const query = new URLSearchParams({  
    name,  
    year  
  }).toString();  
  
  const res = await fetch(`/api/check-award-exists?${query}`);  
  
  if (!res.ok) {  
    throw new Error('Failed to check if award exists');  
  }  
  
  const data = await res.json();  
  return data.exists;  
};  


// Get series details with seasons and episodes  
export const getSeriesDetails = async (seriesId) => {  
  try {  
    const response = await fetch(`/api/series/${seriesId}`);  
    if (!response.ok) {  
      throw new Error('Failed to fetch series details');  
    }  
    return await response.json();  
  } catch (err) {  
    console.error('Error in getSeriesDetails:', err);  
    throw err;  
  }  
}; 


// Add images for content  
export const addContentImages = async (contentId, imageUrls) => {  
  try {  
    const response = await fetch(`/api/content/${contentId}/images`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({ imageUrls })  
    });  
      
    if (!response.ok) {  
      throw new Error('Failed to add content images');  
    }  
      
    return await response.json();  
  } catch (err) {  
    console.error('Error adding content images:', err);  
    throw err;  
  }  
};  
  
// Add images for celebrity  
export const addCelebrityImages = async (celebrityId, imageUrls) => {  
  try {  
    const response = await fetch(`/api/celebrities/${celebrityId}/images`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({ imageUrls })  
    });  
      
    if (!response.ok) {  
      throw new Error('Failed to add celebrity images');  
    }  
      
    return await response.json();  
  } catch (err) {  
    console.error('Error adding celebrity images:', err);  
    throw err;  
  }  
};  
  
// Update series with seasons and episodes  
export const updateSeries = async (seriesId, seriesData) => {  
  try {  
    const response = await fetch(`/api/series/${seriesId}`, {  
      method: 'PUT',  
      headers: {  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify(seriesData)  
    });  
  
    if (!response.ok) {  
      const errorText = await response.text();  
      throw new Error(`Failed to update series: ${errorText}`);  
    }  
  
    return await response.json();  
  } catch (err) {  
    console.error('Error in updateSeries:', err);  
    throw err;  
  }  
}; 
