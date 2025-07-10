// import React, { useState } from 'react';
// import Navigation from './components/Navigation';
// import HomePage from './components/HomePage';
// import AuthPage from './components/AuthPage';
// import MovieDetails from './components/MovieDetails';
// import './App.css';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import UserDashboard from './components/UserDashboard';

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showAuth, setShowAuth] = useState(false);
//   const [authMode, setAuthMode] = useState('signin');

//   const handleAuthSuccess = (user) => {
//     setCurrentUser(user);
//     setIsAuthenticated(true);
//     setShowAuth(false);
//   };

//   const handleSignOut = () => {
//     setCurrentUser(null);
//     setIsAuthenticated(false);
//   };

//   const openSignIn = () => {
//     setAuthMode('signin');
//     setShowAuth(true);
//   };

//   const openSignUp = () => {
//     setAuthMode('signup');
//     setShowAuth(true);
//   };

//   const closeAuth = () => {
//     setShowAuth(false);
//   };

//   return (
//     //<Router>
//       <div className="App">
//         <Navigation 
//           currentUser={currentUser}
//           isAuthenticated={isAuthenticated}
//           onSignIn={openSignIn}
//           onSignOut={handleSignOut}
//         />

//         <Routes>
//           <Route 
//             path="/" 
//             element={
//               <HomePage 
//                 isAuthenticated={isAuthenticated} 
//                 user={currentUser} 
//                 onSignIn={openSignIn} 
//                 onAuthRequired={() => setShowAuth(true)}
//               />
//             } 
//           />
//           <Route 
//             path="/movie/:id" 
//             element={
//               <MovieDetails 
//                 isAuthenticated={isAuthenticated} 
//                 currentUser={currentUser} 
//                 onAuthRequired={() => setShowAuth(true)} 
//               />
//             } 
//           />
//           <Route 
//             path="/dashboard" 
//             element={
//               <UserDashboard 
//                 currentUser={currentUser} 
//                 isAuthenticated={isAuthenticated} 
//               />
//             } 
//           />
//         </Routes>

//         {showAuth && (
//           <AuthPage 
//             mode={authMode}
//             onClose={closeAuth}
//             onAuthSuccess={handleAuthSuccess}
//             onSwitchMode={(mode) => setAuthMode(mode)}
//           />
//         )}
//       </div>
//     //</Router>
//   );
// }

// export default App;
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import MovieDetails from './components/MovieDetails';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

import './App.css';

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

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
      {/* Only show Navigation on the homepage */}
      {location.pathname === '/' && (
        <Navigation
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onSignIn={openSignIn}
          onSignOut={handleSignOut}
        />
      )}

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
