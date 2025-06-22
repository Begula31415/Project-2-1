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