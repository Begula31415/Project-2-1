import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.footer 
      className="footer"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">FilmFusion</h3>
            <p className="footer-description">
              Your ultimate destination for movies, TV shows, and entertainment content.
              Discover, explore, and enjoy the world of cinema.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">▶️</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Movies</h4>
            <ul className="footer-links">
              <li><a href="#">Popular Movies</a></li>
              <li><a href="#">Top Rated</a></li>
              <li><a href="#">Upcoming</a></li>
              <li><a href="#">Now Playing</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">TV Shows</h4>
            <ul className="footer-links">
              <li><a href="#">Popular Shows</a></li>
              <li><a href="#">Top Rated</a></li>
              <li><a href="#">On The Air</a></li>
              <li><a href="#">Airing Today</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">People</h4>
            <ul className="footer-links">
              <li><a href="#">Popular People</a></li>
              <li><a href="#">Born Today</a></li>
              <li><a href="#">Directors</a></li>
              <li><a href="#">Actors</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-credits">
            <p>© 2025 FilmFusion. All rights reserved.</p>
            <p>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
              <span className="tmdb-logo">🎬</span>
            </p>
          </div>
          <div className="footer-legal">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;