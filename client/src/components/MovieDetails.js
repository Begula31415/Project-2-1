import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MovieDetails.module.css';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaLaugh, FaSurprise, FaAngry } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { 
  getMovieDetails, 
  getMovieImages, 
  getMovieReviews, 
  getMovieCast, 
  getMovieAwards,
  getRatingDistribution, 
  getSimilarMovies,
  submitReview,
  rateMovie,
  getUserRating,
  removeRating,
  submitReaction,
  getUserReactions,
  editReview,
  deleteReview,
  trackContentView
} from '../services/api';
import { getSessionId } from '../utils/session';
import MovieSection from './MovieSection';

import {   
  // ... your existing imports  
  addToWatchlist,   
  removeFromWatchlist,   
  isInWatchlist   
} from '../services/api';  
  
import axios from 'axios';

const ReactionButton = ({ icon: Icon, count, onClick, active }) => {
  return (
    <button 
      className={`${styles.reactionButton} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <Icon className={styles.reactionIcon} />
      <span className={styles.reactionCount}>{count}</span>
    </button>
  );
};

const MovieDetails = ({ isAuthenticated, currentUser, onAuthRequired }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cast, setCast] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [tempRating, setTempRating] = useState(0); // For hovering effect
  const [selectedRating, setSelectedRating] = useState(0); // For tracking clicked rating
  const [reviewReactions, setReviewReactions] = useState({}); // For storing review reactions
  const [reviewText, setReviewText] = useState('');
  const [spoilerAlert, setSpoilerAlert] = useState(false); // For spoiler alert checkbox
  const [spoilerRevealed, setSpoilerRevealed] = useState({}); // For tracking revealed spoilers
  const [editingReviewId, setEditingReviewId] = useState(null); // For tracking which review is being edited
  const [editingText, setEditingText] = useState(''); // For storing the text being edited
  const [editingSpoilerAlert, setEditingSpoilerAlert] = useState(false); // For tracking spoiler alert during edit
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef(null);
  const ratingPopupRef = useRef(null);
  // Add these state variables after your existing useState declarations  
const [isInUserWatchlist, setIsInUserWatchlist] = useState(false);  
const [watchlistLoading, setWatchlistLoading] = useState(false);



  // Image modal functions
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Celebrity page navigation
  const navigateToCelebrity = (celebrityId) => {
    navigate(`/celebrity/${celebrityId}`);
  };

  // Emoji mapping for reactions
  const reactionEmojis = {
    'like': '👍',
    'dislike': '👎',
    'love': '❤️',
    'funny': '😄',
    'wow': '😮',
    'angry': '😠'
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        console.log('Fetching movie data for ID:', id);
        const [movieData, imagesData, reviewsData, castData, awardsData, ratingData] = await Promise.all([
          getMovieDetails(id),
          getMovieImages(id),
          getMovieReviews(id),
          getMovieCast(id),
          getMovieAwards(id),
          getRatingDistribution(id)
        ]);
        console.log('Movie data:', movieData);
        console.log('Images data:', imagesData);
        console.log('Cast data:', castData);
        console.log('Images array length:', imagesData?.length);
        console.log('Cast array length:', castData?.length);

        setMovie(movieData);
        setImages(imagesData);
        setReviews(reviewsData);
        setCast(castData);
        setAwards(awardsData);
        setRatingDistribution(ratingData.distribution);

        // Fetch similar movies based on genres
        if (movieData.genres) {
          console.log('Fetching similar movies with genres:', movieData.genres);
          const similarMoviesData = await getSimilarMovies(movieData.genres, id);
          console.log('Similar movies response:', similarMoviesData);
          // Check if similarMoviesData has movies array and use it
          const moviesArray = similarMoviesData.movies || similarMoviesData;
          setSimilarMovies(moviesArray.slice(0, 6)); // Limit to 6 similar movies
        }

        // Track content view
        const userId = currentUser?.user_id || null;
        const sessionId = getSessionId(); // Get or generate session ID for guest tracking
        try {
          await trackContentView(id, userId, sessionId);
          console.log('Content view tracked for movie:', id, userId ? `(user: ${userId})` : `(session: ${sessionId})`);
        } catch (viewError) {
          console.error('Failed to track view:', viewError);
          // Don't let view tracking errors affect the main functionality
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError(err.message || 'Failed to load movie details');
        setSimilarMovies([]); // Reset similar movies on error
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Fetch user's existing rating when authenticated user changes
  useEffect(() => {
    const fetchUserRating = async () => {
      if (isAuthenticated && currentUser?.user_id && id) {
        try {
          const ratingData = await getUserRating(id, currentUser.user_id);
          if (ratingData.success && ratingData.rating) {
            setUserRating(ratingData.rating.score);
            setSelectedRating(ratingData.rating.score);
            setTempRating(ratingData.rating.score);
          }
        } catch (error) {
          console.error('Error fetching user rating:', error);
          // User hasn't rated this movie yet, which is fine
        }
      }
    };

    fetchUserRating();
  }, [isAuthenticated, currentUser?.user_id, id]);

  // Fetch user's reactions when authenticated and reviews are loaded
  useEffect(() => {
    const fetchUserReactions = async () => {
      if (isAuthenticated && currentUser?.user_id && id && reviews.length > 0) {
        try {
          const reactionsData = await getUserReactions(id, currentUser.user_id);
          if (reactionsData.success) {
            // Convert to the format expected by the component
            const reactions = {};
            reviews.forEach(review => {
              reactions[review.review_id] = {
                like: false,
                dislike: false,
                love: false,
                funny: false,
                wow: false,
                angry: false,
                ...reactionsData.reactions[review.review_id]
              };
            });
            setReviewReactions(reactions);
          }
        } catch (error) {
          console.error('Error fetching user reactions:', error);
          // Initialize empty reactions if API fails
          const reactions = {};
          reviews.forEach(review => {
            reactions[review.review_id] = {
              like: false, dislike: false, love: false, 
              funny: false, wow: false, angry: false
            };
          });
          setReviewReactions(reactions);
        }
      } else if (!isAuthenticated && reviews.length > 0) {
        // Initialize empty reactions for non-authenticated users
        const reactions = {};
        reviews.forEach(review => {
          reactions[review.review_id] = {
            like: false, dislike: false, love: false, 
            funny: false, wow: false, angry: false
          };
        });
        setReviewReactions(reactions);
      }
    };

    fetchUserReactions();
  }, [isAuthenticated, currentUser?.user_id, id, reviews]);


  // Add this entire useEffect block:  
useEffect(() => {  
  const checkWatchlistStatus = async () => {  
    if (isAuthenticated && currentUser?.user_id && id) {  
      try {  
        const response = await isInWatchlist(currentUser.user_id, id);  
        setIsInUserWatchlist(response.isInWatchlist);  
      } catch (error) {  
        console.error('Error checking watchlist status:', error);  
        setIsInUserWatchlist(false);  
      }  
    }  
  };  
  
  checkWatchlistStatus();  
}, [isAuthenticated, currentUser?.user_id, id]); 


useEffect(() => {  
  setUserRating(null);        // Temporarily clears local state  
  setSelectedRating(0);  
  setTempRating(0);  
  setShowRatingPopup(false);  
}, [id]);  
  
// Step 2: Fetch useEffect runs after, retrieving your saved rating  
useEffect(() => {  
  const fetchUserRating = async () => {  
    if (isAuthenticated && currentUser?.user_id && id) {  
      try {  
        const ratingData = await getUserRating(id, currentUser.user_id);  
        if (ratingData.success && ratingData.rating) {  
          setUserRating(ratingData.rating.score);     // Your rating is restored!  
          setSelectedRating(ratingData.rating.score);  
          setTempRating(ratingData.rating.score);  
        }  
      } catch (error) {  
        // Handle error  
      }  
    }  
  };  
  fetchUserRating();  
}, [isAuthenticated, currentUser?.user_id, id]);

  const calculateRatingPercentage = (count) => {
    const total = ratingDistribution.reduce((sum, item) => sum + parseInt(item.count), 0);
    return total > 0 ? (count / total * 100).toFixed(1) : 0;
  };

  const renderRatingDistribution = () => {
    const total = ratingDistribution.reduce((sum, item) => sum + parseInt(item.count), 0);
    return (
      <div className={styles.ratingDistribution}>
        <div className={styles.overallRating}>
          <div className={styles.ratingNumber}>{movie?.average_rating || 0}</div>
          <div className={styles.totalRatings}>{total} ratings</div>
        </div>
        <div className={styles.ratingBars}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
            const ratingData = ratingDistribution.find(r => r.score === score) || { count: 0 };
            const percentage = calculateRatingPercentage(ratingData.count);
            return (
              <div key={score} className={styles.ratingBar}>
                <span className={styles.ratingScore}>{score}</span>
                <div className={styles.barContainer}>
                  <div className={styles.barFill} style={{ width: `${percentage}%` }} />
                </div>
                <span className={styles.ratingCount}>{ratingData.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // const handleAddToWatchlist = () => {
  //   if (!isAuthenticated) {
  //     alert('Please sign in to add movies to your watchlist');
  //     return;
  //   }
  //   alert('Movie added to watchlist!');
  // };
 const handleAddToWatchlist = async () => {    
  if (!isAuthenticated) {    
    onAuthRequired();    
    return;    
  }    
  
  if (isInUserWatchlist) {  
    alert('Movie is already in your watchlist! Go to your dashboard to remove it.');  
    return;  
  }  
    
  setWatchlistLoading(true);    
  try {    
    const response = await addToWatchlist(currentUser.user_id, id);    
    if (response.success) {    
      setIsInUserWatchlist(true);    
      alert('Movie added to watchlist!');    
    }    
  } catch (error) {    
    console.error('Error updating watchlist:', error);    
    alert(error.message || 'Failed to add to watchlist. Please try again.');    
  } finally {    
    setWatchlistLoading(false);    
  }    
}; 


  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    
    try {
      const response = await rateMovie(id, rating, currentUser.user_id);
      if (response.success) {
        setUserRating(rating);
        // Update movie stats if returned
        if (response.movieStats) {
          setMovie(prevMovie => ({
            ...prevMovie,
            average_rating: response.movieStats.average_rating,
            rating_count: response.movieStats.rating_count
          }));
        }
        alert(`You rated this movie ${rating}/10`);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleAddReview = async () => {
    if (!reviewText.trim()) return;
    
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    try {
      const response = await submitReview(id, reviewText, currentUser.user_id, spoilerAlert);

      if (response.success) {
        // Add the new review to the current reviews list
        setReviews(prevReviews => [response.review, ...prevReviews]);
        setReviewText('');
        setSpoilerAlert(false); // Reset spoiler alert
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message) {
        alert(error.message);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    }
  };

  const handleRatingClick = () => {
    setShowRatingPopup(true);
  };

  // Function to toggle spoiler visibility
  const toggleSpoilerReveal = (reviewId) => {
    setSpoilerRevealed(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleRatingSubmit = async (rating) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    
    try {
      const response = await rateMovie(id, rating, currentUser.user_id);
      if (response.success) {
        setUserRating(rating);
        setSelectedRating(rating);
        setTempRating(rating);
        setShowRatingPopup(false);
        
        // Update movie stats if returned
        if (response.movieStats) {
          setMovie(prevMovie => ({
            ...prevMovie,
            average_rating: response.movieStats.average_rating,
            rating_count: response.movieStats.rating_count
          }));
        }
        
        // Refresh rating distribution to show updated data
        try {
          const ratingData = await getRatingDistribution(id);
          setRatingDistribution(ratingData.distribution);
        } catch (err) {
          console.error('Error refreshing rating distribution:', err);
        }
        
        alert(`You rated this movie ${rating}/10`);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleMouseEnter = (rating) => {
    if (!selectedRating) {
      setTempRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setTempRating(selectedRating || userRating || 0);
  };

  // Handle submitting the rating
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    
    if (tempRating) {
      await handleRating(tempRating);
      setShowRatingPopup(false);
    }
  };

  // Handle removing the rating
  const handleRemoveRating = async () => {
    try {
      const response = await removeRating(id, currentUser.user_id);
      if (response.success) {
        setUserRating(null);
        setTempRating(0);
        setSelectedRating(0);
        
        // Update movie stats if returned
        if (response.movieStats) {
          setMovie(prevMovie => ({
            ...prevMovie,
            average_rating: response.movieStats.average_rating,
            rating_count: response.movieStats.rating_count
          }));
        }
        
        // Refresh rating distribution to show updated data
        try {
          const ratingData = await getRatingDistribution(id);
          setRatingDistribution(ratingData.distribution);
        } catch (err) {
          console.error('Error refreshing rating distribution:', err);
        }
        
        alert('Rating removed successfully');
      }
    } catch (error) {
      console.error('Error removing rating:', error);
      alert('Failed to remove rating. Please try again.');
    }
  };

  const handleReaction = async (reviewId, reactionType) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const currentReactions = reviewReactions[reviewId] || {};
      const currentValue = currentReactions[reactionType] || false;
      
      // Calculate new reaction state
      const newValue = !currentValue; // Toggle current reaction
      
      // Update local state optimistically (only user's reaction state, not counts)
      const updatedReactions = {
        ...reviewReactions,
        [reviewId]: {
          // Clear all reactions first (user can only have one)
          like: false,
          dislike: false, 
          love: false,
          funny: false,
          wow: false,
          angry: false,
          // Set the new reaction
          [reactionType]: newValue
        }
      };
      setReviewReactions(updatedReactions);

      // Send to the backend - let the trigger handle count updates
      await submitReaction(reviewId, reactionType, newValue, currentUser.user_id);
      
      // Refresh the reviews to get the updated counts from database
      const reviewsData = await getMovieReviews(id);
      setReviews(reviewsData);
      
    } catch (error) {
      console.error('Error updating reaction:', error);
      alert('Failed to update reaction. Please try again.');
      
      // Revert the optimistic update on error
      const fetchReviewData = async () => {
        try {
          const reviewsData = await getMovieReviews(id);
          setReviews(reviewsData);
          // Also refresh user reactions
          if (currentUser?.user_id) {
            const userReactionsData = await getUserReactions(id, currentUser.user_id);
            setReviewReactions(userReactionsData);
          }
        } catch (err) {
          console.error('Error refreshing reviews:', err);
        }
      };
      fetchReviewData();
    }
  };

  // Handle editing a review
  const handleEditReview = (reviewId, currentText, currentSpoilerAlert = false) => {
    setEditingReviewId(reviewId);
    setEditingText(currentText);
    setEditingSpoilerAlert(currentSpoilerAlert);
  };

  // Handle saving edited review
  const handleSaveEdit = async (reviewId) => {
    if (!editingText.trim()) {
      alert('Review text cannot be empty');
      return;
    }

    try {
      const response = await editReview(reviewId, editingText, currentUser.user_id, editingSpoilerAlert);
      if (response.success) {
        // Update the review in the local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.review_id === reviewId 
              ? { ...review, text: editingText, spoiler_alert: editingSpoilerAlert }
              : review
          )
        );
        setEditingReviewId(null);
        setEditingText('');
        setEditingSpoilerAlert(false);
        alert('Review updated successfully!');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert(error.message || 'Failed to update review. Please try again.');
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingText('');
    setEditingSpoilerAlert(false);
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await deleteReview(reviewId, currentUser.user_id);
      if (response.success) {
        // Remove the review from local state
        setReviews(prevReviews => 
          prevReviews.filter(review => review.review_id !== reviewId)
        );
        alert('Review deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Failed to delete review. Please try again.');
    }
  };

  // Handle celebrity click
  const handleCelebrityClick = (celebrityId) => {
    navigate(`/celebrity/${celebrityId}`);
  };

  const renderRating = () => (
    <div className={styles.ratingButtons}>
      <div className={styles.ratingBox}>
        <span className={styles.starIcon}>⭐</span>
        <div className={styles.ratingContent}>
          <div className={styles.ratingValue}>{movie?.average_rating || '0'}</div>
          <div className={styles.ratingLabel}>IMDb RATING</div>
        </div>
      </div>

      <div 
        className={`${styles.ratingBox} ${!isAuthenticated ? styles.notRated : ''}`}
        onClick={handleRatingClick}
      >
        <span className={styles.starIcon}>{userRating ? '★' : '☆'}</span>
        <div className={styles.ratingContent}>
          <div className={styles.ratingValue}>{userRating || 'Rate'}</div>
          <div className={styles.ratingLabel}>YOUR RATING</div>
        </div>
      </div>
    </div>
  );

  const renderVideoPlayer = () => {
    if (!movie?.trailer_url) return null;
    
    // Check if it's a YouTube URL
    const isYouTubeUrl = movie.trailer_url.includes('youtube.com') || movie.trailer_url.includes('youtu.be');
    
    if (isYouTubeUrl) {
      // Extract YouTube video ID
      let videoId = '';
      if (movie.trailer_url.includes('youtube.com/watch?v=')) {
        videoId = movie.trailer_url.split('v=')[1];
      } else if (movie.trailer_url.includes('youtu.be/')) {
        videoId = movie.trailer_url.split('youtu.be/')[1];
      }
      
      if (videoId) {
        return (
          <div className={styles.videoContainer}>
            <iframe
              className={styles.videoPlayer}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }
    
    // Fallback to direct video player for non-YouTube URLs
    return (
      <div className={styles.videoContainer}>
        <video 
          ref={videoRef}
          className={styles.videoPlayer} 
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          poster={movie.poster_url}
        >
          <source src={movie.trailer_url} type="video/mp4" />
          <source src={movie.trailer_url} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  // Render the rating popup
  const renderRatingPopup = () => {
    if (!showRatingPopup) return null;

    return (
      <div className={styles.ratingPopupOverlay} onClick={() => setShowRatingPopup(false)}>
        <div className={styles.ratingPopup} onClick={e => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={() => setShowRatingPopup(false)}>×</button>
          <div className={styles.ratingPopupIcon}>★</div>
          <div className={styles.ratingPopupTitle}>{movie.title}</div>
          <div className={styles.ratingPopupSubheader}>Rate this</div>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
              <span
                key={star}
                className={`${styles.star} ${(tempRating || selectedRating || userRating) >= star ? styles.active : ''}`}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  setSelectedRating(star);
                  setTempRating(star);
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div className={styles.ratingActions}>
            <button 
              className={styles.rateButton}
              onClick={() => handleRatingSubmit(selectedRating || tempRating)}
              disabled={!selectedRating && !tempRating}
            >
              Rate
            </button>
            {userRating && (
              <button 
                className={styles.removeButton}
                onClick={handleRemoveRating}
              >
                Remove rating
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render reviews section with reactions
  const renderReviewsSection = () => {
    return (
      <div className={styles.reviewsSection}>
        <h2>User Reviews</h2>
        <div className={styles.addReview}>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            className={styles.reviewInput}
          />
          <div className={styles.reviewOptions}>
            <label className={styles.spoilerCheckbox}>
              <input
                type="checkbox"
                checked={spoilerAlert}
                onChange={(e) => setSpoilerAlert(e.target.checked)}
              />
              Contains spoilers
            </label>
            <button 
              className={styles.sendReviewButton}
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginPrompt(true);
                } else {
                  handleAddReview();
                }
              }}
            >
              <IoSend className={styles.sendIcon} />
            </button>
          </div>
        </div>
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.review_id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewAuthor}>{review.username}</span>
                <span className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {/* Review text - either editable or readonly */}
              {editingReviewId === review.review_id ? (
                <div className={styles.editReviewContainer}>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={styles.editReviewInput}
                    autoFocus
                  />
                  <div className={styles.spoilerCheckbox}>
                    <input
                      type="checkbox"
                      id={`edit-spoiler-${review.review_id}`}
                      checked={editingSpoilerAlert}
                      onChange={(e) => setEditingSpoilerAlert(e.target.checked)}
                    />
                    <label htmlFor={`edit-spoiler-${review.review_id}`}>
                      This review contains spoilers
                    </label>
                  </div>
                  <div className={styles.editActions}>
                    <button 
                      className={styles.saveButton}
                      onClick={() => handleSaveEdit(review.review_id)}
                    >
                      Save
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.reviewContent}>
                  {review.spoiler_alert && !spoilerRevealed[review.review_id] ? (
                    <div className={styles.spoilerContainer}>
                      <div className={styles.spoilerWarning}>
                        <span className={styles.spoilerIcon}>⚠️</span>
                        <span className={styles.spoilerText}>This review contains spoilers</span>
                      </div>
                      <div className={styles.spoilerBlurred}>
                        <p className={styles.reviewText}>{review.text}</p>
                      </div>
                      <button 
                        className={styles.revealSpoilerButton}
                        onClick={() => toggleSpoilerReveal(review.review_id)}
                      >
                        Reveal Spoiler
                      </button>
                    </div>
                  ) : (
                    <div>
                      {review.spoiler_alert && (
                        <div className={styles.spoilerRevealed}>
                          <span className={styles.spoilerIcon}>⚠️</span>
                          <span className={styles.spoilerText}>Spoiler revealed</span>
                          <button 
                            className={styles.hideSpoilerButton}
                            onClick={() => toggleSpoilerReveal(review.review_id)}
                          >
                            Hide
                          </button>
                        </div>
                      )}
                      <p className={styles.reviewText}>{review.text}</p>
                    </div>
                  )}
                  
                  {/* Edit and Delete buttons - only show for the review author */}
                  {isAuthenticated && currentUser?.username === review.username && (
                    <div className={styles.reviewActions}>
                      <button 
                        className={styles.editReviewButton}
                        onClick={() => handleEditReview(review.review_id, review.text, review.spoiler_alert)}
                        title="Edit review"
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteReviewButton}
                        onClick={() => handleDeleteReview(review.review_id)}
                        title="Delete review"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className={styles.reactionContainer}>
                <ReactionButton
                  icon={FaThumbsUp}
                  count={review.like_count || 0}
                  onClick={() => handleReaction(review.review_id, 'like')}
                  active={reviewReactions[review.review_id]?.like}
                />
                <ReactionButton
                  icon={FaThumbsDown}
                  count={review.dislike_count || 0}
                  onClick={() => handleReaction(review.review_id, 'dislike')}
                  active={reviewReactions[review.review_id]?.dislike}
                />
                <ReactionButton
                  icon={FaHeart}
                  count={review.love_count || 0}
                  onClick={() => handleReaction(review.review_id, 'love')}
                  active={reviewReactions[review.review_id]?.love}
                />
                <ReactionButton
                  icon={FaLaugh}
                  count={review.funny_count || 0}
                  onClick={() => handleReaction(review.review_id, 'funny')}
                  active={reviewReactions[review.review_id]?.funny}
                />
                <ReactionButton
                  icon={FaSurprise}
                  count={review.wow_count || 0}
                  onClick={() => handleReaction(review.review_id, 'wow')}
                  active={reviewReactions[review.review_id]?.wow}
                />
                <ReactionButton
                  icon={FaAngry}
                  count={review.angry_count || 0}
                  onClick={() => handleReaction(review.review_id, 'angry')}
                  active={reviewReactions[review.review_id]?.angry}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!movie) return <div className={styles.notFound}>Movie not found</div>;

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.backdropContainer}>
        <div className={styles.backdropOverlay} />
        <img 
          src={movie.poster_url} 
          alt={movie.title} 
          className={styles.backdropImage}
        />
      </div>

      {/* Movie Details Section */}
      <div className={styles.contentContainer}>
        {/* Main Movie Info */}
        <div className={styles.mainInfo}>
          <img src={movie.poster_url} alt={movie.title} className={styles.poster} />
          <div className={styles.details}>
            <h1>{movie.title}</h1>
            <div className={styles.metadata}>
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>{movie.duration} min</span>
              <span>{movie.language_name}</span>
              {movie.genres && <span>{movie.genres.join(', ')}</span>}
            </div>
            <p className={styles.description}>{movie.description}</p>
            
            <div className={styles.actions}>  
              <button   
                onClick={handleAddToWatchlist}  
                disabled={watchlistLoading || isInUserWatchlist}  
              >  
                {watchlistLoading   
                  ? 'Loading...'   
                  : isInUserWatchlist   
                    ? '✓ In Watchlist'   
                    : 'Add to Watchlist'  
                }  
              </button>         
              {/* Rating Buttons */}
              {/* Seasons & Episodes button for series */}
              {(movie.type === 'series' || movie.type === 'Series') && (
                <button 
                  className={styles.seasonsButton}
                  onClick={() => navigate(`/series/${id}/seasons`)}
                >
                  Seasons & Episodes
                </button>
              )}
              
              {/* Rating Buttons */}
              {renderRating()}
              {renderRatingPopup()}
            </div>

            {/* Login Prompt */}
            {showLoginPrompt && (
              <div className={styles.ratingPopupOverlay} onClick={() => setShowLoginPrompt(false)}>
                <div className={styles.ratingPopup} onClick={e => e.stopPropagation()}>
                  <div className={styles.ratingPopupHeader}>
                    <h3>Sign in required</h3>
                    <button className={styles.closeButton} onClick={() => setShowLoginPrompt(false)}>
                      ×
                    </button>
                  </div>
                  <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Please sign in to rate this movie
                  </p>
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => {
                      setShowLoginPrompt(false);
                      // TODO: Redirect to login page or show login modal
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className={styles.additionalDetails}>
              {movie.director && (
                <div className={styles.detail}>
                  <span className={styles.label}>Director:</span>
                  <span>{movie.director}</span>
                </div>
              )}
              {movie.producer && (
                <div className={styles.detail}>
                  <span className={styles.label}>Producer:</span>
                  <span>{movie.producer}</span>
                </div>
              )}
              {movie.country && (
                <div className={styles.detail}>
                  <span className={styles.label}>Country:</span>
                  <span>{movie.country}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trailer Section */}
        {movie.trailer_url && (
          <div className={styles.trailerSection}>
            <h2>Trailer</h2>
            {renderVideoPlayer()}
          </div>
        )}

        {/* Details Section */}
        <div className={styles.detailsSection}>
          <h2>Movie Details</h2>
          <div className={styles.detailsGrid}>
            {movie.language_name && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Language:</span>
                <span className={styles.value}>{movie.language_name}</span>
              </div>
            )}
            {movie.duration && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Runtime:</span>
                <span className={styles.value}>{movie.duration} minutes</span>
              </div>
            )}
            {movie.release_date && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Release Date:</span>
                <span className={styles.value}>
                  {new Date(movie.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {movie.genres && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Genres:</span>
                <span className={styles.value}>{movie.genres.join(', ')}</span>
              </div>
            )}
            {movie.budget && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Budget:</span>
                <span className={styles.value}>{movie.currency_code} {movie.budget.toLocaleString()}</span>
              </div>
            )}
            {movie.box_office_collection && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Box Office:</span>
                <span className={styles.value}>{movie.currency_code} {movie.box_office_collection.toLocaleString()}</span>
              </div>
            )}
            {movie.min_age && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Age Rating:</span>
                <span className={styles.value}>{movie.min_age}+</span>
              </div>
            )}
            {movie.views !== undefined && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Views:</span>
                <span className={styles.value}>{movie.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Images Section */}
        {images.length > 0 && (
          <div className={styles.imagesSection}>
            <h2>Photos</h2>
            <div className={styles.imageGrid}>
              {images.map((image, index) => (
                <div 
                  key={image.image_id} 
                  className={styles.imageItem}
                  onClick={() => openImageModal(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={image.url} alt={image.caption || `Still ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className={styles.castSection}>
            <h2>Cast & Crew</h2>
            <div className={styles.castGrid}>
              {cast.map((member) => (
                <div key={member.celebrity_id} className={styles.castMember}>
                  <div 
                    className={styles.castPhoto}
                    onClick={() => navigateToCelebrity(member.celebrity_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} />
                    ) : (
                      <div className={styles.castPhotoPlaceholder}>
                        👤
                      </div>
                    )}
                  </div>
                  <div className={styles.castName}>{member.name}</div>
                  <div className={styles.castRole}>{member.roles}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards Section */}
        {awards.length > 0 && (
          <div className={styles.awardsSection}>
            <h2>Awards & Recognition</h2>
            <div className={styles.awardsGrid}>
              {awards.map((award, index) => (
                <div key={`${award.award_id}-${index}`} className={styles.awardItem}>
                  <div className={styles.awardIcon}>🏆</div>
                  <div className={styles.awardInfo}>
                    <h3 className={styles.awardName}>{award.name}</h3>
                    <p className={styles.awardYear}>{award.year}</p>
                    {award.type && <p className={styles.awardType}>{award.type}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating Distribution Section */}
        <div className={styles.ratingSection}>
          <h2>User Ratings</h2>
          {renderRatingDistribution()}
        </div>

        {/* Reviews Section */}
        {renderReviewsSection()}

        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <div className={styles.similarMoviesWrapper}>
            <MovieSection
              title="Similar Movies"
              movies={similarMovies.map(movie => ({
                id: movie.movie_id,
                title: movie.title,
                year: new Date(movie.release_date).getFullYear(),
                poster: movie.poster_url,
                rating: typeof movie.average_rating === 'number' ? movie.average_rating.toFixed(1) : '0.0',
                views: movie.views || 0
              }))}
              onMovieClick={(movieId) => {
                if (movieId === parseInt(id)) return; // Don't navigate to the same movie
                navigate(`/movie/${movieId}`);
              }}
            />
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && images.length > 0 && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageModalClose} onClick={closeImageModal}>
              ×
            </button>
            <button className={styles.imageModalPrev} onClick={prevImage}>
              ‹
            </button>
            <img 
              src={images[currentImageIndex]?.url} 
              alt={images[currentImageIndex]?.caption || `Image ${currentImageIndex + 1}`}
              className={styles.imageModalImg}
            />
            <button className={styles.imageModalNext} onClick={nextImage}>
              ›
            </button>
            <div className={styles.imageModalCaption}>
              {images[currentImageIndex]?.caption || `Image ${currentImageIndex + 1} of ${images.length}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
