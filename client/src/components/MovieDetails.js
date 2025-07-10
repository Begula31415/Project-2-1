// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import styles from './MovieDetails.module.css';

// const dummyMovie = {
//   title: "The Dark Knight",
//   year: 2008,
//   imdbRating: 9.0,
//   plot: `When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.`,
//   details: [
//     { label: "Release Date", value: "July 18, 2008" },
//     { label: "Duration", value: "152 minutes" },
//     { label: "Language", value: "English" },
//     { label: "Type", value: "Movie" },
//     { label: "Director", value: "Christopher Nolan" },
//     { label: "Writers", value: "Jonathan Nolan, Christopher Nolan" },
//     { label: "Budget", value: "$185 million" },
//     { label: "Box Office", value: "$1.005 billion" },
//     { label: "Age Rating", value: "PG-13" },
//     { label: "Country", value: "United States" },
//     { label: "Awards", value: "2 Oscars, 159 wins & 163 nominations" },
//     { label: "Views", value: "2,450,738" }
//   ],
//   cast: [
//     "Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine",
//     "Maggie Gyllenhaal", "Gary Oldman", "Morgan Freeman"
//   ],
//   reviews: [
//     {
//       name: "MovieBuff2024",
//       rating: 10,
//       date: "January 15, 2024",
//       text: "Christopher Nolan's masterpiece continues to amaze me every time I watch it. Heath Ledger's performance as the Joker is absolutely phenomenal and deserved every accolade it received. The cinematography, the story, the acting - everything is just perfect."
//     },
//     {
//       name: "CinemaLover",
//       rating: 9,
//       date: "December 28, 2023",
//       text: "One of the best superhero movies ever made. The moral complexity and psychological depth set it apart from typical comic book adaptations. A must-watch for any film enthusiast."
//     }
//   ],
//   poster: null,
//   trailer: null,
//   photos: Array.from({ length: 8 }, (_, i) => `Photo ${i + 1}`)
// };

// const MovieDetails = () => {
//   const { id } = useParams();
//   const [photosModalOpen, setPhotosModalOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth
//   const [reviewText, setReviewText] = useState('');

//   const handleAddToWatchlist = () => {
//     if (!isAuthenticated) {
//       alert('Please sign in to add movies to your watchlist');
//       return;
//     }
//     alert('Movie added to watchlist!');
//   };

//   const handleMarkVisited = () => {
//     if (!isAuthenticated) {
//       alert('Please sign in to mark movies as visited');
//       return;
//     }
//     alert('Movie marked as visited!');
//   };

//   const handleRate = () => {
//     if (!isAuthenticated) {
//       alert('Please sign in to rate this movie');
//       return;
//     }
//     const rating = prompt('Rate this movie (1-10):');
//     if (rating && rating >= 1 && rating <= 10) {
//       alert(`You rated this movie ${rating}/10`);
//     }
//   };

//   const handleReviewSubmit = (e) => {
//     e.preventDefault();
//     if (!reviewText.trim()) {
//       alert('Please write a review before submitting');
//       return;
//     }
//     alert('Review submitted successfully!');
//     setReviewText('');
//   };

//   return (
//     <div className={styles.movieDetailsContainer}>
//       <div style={{ color: '#f5c518', marginBottom: 10 }}>
//         Movie ID from URL: {id}
//       </div>
//       {/* Movie Header */}
//       <div className={styles.movieHeader}>
//         <div>
//           <h1 className={styles.movieTitle}>
//             {dummyMovie.title}
//             <span className={styles.movieYear}>({dummyMovie.year})</span>
//           </h1>
//           <div className={styles.ratingSection}>
//             <div className={styles.imdbRating}>
//               <div>
//                 <div className={styles.ratingLabel}>IMDb RATING</div>
//                 <div className={styles.ratingValue}>
//                   <span className={styles.ratingStars}>★</span>
//                   {dummyMovie.imdbRating}
//                   <span style={{ color: "#999", fontSize: 16 }}>/10</span>
//                 </div>
//               </div>
//             </div>
//             <div className={styles.userRating}>
//               <div>
//                 <div className={styles.ratingLabel}>YOUR RATING</div>
//                 <button className={styles.rateBtn} onClick={handleRate}>★ Rate</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className={styles.mainContent}>
//         {/* Movie Poster */}
//         <div className={styles.moviePosterSection}>
//           <div className={styles.moviePoster}>
//             {dummyMovie.poster ? (
//               <img src={dummyMovie.poster} alt="Movie Poster" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             ) : (
//               "Movie Poster"
//             )}
//           </div>
//         </div>

//         {/* Center Content */}
//         <div className={styles.centerContent}>
//           {/* Action Buttons */}
//           <div className={styles.actionButtons}>
//             <button className={styles.actionBtn} onClick={handleMarkVisited}>✓ Mark as Visited</button>
//             <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleAddToWatchlist}>+ Add to Watchlist</button>
//           </div>

//           {/* Plot Section */}
//           <div className={styles.plotSection}>
//             <h2 className={styles.sectionTitle}>Plot</h2>
//             <p className={styles.plotText}>{dummyMovie.plot}</p>
//           </div>

//           {/* Movie Details */}
//           <div className={styles.detailsSection}>
//             <h2 className={styles.sectionTitle}>Details</h2>
//             <div className={styles.detailsGrid}>
//               {dummyMovie.details.map((item, idx) => (
//                 <div className={styles.detailItem} key={idx}>
//                   <span className={styles.detailLabel}>{item.label}</span>
//                   <span className={styles.detailValue}>{item.value}</span>
//                 </div>
//               ))}
//             </div>
//             {/* Cast Section */}
//             <div style={{ marginTop: 30 }}>
//               <h3 className={styles.sectionTitle}>Cast</h3>
//               <div className={styles.castList}>
//                 {dummyMovie.cast.map((actor, idx) => (
//                   <span className={styles.castMember} key={idx}>{actor}</span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <div className={styles.trailerSection}>
//           <h2 className={styles.sectionTitle}>Trailer</h2>
//           <div className={styles.trailerPlaceholder}>🎬 Movie Trailer</div>
//           <div className={styles.photosCard} onClick={() => setPhotosModalOpen(true)}>
//             <div className={styles.photosIcon}>📸</div>
//             <div>Photos</div>
//             <div style={{ fontSize: 12, color: "#999" }}>View all images</div>
//           </div>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       <div className={styles.reviewsSection}>
//         <h2 className={styles.sectionTitle}>User Reviews</h2>
//         {/* Review Form or Prompt */}
//         {isAuthenticated ? (
//           <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
//             <textarea
//               className={styles.reviewTextarea}
//               placeholder="Write your review here..."
//               value={reviewText}
//               onChange={e => setReviewText(e.target.value)}
//             />
//             <button className={styles.reviewSubmit} type="submit">Submit Review</button>
//           </form>
//         ) : (
//           <div className={styles.guestLoginPrompt}>
//             <p style={{ color: "#999", marginBottom: 10 }}>Sign in to write a review</p>
//             <button className={styles.loginPromptBtn} onClick={() => alert('Redirecting to sign in page...')}>Sign In to Review</button>
//           </div>
//         )}

//         {/* Existing Reviews */}
//         <div className={styles.existingReviews}>
//           {dummyMovie.reviews.map((review, idx) => (
//             <div className={styles.reviewItem} key={idx}>
//               <div className={styles.reviewHeader}>
//                 <span className={styles.reviewerName}>{review.name}</span>
//                 <span className={styles.reviewRating}>
//                   {"★".repeat(Math.round(review.rating / 2))} {review.rating}/10
//                 </span>
//                 <span className={styles.reviewDate}>{review.date}</span>
//               </div>
//               <p className={styles.reviewText}>{review.text}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Photos Modal */}
//       {photosModalOpen && (
//         <div className={styles.photosModal} onClick={e => { if (e.target.className === styles.photosModal) setPhotosModalOpen(false); }}>
//           <div className={styles.photosModalContent}>
//             <span className={styles.close} onClick={() => setPhotosModalOpen(false)}>&times;</span>
//             <h2 className={styles.sectionTitle}>{dummyMovie.title} - Photos</h2>
//             <div className={styles.photosGrid}>
//               {dummyMovie.photos.map((photo, idx) => (
//                 <div className={styles.photoItem} key={idx}>{photo}</div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
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
  yourRating: null,
  plot: `When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.`,
  genres: ["Action", "Crime", "Drama", "Thriller"],
  details: {
    releaseDate: "July 18, 2008",
    duration: "152 minutes",
    language: "English",
    country: "United States",
    type: "Movie",
    director: "Christopher Nolan",
    writer: "Jonathan Nolan, Christopher Nolan",
    budget: "$185 million",
    boxOffice: "$1.005 billion",
    collection: "The Dark Knight Trilogy",
    awards: "2 Oscars, 159 wins & 163 nominations",
    views: "2,450,738"
  },
  cast: [
    { name: "Christian Bale", photo: null },
    { name: "Heath Ledger", photo: null },
    { name: "Aaron Eckhart", photo: null },
    { name: "Michael Caine", photo: null },
    { name: "Maggie Gyllenhaal", photo: null },
    { name: "Gary Oldman", photo: null }
  ],
  userRatings: {
    averageRating: 8.2,
    totalRatings: 15420,
    distribution: [120, 450, 980, 2340, 3890, 4210, 2980, 450]
  },
  reviews: [
    {
      name: "MovieBuff2024",
      rating: 10,
      date: "January 15, 2024",
      text: "Christopher Nolan's masterpiece continues to amaze me every time I watch it. Heath Ledger's performance as the Joker is absolutely phenomenal and deserved every accolade it received."
    },
    {
      name: "CinemaLover",
      rating: 9,
      date: "December 28, 2023",
      text: "One of the best superhero movies ever made. The moral complexity and psychological depth set it apart from typical comic book adaptations."
    }
  ],
  similarMovies: [
    { title: "Batman Begins", year: 2005, poster: null },
    { title: "The Dark Knight Rises", year: 2012, poster: null },
    { title: "Joker", year: 2019, poster: null }
  ],
  poster: null,
  trailer: null,
  images: Array.from({ length: 6 }, (_, i) => `Image ${i + 1}`)
};

const MovieDetails = () => {
  const { id } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(null);

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add movies to your watchlist');
      return;
    }
    alert('Movie added to watchlist!');
  };

  const handleMarkAsVisited = () => {
    if (!isAuthenticated) {
      alert('Please sign in to mark movies as visited');
      return;
    }
    alert('Movie marked as visited!');
  };

  const handleRating = (rating) => {
    if (!isAuthenticated) {
      alert('Please sign in to rate this movie');
      return;
    }
    setUserRating(rating);
    alert(`You rated this movie ${rating}/10`);
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
      {/* Movie Header */}
      <div className={styles.movieHeader}>
        <h1 className={styles.movieTitle}>
          {dummyMovie.title} ({dummyMovie.year})
        </h1>
        <div className={styles.ratingButtons}>
          <div className={styles.imdbRating}>
            <span className={styles.ratingLabel}>IMDb Rating</span>
            <span className={styles.ratingValue}>
              ⭐ {dummyMovie.imdbRating}/10
            </span>
          </div>
          <div className={styles.yourRating}>
            <span className={styles.ratingLabel}>Your Rating</span>
            <span className={styles.ratingValue}>
              {userRating ? `⭐ ${userRating}/10` : '⭐ Rate'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Movie Poster */}
        <div className={styles.posterSection}>
          <div className={styles.moviePoster}>
            {dummyMovie.poster ? (
              <img src={dummyMovie.poster} alt="Movie Poster" />
            ) : (
              <div className={styles.posterPlaceholder}>Movie Poster</div>
            )}
          </div>
        </div>

        {/* Trailer Section */}
        <div className={styles.trailerSection}>
          <div className={styles.trailer}>
            {dummyMovie.trailer ? (
              <video controls>
                <source src={dummyMovie.trailer} type="video/mp4" />
              </video>
            ) : (
              <div className={styles.trailerPlaceholder}>
                <div className={styles.playButton}>▶</div>
                <span>Trailer</span>
              </div>
            )}
          </div>
          <div className={styles.viewsCount}>{dummyMovie.details.views} Views</div>
        </div>

        {/* Images Section */}
        <div className={styles.imagesSection}>
          <h3>Images</h3>
          <div className={styles.imageGrid}>
            {dummyMovie.images.slice(0, 4).map((image, idx) => (
              <div key={idx} className={styles.imageItem}>
                {image}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Genre Tags */}
      <div className={styles.genreSection}>
        {dummyMovie.genres.map((genre, idx) => (
          <span key={idx} className={styles.genreTag}>{genre}</span>
        ))}
      </div>

      {/* Movie Details */}
      <div className={styles.detailsSection}>
        <h2>Details</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsColumn}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Release Date:</span>
              <span className={styles.detailValue}>{dummyMovie.details.releaseDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Type:</span>
              <span className={styles.detailValue}>{dummyMovie.details.type}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Box Office:</span>
              <span className={styles.detailValue}>{dummyMovie.details.boxOffice}</span>
            </div>
          </div>
          <div className={styles.detailsColumn}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Duration:</span>
              <span className={styles.detailValue}>{dummyMovie.details.duration}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Director:</span>
              <span className={styles.detailValue}>{dummyMovie.details.director}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Collection:</span>
              <span className={styles.detailValue}>{dummyMovie.details.collection}</span>
            </div>
          </div>
          <div className={styles.detailsColumn}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Language:</span>
              <span className={styles.detailValue}>{dummyMovie.details.language}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Writer:</span>
              <span className={styles.detailValue}>{dummyMovie.details.writer}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Awards:</span>
              <span className={styles.detailValue}>{dummyMovie.details.awards}</span>
            </div>
          </div>
          <div className={styles.detailsColumn}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Country:</span>
              <span className={styles.detailValue}>{dummyMovie.details.country}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Budget:</span>
              <span className={styles.detailValue}>{dummyMovie.details.budget}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Views:</span>
              <span className={styles.detailValue}>{dummyMovie.details.views}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.actionBtn} onClick={handleAddToWatchlist}>
            Add to Watchlist
          </button>
          <button className={styles.actionBtn} onClick={handleMarkAsVisited}>
            Mark as Visited
          </button>
        </div>
      </div>

      {/* Plot Section */}
      <div className={styles.plotSection}>
        <h2>Plot</h2>
        <p>{dummyMovie.plot}</p>
      </div>

      {/* Cast Section */}
      <div className={styles.castSection}>
        <h2>Cast</h2>
        <div className={styles.castGrid}>
          {dummyMovie.cast.map((actor, idx) => (
            <div key={idx} className={styles.castMember}>
              <div className={styles.castPhoto}>
                {actor.photo ? (
                  <img src={actor.photo} alt={actor.name} />
                ) : (
                  <div className={styles.castPhotoPlaceholder}>Photo</div>
                )}
              </div>
              <div className={styles.castName}>{actor.name}</div>
            </div>
          ))}
        </div>
        <p className={styles.castNote}>
          This can be clicked to check side or that I can see more cast from the right side of this section
        </p>
      </div>

      {/* User Ratings Section */}
      <div className={styles.userRatingsSection}>
        <h2>User Ratings</h2>
        <div className={styles.ratingsContainer}>
          <div className={styles.averageRating}>
            <span className={styles.ratingNumber}>⭐ {dummyMovie.userRatings.averageRating}</span>
            <span className={styles.totalRatings}>({dummyMovie.userRatings.totalRatings} ratings)</span>
          </div>
          <div className={styles.ratingBars}>
            {dummyMovie.userRatings.distribution.map((count, idx) => (
              <div key={idx} className={styles.ratingBar}>
                <span className={styles.ratingLabel}>{idx + 1}</span>
                <div className={styles.barContainer}>
                  <div 
                    className={styles.bar} 
                    style={{ width: `${(count / Math.max(...dummyMovie.userRatings.distribution)) * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <h2>Reviews</h2>
        
        {/* Review Input */}
        {isAuthenticated ? (
          <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
            <textarea
              className={styles.reviewTextarea}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button type="submit" className={styles.reviewSubmitBtn}>
              Submit Review
            </button>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>Sign in to write a review</p>
            <button 
              className={styles.loginBtn}
              onClick={() => alert('Redirecting to sign in page...')}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Existing Reviews */}
        <div className={styles.reviewsList}>
          {dummyMovie.reviews.map((review, idx) => (
            <div key={idx} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewerName}>{review.name}</span>
                <span className={styles.reviewRating}>⭐ {review.rating}/10</span>
                <span className={styles.reviewDate}>{review.date}</span>
              </div>
              <p className={styles.reviewText}>{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Movies Section */}
      <div className={styles.similarMoviesSection}>
        <h2>More like this (Movies with similar genre)</h2>
        <div className={styles.similarMoviesGrid}>
          {dummyMovie.similarMovies.map((movie, idx) => (
            <div key={idx} className={styles.similarMovieCard}>
              <div className={styles.similarMoviePoster}>
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className={styles.posterPlaceholder}>Poster</div>
                )}
              </div>
              <div className={styles.similarMovieInfo}>
                <h4>{movie.title}</h4>
                <p>{movie.year}</p>
                <p>Genre: Action</p>
                <p>IMDb: 8.5/10</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credits Section */}
      <div className={styles.creditsSection}>
        <h2>FilmFusion Credits Section</h2>
        <p>Credits and acknowledgments for the FilmFusion platform</p>
      </div>
    </div>
  );
};

export default MovieDetails;