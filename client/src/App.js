import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import components
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import MovieDetails from './components/MovieDetails';
import SearchResults from './components/SearchResults';
import AdvancedSearch from './components/AdvancedSearch';
import CelebrityProfile from './components/CelebrityProfile';
import SeasonsEpisodes from './components/SeasonsEpisodes';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AuthPage from './components/AuthPage';

// Import styles
import './App.css';

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal states
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
      }
    }
  }, []);

  // Authentication handlers
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setShowSignInModal(false);
    setShowSignUpModal(false);
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowSignUpModal(true);
    setShowSignInModal(false);
  };

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
    }
  };

  const handleSwitchMode = () => {
    if (authMode === 'signin') {
      setAuthMode('signup');
      setShowSignInModal(false);
      setShowSignUpModal(true);
    } else {
      setAuthMode('signin');
      setShowSignUpModal(false);
      setShowSignInModal(true);
    }
  };

  const closeModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <Navigation 
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content Routes */}
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                user={currentUser}
                onAuthRequired={handleAuthRequired}
              />
            } 
          />
          
          <Route 
            path="/movie/:id" 
            element={
              <MovieDetails 
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onAuthRequired={handleAuthRequired}
              />
            } 
          />
          
          <Route 
            path="/search" 
            element={
              <SearchResults 
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onAuthRequired={handleAuthRequired}
              />
            } 
          />
          
          <Route 
            path="/advanced-search" 
            element={<AdvancedSearch />} 
          />
          
          <Route 
            path="/celebrity/:id" 
            element={
              <CelebrityProfile 
                currentUser={currentUser}
              />
            } 
          />
          
          <Route 
            path="/series/:id/seasons" 
            element={<SeasonsEpisodes />} 
          />
          
          <Route 
            path="/admin-dashboard" 
            element={
              isAuthenticated && currentUser?.role === 'admin' ? (
                <AdminDashboard currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/user-dashboard" 
            element={
              isAuthenticated ? (
                <UserDashboard 
                  currentUser={currentUser}
                  isAuthenticated={isAuthenticated}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Authentication Modals */}
      {showSignInModal && (
        <AuthPage
          mode="signin"
          onClose={closeModals}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={handleSwitchMode}
        />
      )}

      {showSignUpModal && (
        <AuthPage
          mode="signup"
          onClose={closeModals}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={handleSwitchMode}
        />
      )}
    </div>
  );
};

export default App;
