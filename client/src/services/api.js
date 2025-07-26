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



export const addContent = async (movieData) => {
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movieData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add content: ${errorText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error in addContent:', err);
    throw err;
  }
};



// Add these at the end or export them in your existing export block
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
      const errorText = await response.text();
      throw new Error(`Failed to add celebrity: ${errorText}`);
    }

    return await response.json();
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




  
export const searchCelebrities = async (query) => {  
  const res = await fetch(`/api/search/celebrities?q=${encodeURIComponent(query)}`);  
  return await res.json();  
};  
  
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






