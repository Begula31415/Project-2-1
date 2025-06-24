import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ScrollAnimatedSection = ({ children, animation = "fadeInUp", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 60 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut"
        }
      }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut"
        }
      }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut"
        }
      }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut"
        }
      }
    },
    staggerChildren: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: delay
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={animations[animation]}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimatedSection;