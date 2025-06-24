import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrendingSection = ({ movies, onMovieClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return (prevIndex + 1) % movies.length;
      } else {
        return prevIndex === 0 ? movies.length - 1 : prevIndex - 1;
      }
    });
  };

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="trending-section">
      <h2 className="trending-title">Trending Now</h2>
      <div className="trending-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="trending-slide"
          >
            <div className="trending-card" onClick={() => onMovieClick(currentMovie.id)}>
              <div className="trending-poster">
                {currentMovie.poster ? (
                  <img src={currentMovie.poster} alt={currentMovie.title} />
                ) : (
                  <div className="placeholder-poster">
                    <span>🎬</span>
                  </div>
                )}
              </div>
              <div className="trending-info">
                <h3 className="trending-movie-title">{currentMovie.title}</h3>
                <p className="trending-movie-year">{currentMovie.year}</p>
                {currentMovie.rating && (
                  <div className="trending-rating">
                    <span className="star">★</span>
                    <span>{currentMovie.rating}</span>
                  </div>
                )}
                <div className="trending-actions">
                  <button className="play-btn">▶ Play Trailer</button>
                  <button className="info-btn">ℹ More Info</button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="trending-navigation">
          <button 
            className="nav-btn prev-btn" 
            onClick={() => paginate(-1)}
          >
            ‹
          </button>
          <button 
            className="nav-btn next-btn" 
            onClick={() => paginate(1)}
          >
            ›
          </button>
        </div>

        <div className="trending-indicators">
          {movies.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;