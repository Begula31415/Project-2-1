import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const subtextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <motion.h1 
          className="hero-title"
          variants={textVariants}
          initial="hidden"
          animate={showText ? "visible" : "hidden"}
        >
          Welcome.
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          variants={subtextVariants}
          initial="hidden"
          animate={showText ? "visible" : "hidden"}
        >
          Millions of movies, TV shows and people to discover. Explore now.
        </motion.p>
        <motion.div 
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="scroll-arrow">↓</div>
          <span>Scroll to explore</span>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;