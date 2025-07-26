import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import MovieDetails from './components/MovieDetails';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdvancedSearch from './components/AdvancedSearch';
import CelebrityProfile from './components/CelebrityProfile';

import './App.css';

const TOKEN_KEY = 'filmfusion_token';
const TOKEN_EXPIRY_KEY = 'filmfusion_token_expiry';
const TOKEN_EXPIRY_MINUTES = 60; // Change to 30 for 30 mins

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Save token and expiry
    localStorage.setItem(TOKEN_KEY, JSON.stringify(user));
    localStorage.setItem(
      TOKEN_EXPIRY_KEY,
      (Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toString()
    );
    setShowAuth(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  };

  // On app load, check token and expiry
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (token && expiry) {
      if (Date.now() < parseInt(expiry)) {
        setCurrentUser(JSON.parse(token));
        setIsAuthenticated(true);
      } else {
        // Token expired
        handleSignOut();
      }
    }
  }, []);

  const openSignIn = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const closeAuth = () => setShowAuth(false);

  return (
    <div className="App">
        <Navigation
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onSignIn={openSignIn}
          onSignOut={handleSignOut}
        />

<Routes>
  <Route
    path="/"
    element={
      <HomePage
        isAuthenticated={isAuthenticated}
        user={currentUser}
        onSignIn={openSignIn}
        onAuthRequired={() => setShowAuth(true)}
      />
    }
  />
  <Route
    path="/movie/:id"
    element={
      <MovieDetails
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onAuthRequired={() => setShowAuth(true)}
      />
    }
  />
  <Route
    path="/advanced-search"
    element={
      <AdvancedSearch
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />
    }
  />
  <Route
    path="/dashboard"
    element={
      <UserDashboard
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
      />
    }
  />
  <Route
    path="/admin-dashboard"
    element={
      <AdminDashboard
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
      />
    }
  />

  {/* Add the celebrity dashboard route */}

  <Route

path="/celebrity/:id"

element={

  <CelebrityProfile

    currentUser={currentUser}

    isAuthenticated={isAuthenticated}

  />

}

/>


</Routes>


      {showAuth && (
        <AuthPage
          mode={authMode}
          onClose={closeAuth}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}

export default App;
