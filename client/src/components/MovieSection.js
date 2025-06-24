import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimatedSection from './ScrollAnimatedSection';

const MovieSection = ({ title, movies, onMovieClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const MovieCard = ({ movie }) => (
    <motion.div 
      className="movie-card"
      variants={cardVariants}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onMovieClick(movie.id)}
    >
      <div className="movie-poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} />
        ) : (
          <div className="movie-placeholder">
            <span className="movie-icon">🎬</span>
          </div>
        )}
        <div className="movie-overlay">
          <button className="play-button">▶</button>
        </div>
      </div>
      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>
        <div className="movie-year">{movie.year}</div>
        {movie.rating ? (
          <div className="movie-rating">
            <span className="star">★</span>
            <span>{movie.rating}</span>
          </div>
        ) : (
          <div className="movie-rating">Coming Soon</div>
        )}
      </div>
    </motion.div>
  );

  return (
    <ScrollAnimatedSection animation="fadeInUp">
      <section className="section">
        <h2 className="section-title">{title}</h2>
        <motion.div 
          className="movies-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </motion.div>
      </section>
    </ScrollAnimatedSection>
  );
};

export default MovieSection;