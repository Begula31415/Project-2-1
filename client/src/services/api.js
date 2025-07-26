//this file working as middle ware between the client and the backend API
const API_BASE_URL = 'http://localhost:5000';

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
export const removeFromWatchlist = async (userId, movieId) => {
  const response = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, movieId })
  });
  return await handleResponse(response);
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


// Add to watchlist function
export const addToWatchlist = async (movieId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movieId, userId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Add to watchlist error:', error);
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
    return await handleResponse(response);
  } catch (error) {
    console.error('Get watchlist error:', error);
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



// Add these at the end or export them in your existing export block

export const addCelebrity = async (data) => {
  // Replace with actual API call
  return fetch('/api/celebrities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const addAward = async (data) => {
  // Replace with actual API call
  return fetch('/api/awards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
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
  return fetch(`/api/content/${id}`, { method: 'DELETE' });
};

export const deleteCelebrityById = async (id) => {
  return fetch(`/api/celebrities/${id}`, { method: 'DELETE' });
};

export const deleteAwardById = async (id) => {
  return fetch(`/api/awards/${id}`, { method: 'DELETE' });
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
