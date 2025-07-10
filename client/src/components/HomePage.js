// import React, { useState, useEffect } from 'react';
// import { getMovies, searchMovies, getMovieDetails } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// // Import new components
// import HeroSection from '../components/HeroSection';
// import TrendingSection from '../components/TrendingSection';
// import MovieSection from '../components/MovieSection';
// import CelebritySection from '../components/CelebritySection';
// import Footer from '../components/Footer';

// // Import styles
// import '../styles/animations.css';

// const HomePage = ({ user, onAuthRequired }) => {
//   const navigate = useNavigate();
//   const [movies, setMovies] = useState({
//     topRated: [],
//     mostViewed: [],
//     upcoming: []
//   });
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

//   const handleMovieClick = async (movieId) => {
//     try {
//       alert(`Opening movie details for movie ID: ${movieId}`);
//       navigate(`/movie/${movieId}`);
//     } catch (error) {
//       alert(`Opening movie details for movie ID: ${movieId}`);
//       console.log('Movie details error:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="main-content">
//         <div className="loading">Loading movies...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="homepage">
//       {/* Hero Section with animated welcome text */}
//       <HeroSection />

//       {/* Trending Section with animated carousel */}
//       <TrendingSection 
//         movies={movies.mostViewed} 
//         onMovieClick={handleMovieClick}
//       />

//       {/* Main Content Container */}
//       <main className="main-content">
//         {/* Movie Sections with scroll animations */}
//         <MovieSection 
//           title="Top Rated Movies" 
//           movies={movies.topRated}
//           onMovieClick={handleMovieClick}
//         />
        
//         <MovieSection 
//           title="Upcoming Movies" 
//           movies={movies.upcoming}
//           onMovieClick={handleMovieClick}
//         />

//         {/* Born Today Celebrities Section */}
//         <CelebritySection />
//       </main>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };

// export default HomePage;



import React, { useState, useEffect } from 'react';
// ==================== FILMFUSION IMPORTS UPDATE START ====================
import { 
  getTopRatedMovies, 
  getMostViewedMovies, 
  getPopularSeries, 
  getPopularCelebrities,
  searchMovies, 
  getMovieDetails 
} from '../services/api';
// ==================== FILMFUSION IMPORTS UPDATE END ====================
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
  
  // ==================== FILMFUSION STATE UPDATE START ====================
  const [data, setData] = useState({
    topRatedMovies: [],
    mostViewedMovies: [],
    popularSeries: [],
    popularCelebrities: []
  });
  // ==================== FILMFUSION STATE UPDATE END ====================
  
  const [loading, setLoading] = useState(true);

  // ==================== FILMFUSION SAMPLE DATA UPDATE START ====================
  // Sample data updated for new structure
  const sampleData = {
    topRatedMovies: [
      { id: 1, title: "The Shawshank Redemption", year: "1994", rating: 9.3, poster: null },
      { id: 2, title: "The Godfather", year: "1972", rating: 9.2, poster: null },
      { id: 3, title: "The Dark Knight", year: "2008", rating: 9.0, poster: null },
      { id: 4, title: "The Godfather Part II", year: "1974", rating: 9.0, poster: null },
      { id: 5, title: "12 Angry Men", year: "1957", rating: 9.0, poster: null },
      { id: 6, title: "Schindler's List", year: "1993", rating: 8.9, poster: null }
    ],
    mostViewedMovies: [
      { id: 7, title: "Avengers: Endgame", year: "2019", rating: 8.4, poster: null, views: 2500000 },
      { id: 8, title: "Spider-Man: No Way Home", year: "2021", rating: 8.2, poster: null, views: 2200000 },
      { id: 9, title: "Top Gun: Maverick", year: "2022", rating: 8.3, poster: null, views: 1800000 },
      { id: 10, title: "Avatar", year: "2009", rating: 7.9, poster: null, views: 1700000 },
      { id: 11, title: "Black Panther", year: "2018", rating: 7.3, poster: null, views: 1500000 },
      { id: 12, title: "Jurassic World", year: "2015", rating: 7.0, poster: null, views: 1400000 }
    ],
    popularSeries: [
      { id: 13, title: "Breaking Bad", year: "2008", rating: 9.5, poster: null, season_count: 5 },
      { id: 14, title: "Game of Thrones", year: "2011", rating: 9.3, poster: null, season_count: 8 },
      { id: 15, title: "Stranger Things", year: "2016", rating: 8.7, poster: null, season_count: 4 },
      { id: 16, title: "The Office", year: "2005", rating: 8.9, poster: null, season_count: 9 },
      { id: 17, title: "Friends", year: "1994", rating: 8.9, poster: null, season_count: 10 },
      { id: 18, title: "The Crown", year: "2016", rating: 8.6, poster: null, season_count: 6 }
    ],
    popularCelebrities: [
      { id: 19, name: "Robert Downey Jr.", bio: "American actor known for Iron Man", birth_date: "1965-04-04", photo: null, movie_count: 45 },
      { id: 20, name: "Scarlett Johansson", bio: "American actress and singer", birth_date: "1984-11-22", photo: null, movie_count: 38 },
      { id: 21, name: "Leonardo DiCaprio", bio: "American actor and film producer", birth_date: "1974-11-11", photo: null, movie_count: 35 },
      { id: 22, name: "Tom Hanks", bio: "American actor and filmmaker", birth_date: "1956-07-09", photo: null, movie_count: 42 },
      { id: 23, name: "Meryl Streep", bio: "American actress", birth_date: "1949-06-22", photo: null, movie_count: 52 },
      { id: 24, name: "Samuel L. Jackson", bio: "American actor", birth_date: "1948-12-21", photo: null, movie_count: 68 }
    ]
  };
  // ==================== FILMFUSION SAMPLE DATA UPDATE END ====================

  useEffect(() => {
    loadAllData();
  }, []);

  // ==================== FILMFUSION LOAD DATA UPDATE START ====================
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API, fallback to sample data
      try {
        const [topRatedResponse, mostViewedResponse, popularSeriesResponse, popularCelebritiesResponse] = await Promise.all([
          getTopRatedMovies(),
          getMostViewedMovies(),
          getPopularSeries(),
          getPopularCelebrities()
        ]);
        
        setData({
          topRatedMovies: topRatedResponse.movies || sampleData.topRatedMovies,
          mostViewedMovies: mostViewedResponse.movies || sampleData.mostViewedMovies,
          popularSeries: popularSeriesResponse.series || sampleData.popularSeries,
          popularCelebrities: popularCelebritiesResponse.celebrities || sampleData.popularCelebrities
        });
      } catch (apiError) {
        console.log('API not available, using sample data');
        setData(sampleData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData(sampleData);
    } finally {
      setLoading(false);
    }
  };
  // ==================== FILMFUSION LOAD DATA UPDATE END ====================

  const handleMovieClick = async (movieId) => {
    try {
      alert(`Opening movie details for movie ID: ${movieId}`);
      navigate(`/movie/${movieId}`);
    } catch (error) {
      alert(`Opening movie details for movie ID: ${movieId}`);
      console.log('Movie details error:', error);
    }
  };

  // ==================== FILMFUSION CELEBRITY CLICK HANDLER START ====================
  const handleCelebrityClick = async (celebrityId) => {
    try {
      alert(`Opening celebrity details for celebrity ID: ${celebrityId}`);
      navigate(`/celebrity/${celebrityId}`);
    } catch (error) {
      alert(`Opening celebrity details for celebrity ID: ${celebrityId}`);
      console.log('Celebrity details error:', error);
    }
  };
  // ==================== FILMFUSION CELEBRITY CLICK HANDLER END ====================

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section with animated welcome text */}
      <HeroSection />

      {/* ==================== FILMFUSION SECTIONS UPDATE START ==================== */}
      {/* Trending Section with top rated movies */}
      <TrendingSection 
        title="Trending Movies"
        movies={data.topRatedMovies} 
        onMovieClick={handleMovieClick}
      />

      {/* Main Content Container */}
      <main className="main-content">
        {/* Top Viewed Movies Section */}
        <MovieSection 
          title="Most Viewed Movies" 
          movies={data.mostViewedMovies}
          onMovieClick={handleMovieClick}
        />
        
        {/* Popular Series Section (replacing upcoming movies) */}
        <MovieSection 
          title="Popular Series" 
          movies={data.popularSeries}
          onMovieClick={handleMovieClick}
          isSeriesSection={true}
        />

        {/* Popular Celebrities Section (updated) */}
        <CelebritySection 
          title="Popular Celebrities"
          celebrities={data.popularCelebrities}
          onCelebrityClick={handleCelebrityClick}
        />
      </main>
      {/* ==================== FILMFUSION SECTIONS UPDATE END ==================== */}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;