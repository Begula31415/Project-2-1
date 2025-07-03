// import React from 'react';
// import { motion } from 'framer-motion';
// import ScrollAnimatedSection from './ScrollAnimatedSection';

// const CelebritySection = () => {
//   // Sample celebrity data
//   const celebrities = [
//     { id: 1, name: "Ryan Gosling", birthdate: "November 12, 1980", age: 43, profession: "Actor", image: null },
//     { id: 2, name: "Emma Stone", birthdate: "November 6, 1988", age: 35, profession: "Actress", image: null },
//     { id: 3, name: "Leonardo DiCaprio", birthdate: "November 11, 1974", age: 49, profession: "Actor", image: null },
//     { id: 4, name: "Margot Robbie", birthdate: "July 2, 1990", age: 33, profession: "Actress", image: null },
//     { id: 5, name: "Chris Evans", birthdate: "June 13, 1981", age: 42, profession: "Actor", image: null },
//     { id: 6, name: "Scarlett Johansson", birthdate: "November 22, 1984", age: 39, profession: "Actress", image: null }
//   ];

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20, scale: 0.9 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut"
//       }
//     }
//   };

//   const CelebrityCard = ({ celebrity }) => (
//     <motion.div 
//       className="celebrity-card"
//       variants={cardVariants}
//       whileHover={{ 
//         scale: 1.05,
//         transition: { duration: 0.2 }
//       }}
//       whileTap={{ scale: 0.95 }}
//     >
//       <div className="celebrity-image">
//         {celebrity.image ? (
//           <img src={celebrity.image} alt={celebrity.name} />
//         ) : (
//           <div className="celebrity-placeholder">
//             <span className="celebrity-icon">👤</span>
//           </div>
//         )}
//       </div>
//       <div className="celebrity-info">
//         <h3 className="celebrity-name">{celebrity.name}</h3>
//         <p className="celebrity-profession">{celebrity.profession}</p>
//         <p className="celebrity-age">Age: {celebrity.age}</p>
//         <p className="celebrity-birthdate">{celebrity.birthdate}</p>
//       </div>
//     </motion.div>
//   );

//   return (
//     <ScrollAnimatedSection animation="fadeInUp">
//       <section className="celebrity-section">
//         <h2 className="section-title">Born Today</h2>
//         <motion.div 
//           className="celebrities-grid"
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: "-100px" }}
//         >
//           {celebrities.map(celebrity => (
//             <CelebrityCard key={celebrity.id} celebrity={celebrity} />
//           ))}
//         </motion.div>
//       </section>
//     </ScrollAnimatedSection>
//   );
// };

// export default CelebritySection;

import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimatedSection from './ScrollAnimatedSection';

// ==================== FILMFUSION UPDATE START ====================
// Updated to accept celebrities data and click handlers as props
const CelebritySection = ({ 
  title = "Popular Celebrities", 
  celebrities = [], 
  onCelebrityClick 
}) => {
// ==================== FILMFUSION UPDATE END ====================

  // ==================== FILMFUSION UPDATE START ====================
  // Fallback celebrity data if no celebrities provided
  const defaultCelebrities = [
    { id: 1, name: "Ryan Gosling", birth_date: "1980-11-12", bio: "Canadian actor", photo: null, movie_count: 25 },
    { id: 2, name: "Emma Stone", birth_date: "1988-11-06", bio: "American actress", photo: null, movie_count: 30 },
    { id: 3, name: "Leonardo DiCaprio", birth_date: "1974-11-11", bio: "American actor", photo: null, movie_count: 35 },
    { id: 4, name: "Margot Robbie", birth_date: "1990-07-02", bio: "Australian actress", photo: null, movie_count: 28 },
    { id: 5, name: "Chris Evans", birth_date: "1981-06-13", bio: "American actor", photo: null, movie_count: 32 },
    { id: 6, name: "Scarlett Johansson", birth_date: "1984-11-22", bio: "American actress", photo: null, movie_count: 38 }
  ];

  const displayCelebrities = celebrities.length > 0 ? celebrities : defaultCelebrities;
  // ==================== FILMFUSION UPDATE END ====================

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

  // ==================== FILMFUSION UPDATE START ====================
  // Updated to handle new celebrity data structure and click events
  const CelebrityCard = ({ celebrity }) => {
    // Calculate age from birth_date
    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    return (
      <motion.div 
        className="celebrity-card"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCelebrityClick && onCelebrityClick(celebrity.id)}
        style={{ cursor: onCelebrityClick ? 'pointer' : 'default' }}
      >
        <div className="celebrity-image">
          {celebrity.photo ? (
            <img src={celebrity.photo} alt={celebrity.name} />
          ) : (
            <div className="celebrity-placeholder">
              <span className="celebrity-icon">👤</span>
            </div>
          )}
        </div>
        <div className="celebrity-info">
          <h3 className="celebrity-name">{celebrity.name}</h3>
          <p className="celebrity-bio">{}</p>
          <p className="celebrity-age">Age: {calculateAge(celebrity.birth_date)}</p>
          <p className="celebrity-birthdate">{formatDate(celebrity.birth_date)}</p>
          {celebrity.movie_count && (
            <p className="celebrity-movies">Movies: {celebrity.movie_count}</p>
          )}
        </div>
      </motion.div>
    );
  };
  // ==================== FILMFUSION UPDATE END ====================

  return (
    <ScrollAnimatedSection animation="fadeInUp">
      <section className="celebrity-section">
        {/* ==================== FILMFUSION UPDATE START ==================== */}
        {/* Updated to use dynamic title prop */}
        <h2 className="section-title">{title}</h2>
        {/* ==================== FILMFUSION UPDATE END ==================== */}
        <motion.div 
          className="celebrities-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* ==================== FILMFUSION UPDATE START ==================== */}
          {/* Updated to use dynamic celebrities data */}
          {displayCelebrities.map(celebrity => (
            <CelebrityCard key={celebrity.id} celebrity={celebrity} />
          ))}
          {/* ==================== FILMFUSION UPDATE END ==================== */}
        </motion.div>
      </section>
    </ScrollAnimatedSection>
  );
};

export default CelebritySection;