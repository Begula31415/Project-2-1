// import React from 'react';
// import { useParams } from 'react-router-dom';
// // import './MovieDetails.css'; // Update this path if it's in a different folder

// const MovieDetails = ({ isAuthenticated, currentUser, onAuthRequired }) => {
//   const { id } = useParams();

//   // Simulated data for now, replace with API call later
//   const movie = {
//     id,
//     title: 'The Dark Knight',
//     year: 2008,
//     rating: 9.0,
//     plot: 'Batman faces the Joker...',
//     cast: ['Christian Bale', 'Heath Ledger', 'Gary Oldman'],
//     trailer: '🎬 Trailer Here',
//     poster: null,
//     awards: '2 Oscars',
//     duration: '152 min',
//     language: 'English',
//     country: 'USA',
//     boxOffice: '$1.005 billion',
//   };

//   return (
//     <div className="movie-details-page">
//       <div className="movie-header">
//         <h1>{movie.title} ({movie.year})</h1>
//         <p>{movie.rating} ★</p>
//       </div>

//       <div className="movie-content">
//         <div className="left">
//           <div className="poster">{movie.poster || 'No Image Available'}</div>
//         </div>
//         <div className="center">
//           <h2>Plot</h2>
//           <p>{movie.plot}</p>

//           <h3>Cast</h3>
//           <ul>
//             {movie.cast.map((actor, i) => (
//               <li key={i}>{actor}</li>
//             ))}
//           </ul>

//           <p><strong>Language:</strong> {movie.language}</p>
//           <p><strong>Country:</strong> {movie.country}</p>
//           <p><strong>Box Office:</strong> {movie.boxOffice}</p>
//         </div>
//         <div className="right">
//           <div className="trailer">{movie.trailer}</div>
//           <p><strong>Awards:</strong> {movie.awards}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();

  // Dummy data for now
  const [movie, setMovie] = useState({
    title: "Movie",
    year: "2024",
    rating: 8.5,
    genre: "Drama, Thriller",
    language: "English",
    description: "This movie is a suspenseful story about...",
    poster: "https://via.placeholder.com/300x450"
  });

  useEffect(() => {
    // You could fetch real data based on ID here
    console.log("Fetching movie with ID:", id);
  }, [id]);

  return (
    <div className="movie-details-container">
      <div className="movie-header">
        <h1 className="movie-title">{movie.title} <span className="movie-year">({movie.year})</span></h1>
        <p className="movie-tagline">A gripping thriller you won’t forget</p>
      </div>

      <div className="movie-content">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
        </div>
        <div className="movie-info">
          <p><strong>IMDb Rating:</strong> ⭐ {movie.rating} / 10</p>
          <p><strong>Genre:</strong> {movie.genre}</p>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Description:</strong> {movie.description}</p>

          <div className="movie-buttons">
            <button className="btn">Add to Watchlist</button>
            <button className="btn">Mark as Watched</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;

