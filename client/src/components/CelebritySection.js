import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimatedSection from './ScrollAnimatedSection';

const CelebritySection = () => {
  // Sample celebrity data
  const celebrities = [
    { id: 1, name: "Ryan Gosling", birthdate: "November 12, 1980", age: 43, profession: "Actor", image: null },
    { id: 2, name: "Emma Stone", birthdate: "November 6, 1988", age: 35, profession: "Actress", image: null },
    { id: 3, name: "Leonardo DiCaprio", birthdate: "November 11, 1974", age: 49, profession: "Actor", image: null },
    { id: 4, name: "Margot Robbie", birthdate: "July 2, 1990", age: 33, profession: "Actress", image: null },
    { id: 5, name: "Chris Evans", birthdate: "June 13, 1981", age: 42, profession: "Actor", image: null },
    { id: 6, name: "Scarlett Johansson", birthdate: "November 22, 1984", age: 39, profession: "Actress", image: null }
  ];

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
    hidden: { opacity: 0, y: 20, scale: 0.9 },
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

  const CelebrityCard = ({ celebrity }) => (
    <motion.div 
      className="celebrity-card"
      variants={cardVariants}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="celebrity-image">
        {celebrity.image ? (
          <img src={celebrity.image} alt={celebrity.name} />
        ) : (
          <div className="celebrity-placeholder">
            <span className="celebrity-icon">👤</span>
          </div>
        )}
      </div>
      <div className="celebrity-info">
        <h3 className="celebrity-name">{celebrity.name}</h3>
        <p className="celebrity-profession">{celebrity.profession}</p>
        <p className="celebrity-age">Age: {celebrity.age}</p>
        <p className="celebrity-birthdate">{celebrity.birthdate}</p>
      </div>
    </motion.div>
  );

  return (
    <ScrollAnimatedSection animation="fadeInUp">
      <section className="celebrity-section">
        <h2 className="section-title">Born Today</h2>
        <motion.div 
          className="celebrities-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {celebrities.map(celebrity => (
            <CelebrityCard key={celebrity.id} celebrity={celebrity} />
          ))}
        </motion.div>
      </section>
    </ScrollAnimatedSection>
  );
};

export default CelebritySection;