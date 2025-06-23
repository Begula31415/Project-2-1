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

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import './MovieDetails.css';

// const MovieDetails = () => {
//   const { id } = useParams();

//   // Dummy data for now
//   const [movie, setMovie] = useState({
//     title: "Movie Title",
//     year: "2024",
//     rating: 8.5,
//     genre: "Drama, Thriller",
//     language: "English",
//     description: "This movie is a suspenseful story about...",
//     poster: "https://via.placeholder.com/300x450"
//   });

//   useEffect(() => {
//     // You could fetch real data based on ID here
//     console.log("Fetching movie with ID:", id);
//   }, [id]);

//   return (
//     <div className="movie-details-container">
//       <div className="movie-header">
//         <h1 className="movie-title">{movie.title} <span className="movie-year">({movie.year})</span></h1>
//         <p className="movie-tagline">A gripping thriller you won’t forget</p>
//       </div>

//       <div className="movie-content">
//         <div className="movie-poster">
//           <img src={movie.poster} alt={movie.title} />
//         </div>
//         <div className="movie-info">
//           <p><strong>IMDb Rating:</strong> ⭐ {movie.rating} / 10</p>
//           <p><strong>Genre:</strong> {movie.genre}</p>
//           <p><strong>Language:</strong> {movie.language}</p>
//           <p><strong>Description:</strong> {movie.description}</p>

//           <div className="movie-buttons">
//             <button className="btn">Add to Watchlist</button>
//             <button className="btn">Mark as Watched</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails;

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './MovieDetails.module.css';

const dummyMovie = {
  title: "The Dark Knight",
  year: 2008,
  imdbRating: 9.0,
  plot: `When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.`,
  details: [
    { label: "Release Date", value: "July 18, 2008" },
    { label: "Duration", value: "152 minutes" },
    { label: "Language", value: "English" },
    { label: "Type", value: "Movie" },
    { label: "Director", value: "Christopher Nolan" },
    { label: "Writers", value: "Jonathan Nolan, Christopher Nolan" },
    { label: "Budget", value: "$185 million" },
    { label: "Box Office", value: "$1.005 billion" },
    { label: "Age Rating", value: "PG-13" },
    { label: "Country", value: "United States" },
    { label: "Awards", value: "2 Oscars, 159 wins & 163 nominations" },
    { label: "Views", value: "2,450,738" }
  ],
  cast: [
    "Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine",
    "Maggie Gyllenhaal", "Gary Oldman", "Morgan Freeman"
  ],
  reviews: [
    {
      name: "MovieBuff2024",
      rating: 10,
      date: "January 15, 2024",
      text: "Christopher Nolan's masterpiece continues to amaze me every time I watch it. Heath Ledger's performance as the Joker is absolutely phenomenal and deserved every accolade it received. The cinematography, the story, the acting - everything is just perfect."
    },
    {
      name: "CinemaLover",
      rating: 9,
      date: "December 28, 2023",
      text: "One of the best superhero movies ever made. The moral complexity and psychological depth set it apart from typical comic book adaptations. A must-watch for any film enthusiast."
    }
  ],
  poster: null,
  trailer: null,
  photos: Array.from({ length: 8 }, (_, i) => `Photo ${i + 1}`)
};

const MovieDetails = () => {
  const { id } = useParams();
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth
  const [reviewText, setReviewText] = useState('');

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add movies to your watchlist');
      return;
    }
    alert('Movie added to watchlist!');
  };

  const handleMarkVisited = () => {
    if (!isAuthenticated) {
      alert('Please sign in to mark movies as visited');
      return;
    }
    alert('Movie marked as visited!');
  };

  const handleRate = () => {
    if (!isAuthenticated) {
      alert('Please sign in to rate this movie');
      return;
    }
    const rating = prompt('Rate this movie (1-10):');
    if (rating && rating >= 1 && rating <= 10) {
      alert(`You rated this movie ${rating}/10`);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      alert('Please write a review before submitting');
      return;
    }
    alert('Review submitted successfully!');
    setReviewText('');
  };

  return (
    <div className={styles.movieDetailsContainer}>
      <div style={{ color: '#f5c518', marginBottom: 10 }}>
        Movie ID from URL: {id}
      </div>
      {/* Movie Header */}
      <div className={styles.movieHeader}>
        <div>
          <h1 className={styles.movieTitle}>
            {dummyMovie.title}
            <span className={styles.movieYear}>({dummyMovie.year})</span>
          </h1>
          <div className={styles.ratingSection}>
            <div className={styles.imdbRating}>
              <div>
                <div className={styles.ratingLabel}>IMDb RATING</div>
                <div className={styles.ratingValue}>
                  <span className={styles.ratingStars}>★</span>
                  {dummyMovie.imdbRating}
                  <span style={{ color: "#999", fontSize: 16 }}>/10</span>
                </div>
              </div>
            </div>
            <div className={styles.userRating}>
              <div>
                <div className={styles.ratingLabel}>YOUR RATING</div>
                <button className={styles.rateBtn} onClick={handleRate}>★ Rate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainContent}>
        {/* Movie Poster */}
        <div className={styles.moviePosterSection}>
          <div className={styles.moviePoster}>
            {dummyMovie.poster ? (
              <img src={dummyMovie.poster} alt="Movie Poster" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "Movie Poster"
            )}
          </div>
        </div>

        {/* Center Content */}
        <div className={styles.centerContent}>
          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.actionBtn} onClick={handleMarkVisited}>✓ Mark as Visited</button>
            <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleAddToWatchlist}>+ Add to Watchlist</button>
          </div>

          {/* Plot Section */}
          <div className={styles.plotSection}>
            <h2 className={styles.sectionTitle}>Plot</h2>
            <p className={styles.plotText}>{dummyMovie.plot}</p>
          </div>

          {/* Movie Details */}
          <div className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Details</h2>
            <div className={styles.detailsGrid}>
              {dummyMovie.details.map((item, idx) => (
                <div className={styles.detailItem} key={idx}>
                  <span className={styles.detailLabel}>{item.label}</span>
                  <span className={styles.detailValue}>{item.value}</span>
                </div>
              ))}
            </div>
            {/* Cast Section */}
            <div style={{ marginTop: 30 }}>
              <h3 className={styles.sectionTitle}>Cast</h3>
              <div className={styles.castList}>
                {dummyMovie.cast.map((actor, idx) => (
                  <span className={styles.castMember} key={idx}>{actor}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={styles.trailerSection}>
          <h2 className={styles.sectionTitle}>Trailer</h2>
          <div className={styles.trailerPlaceholder}>🎬 Movie Trailer</div>
          <div className={styles.photosCard} onClick={() => setPhotosModalOpen(true)}>
            <div className={styles.photosIcon}>📸</div>
            <div>Photos</div>
            <div style={{ fontSize: 12, color: "#999" }}>View all images</div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>User Reviews</h2>
        {/* Review Form or Prompt */}
        {isAuthenticated ? (
          <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
            <textarea
              className={styles.reviewTextarea}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
            <button className={styles.reviewSubmit} type="submit">Submit Review</button>
          </form>
        ) : (
          <div className={styles.guestLoginPrompt}>
            <p style={{ color: "#999", marginBottom: 10 }}>Sign in to write a review</p>
            <button className={styles.loginPromptBtn} onClick={() => alert('Redirecting to sign in page...')}>Sign In to Review</button>
          </div>
        )}

        {/* Existing Reviews */}
        <div className={styles.existingReviews}>
          {dummyMovie.reviews.map((review, idx) => (
            <div className={styles.reviewItem} key={idx}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewerName}>{review.name}</span>
                <span className={styles.reviewRating}>
                  {"★".repeat(Math.round(review.rating / 2))} {review.rating}/10
                </span>
                <span className={styles.reviewDate}>{review.date}</span>
              </div>
              <p className={styles.reviewText}>{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Photos Modal */}
      {photosModalOpen && (
        <div className={styles.photosModal} onClick={e => { if (e.target.className === styles.photosModal) setPhotosModalOpen(false); }}>
          <div className={styles.photosModalContent}>
            <span className={styles.close} onClick={() => setPhotosModalOpen(false)}>&times;</span>
            <h2 className={styles.sectionTitle}>{dummyMovie.title} - Photos</h2>
            <div className={styles.photosGrid}>
              {dummyMovie.photos.map((photo, idx) => (
                <div className={styles.photoItem} key={idx}>{photo}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;