// import React, { useState, useEffect } from 'react';
// import { getMovies, searchMovies, getMovieDetails } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// const HomePage = ({ user, onAuthRequired }) => {
//   const navigate = useNavigate();
//   const [movies, setMovies] = useState({
//     topRated: [],
//     mostViewed: [],
//     upcoming: []
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);

//   // Sample movie data (fallback if API is not available)
//   const sampleMovies = {
//     topRated: [
//       { id: 1, title: "The Shawshank Redemption", year: "1994", rating: 9.3, poster: null },
//       { id: 2, title: "The Godfather", year: "1972", rating: 9.2, poster: null },
//       { id: 3, title: "The Dark Knight", year: "2008", rating: 9.0, poster: null },
//       { id: 4, title: "The Godfather Part II", year: "1974", rating: 9.0, poster: null },
//       { id: 5, title: "12 Angry Men", year: "1957", rating: 9.0, poster: null },
//       { id: 6, title: "Schindler's List", year: "1993", rating: 8.9, poster: null }
//     ],
//     mostViewed: [
//       { id: 7, title: "Avengers: Endgame", year: "2019", rating: 8.4, poster: null },
//       { id: 8, title: "Spider-Man: No Way Home", year: "2021", rating: 8.2, poster: null },
//       { id: 9, title: "Top Gun: Maverick", year: "2022", rating: 8.3, poster: null },
//       { id: 10, title: "Avatar", year: "2009", rating: 7.9, poster: null },
//       { id: 11, title: "Black Panther", year: "2018", rating: 7.3, poster: null },
//       { id: 12, title: "Jurassic World", year: "2015", rating: 7.0, poster: null }
//     ],
//     upcoming: [
//       { id: 13, title: "Dune: Part Three", year: "2026", rating: null, poster: null },
//       { id: 14, title: "Avatar 3", year: "2025", rating: null, poster: null },
//       { id: 15, title: "Marvel's Blade", year: "2025", rating: null, poster: null },
//       { id: 16, title: "Superman: Legacy", year: "2025", rating: null, poster: null },
//       { id: 17, title: "Mission: Impossible 8", year: "2025", rating: null, poster: null },
//       { id: 18, title: "Fantastic Four", year: "2025", rating: null, poster: null }
//     ]
//   };

//   useEffect(() => {
//     loadMovies();
//   }, []);

//   const loadMovies = async () => {
//     try {
//       setLoading(true);
//       // Try to fetch from API, fallback to sample data
//       try {
//         const topRated = await getMovies('top-rated');
//         const mostViewed = await getMovies('most-viewed');
//         const upcoming = await getMovies('upcoming');
        
//         setMovies({
//           topRated: topRated.movies || sampleMovies.topRated,
//           mostViewed: mostViewed.movies || sampleMovies.mostViewed,
//           upcoming: upcoming.movies || sampleMovies.upcoming
//         });
//       } catch (apiError) {
//         console.log('API not available, using sample data');
//         setMovies(sampleMovies);
//       }
//     } catch (error) {
//       console.error('Error loading movies:', error);
//       setMovies(sampleMovies);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchTerm.trim()) return;

//     try {
//       const results = await searchMovies(searchTerm);
//       // Handle search results - you might want to navigate to a search results page
//       alert(`Searching for: "${searchTerm}"`);
//       console.log('Search results:', results);
//     } catch (error) {
//       alert(`Searching for: "${searchTerm}"`);
//       console.log('Search error:', error);
//     }
//   };

//   const handleMovieClick = async (movieId) => {
//     try {
//     //   const movieDetails = await getMovieDetails(movieId);
//       // Handle movie details - you might want to navigate to a movie details page
//       alert(`Opening movie details for movie ID: ${movieId}`);
//     //   console.log('Movie details:', movieDetails);
//       navigate(`/movie/${movieId}`);
//     } catch (error) {
//       alert(`Opening movie details for movie ID: ${movieId}`);
//       console.log('Movie details error:', error);
//     }
//   };

//   const handleWatchlistClick = () => {
//     if (!user) {
//       alert('Please sign in to add movies to your watchlist');
//       onAuthRequired();
//     } else {
//       alert('Watchlist feature - you are signed in!');
//     }
//   };

//   const MovieCard = ({ movie }) => (
//     <div className="movie-card" onClick={() => handleMovieClick(movie.id)}>
//       <div className="movie-poster">
//         {movie.poster ? (
//           <img src={movie.poster} alt={movie.title} />
//         ) : (
//           'No Image Available'
//         )}
//       </div>
//       <div className="movie-info">
//         <div className="movie-title">{movie.title}</div>
//         <div className="movie-year">{movie.year}</div>
//         {movie.rating ? (
//           <div className="movie-rating">
//             <span className="star">★</span>
//             <span>{movie.rating}</span>
//           </div>
//         ) : (
//           <div className="movie-rating">Coming Soon</div>
//         )}
//       </div>
//     </div>
//   );

//   const MovieSection = ({ title, movies }) => (
//     <section className="section">
//       <h2 className="section-title">{title}</h2>
//       <div className="movies-grid">
//         {movies.map(movie => (
//           <MovieCard key={movie.id} movie={movie} />
//         ))}
//       </div>
//     </section>
//   );

//   if (loading) {
//     return (
//       <div className="main-content">
//         <div className="loading">Loading movies...</div>
//       </div>
//     );
//   }

//   return (
//     <main className="main-content">
//       {/* Search Section */}
//       {/* <div className="search-section">
//         <form onSubmit={handleSearch} className="search-form">
//           <div className="search-container">
//             <input
//               type="text"
//               className="search-bar"
//               placeholder="Search for movies, TV shows, documentaries..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <button type="submit" className="search-btn">🔍</button>
//           </div>
//         </form>
//       </div> */}

//       {/* Watchlist Button */}
//       {/* <div className="watchlist-section">
//         <button className="watchlist-btn" onClick={handleWatchlistClick}>
//           ⭐ Watchlist
//         </button>
//       </div> */}

//       {/* Movie Sections */}
//       <MovieSection title="Top Rated Movies" movies={movies.topRated} />
//       <MovieSection title="Most Viewed Movies" movies={movies.mostViewed} />
//       <MovieSection title="Upcoming Movies" movies={movies.upcoming} />
//     </main>
//   );
// };

// export default HomePage;

import React, { useState, useEffect } from 'react';
import { getMovies, searchMovies, getMovieDetails } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Import new components
import HeroSection from '../components/HeroSection';
import TrendingSection from '../components/TrendingSection';
import MovieSection from '../components/MovieSection';
import CelebritySection from '../components/CelebritySection';
import Footer from '../components/Footer';

// Import styles
import '../styles/animations.css';

const HomePage = ({ user, onAuthRequired }) => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState({
    topRated: [],
    mostViewed: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);

  // Sample movie data (fallback if API is not available)
  const sampleMovies = {
    topRated: [
      { id: 1, title: "The Shawshank Redemption", year: "1994", rating: 9.3, poster: null },
      { id: 2, title: "The Godfather", year: "1972", rating: 9.2, poster: null },
      { id: 3, title: "The Dark Knight", year: "2008", rating: 9.0, poster: null },
      { id: 4, title: "The Godfather Part II", year: "1974", rating: 9.0, poster: null },
      { id: 5, title: "12 Angry Men", year: "1957", rating: 9.0, poster: null },
      { id: 6, title: "Schindler's List", year: "1993", rating: 8.9, poster: null }
    ],
    mostViewed: [
      { id: 7, title: "Avengers: Endgame", year: "2019", rating: 8.4, poster: null },
      { id: 8, title: "Spider-Man: No Way Home", year: "2021", rating: 8.2, poster: null },
      { id: 9, title: "Top Gun: Maverick", year: "2022", rating: 8.3, poster: null },
      { id: 10, title: "Avatar", year: "2009", rating: 7.9, poster: null },
      { id: 11, title: "Black Panther", year: "2018", rating: 7.3, poster: null },
      { id: 12, title: "Jurassic World", year: "2015", rating: 7.0, poster: null }
    ],
    upcoming: [
      { id: 13, title: "Dune: Part Three", year: "2026", rating: null, poster: null },
      { id: 14, title: "Avatar 3", year: "2025", rating: null, poster: null },
      { id: 15, title: "Marvel's Blade", year: "2025", rating: null, poster: null },
      { id: 16, title: "Superman: Legacy", year: "2025", rating: null, poster: null },
      { id: 17, title: "Mission: Impossible 8", year: "2025", rating: null, poster: null },
      { id: 18, title: "Fantastic Four", year: "2025", rating: null, poster: null }
    ]
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to sample data
      try {
        const topRated = await getMovies('top-rated');
        const mostViewed = await getMovies('most-viewed');
        const upcoming = await getMovies('upcoming');
        
        setMovies({
          topRated: topRated.movies || sampleMovies.topRated,
          mostViewed: mostViewed.movies || sampleMovies.mostViewed,
          upcoming: upcoming.movies || sampleMovies.upcoming
        });
      } catch (apiError) {
        console.log('API not available, using sample data');
        setMovies(sampleMovies);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies(sampleMovies);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movieId) => {
    try {
      alert(`Opening movie details for movie ID: ${movieId}`);
      navigate(`/movie/${movieId}`);
    } catch (error) {
      alert(`Opening movie details for movie ID: ${movieId}`);
      console.log('Movie details error:', error);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section with animated welcome text */}
      <HeroSection />

      {/* Trending Section with animated carousel */}
      <TrendingSection 
        movies={movies.mostViewed} 
        onMovieClick={handleMovieClick}
      />

      {/* Main Content Container */}
      <main className="main-content">
        {/* Movie Sections with scroll animations */}
        <MovieSection 
          title="Top Rated Movies" 
          movies={movies.topRated}
          onMovieClick={handleMovieClick}
        />
        
        <MovieSection 
          title="Upcoming Movies" 
          movies={movies.upcoming}
          onMovieClick={handleMovieClick}
        />

        {/* Born Today Celebrities Section */}
        <CelebritySection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;