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

// Get movie details function
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get movie details error:', error);
    throw error;
  }
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

export const rateMovie = async (movieId, rating) => {
  // Submit rating to backend
};


export const markAsVisited = async (movieId) => {
  // Mark movie as visited
};

export const submitReview = async (movieId, reviewText) => {
  // Submit user review
};