import React,{useState,useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { getCelebrityById, getCelebrityMovies,getCelebrityAwards,addToFavouriteCelebrities,getRelatedCelebrities } from '../services/api'; // Adjust path as needed

const CelebrityProfile = ( { currentUser } ) => {
    const { id } = useParams();
    const [celebrity, setCelebrity] = useState(null);
    const [movies, setMovies] = useState([]);  
     const [awards, setAwards] = useState([]); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();  
    const [relatedCelebrities, setRelatedCelebrities] = useState([]); 


    useEffect(() => {  
      const fetchCelebrity = async () => {  
        try {  
          console.log('Fetching celebrity data for ID:', id);  
            
          // Fetch celebrity data first  
          const celebrityData = await getCelebrityById(id);  
          setCelebrity(celebrityData);  
            
          // Then fetch movies and awards, but don't fail if they error  
          try {  
            const moviesData = await getCelebrityMovies(id);  
            setMovies(moviesData || []);  
          } catch (movieErr) {  
            console.error('Error fetching movies:', movieErr);  
            setMovies([]);  
          }  
            
          try {  
            const awardsData = await getCelebrityAwards(id);  
            setAwards(awardsData || []);  
          } catch (awardErr) {  
            console.error('Error fetching awards:', awardErr);  
            setAwards([]);  
          }  

          try {  
            const relatedData = await getRelatedCelebrities(id);  
            setRelatedCelebrities(relatedData || []);  
          } catch (relatedErr) {  
            console.error('Error fetching related celebrities:', relatedErr);  
            setRelatedCelebrities([]);  
          }  
            
          setLoading(false);  
        } catch (err) {  
          console.error('Error fetching celebrity:', err);  
          setLoading(false);  
        }  
      };  
      fetchCelebrity();  
    }, [id]);  

  const goBack = () => {
    // Navigate back to home page
    window.history.back();
  };

  const handleMovieClick = (movie) => {  
  // Navigate to movie details page using the movie ID  
  navigate(`/movie/${movie.id}`);  
};  

  const handleAddToFavourites = async () => {  
    if (!currentUser?.user_id) {  
      alert('Please log in to add celebrities to favourites');  
      return;  
    }  
  
    try {  
      await addToFavouriteCelebrities(currentUser.user_id, id);  
      alert('Celebrity added to favourites!');  
    } catch (error) {  
      console.error('Error adding to favourites:', error);  
      if (error.message.includes('already exists')) {  
        alert('Celebrity is already in your favourites!');  
      } else {  
        alert('Failed to add to favourites');  
      }  
    }  
  };  


  const handleRelatedCelebrityClick = (celebrityId) => {  
    navigate(`/celebrity/${celebrityId}`);  
  };  
  
  const scrollRelatedCelebrities = (direction) => {  
    const container = document.getElementById('related-celebrities-container');  
    const scrollAmount = 300;  
    if (direction === 'left') {  
      container.scrollLeft -= scrollAmount;  
    } else {  
      container.scrollLeft += scrollAmount;  
    }  
  }; 





  if (loading) {
    return <div style={{ color: 'white', padding: '30px' }}>Loading...</div>;
  }

  if (!celebrity) {
    return <div style={{ color: 'white', padding: '30px' }}>Celebrity not found</div>;
  }

  

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0f0f0f',
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '30px '
      }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>  
          <button   
            onClick={goBack}  
            style={{  
              backgroundColor: '#f5c518',  
              color: 'black',  
              padding: '10px 20px',  
              border: 'none',  
              borderRadius: '5px',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              transition: 'background-color 0.3s ease'  
            }}  
            onMouseOver={(e) => e.target.style.backgroundColor = '#e6b800'}  
            onMouseOut={(e) => e.target.style.backgroundColor = '#f5c518'}  
          >  
            ← Back 
          </button>  
            
          {/* <button   
            onClick={handleAddToFavourites}  
            style={{    
              backgroundColor: '#4CAF50',    
              color: 'white',    
              padding: '10px 20px',    
              border: 'none',    
              borderRadius: '5px',    
              fontWeight: 'bold',    
              cursor: 'pointer',    
              transition: 'background-color 0.3s ease'    
            }}    
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}    
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}  
          >  
            ♥ Add to Favourites  
          </button>   */}
        </div>  
        
        <div style={{  
          display: 'flex',  
          gap: '40px',  
          marginBottom: '40px',  
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',  
          backgroundColor: '#1a1a1a',  
          padding: '30px',  
          borderRadius: '10px',  
          border: '1px solid #333'  
        }}>
          {/* Left side - Picture and Details */}
          <div style={{
            flex: window.innerWidth <= 768 ? 'none' : '0 0 300px',
            alignSelf: window.innerWidth <= 768 ? 'center' : 'flex-start'
          }}>
            <img 
              src={celebrity.photo_url || 'https://via.placeholder.com/300x400'}
              alt={celebrity.name}
              style={{
                width: window.innerWidth <= 768 ? '250px' : '300px',
                height: window.innerWidth <= 768 ? '350px' : '400px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginBottom: '20px'
              }}
            />
            
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '10px'
            }}>
              <h3 style={{ color: '#f5c518', marginBottom: '10px', fontSize: '18px' }}>Personal Info</h3>
<p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Born:</strong> {celebrity.birth_date ? new Date(celebrity.birth_date).toLocaleDateString() : 'N/A'}
</p>
<p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Birthplace:</strong> {celebrity.place_of_birth || 'N/A'}
</p>
<p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Gender:</strong> {celebrity.gender || 'N/A'}
</p>
<p>
  <strong>Profession:</strong> {celebrity.roles?.length ? celebrity.roles.join(', ') : 'N/A'}
</p>

{/* <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Years Active:</strong> {celebrity.years_active || 'N/A'}
</p> */}
{/* <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Height:</strong> {celebrity.height || 'N/A'}
</p> */}

<button   
            onClick={handleAddToFavourites}  
            style={{    
              backgroundColor: '#4CAF50',    
              color: 'white',    
              padding: '10px 20px',    
              border: 'none',    
              borderRadius: '5px',    
              fontWeight: 'bold',    
              cursor: 'pointer',    
              transition: 'background-color 0.3s ease'    
            }}    
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}    
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}  
          >  
            ♥ Add to Favourites  
          </button>


            </div>
          </div>

          {/* Right side - Name and Biography */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '32px' : '42px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#f5c518'
            }}>{celebrity.name}</h1>
            
                  {/* Movies section - Below the main content */}    
<div style={{   
  marginBottom: '40px',  
  backgroundColor: '#1a1a1a',  
  padding: '30px',  
  borderRadius: '10px',  
  border: '1px solid #333'  
}}>
             <h2 style={{  
                fontSize: '22px',  
                marginBottom: '15px',  
                color: '#f5c518'  
              }}>Biography</h2>  
              <p style={{  
                lineHeight: '1.7',  
                fontSize: '15px',  
                color: '#ffffff',  
                fontFamily: "'Inter', 'Segoe UI', sans-serif",  
                fontWeight: '400',  
                letterSpacing: '0.3px',  
                textAlign: 'justify'  
              }}>  
                {celebrity.bio || 'No biography available for this celebrity.'}  
              </p> 
            </div>
          </div>
        </div>

        {/* Movies section - Below the main content */}
        {/* Movies section - Below the main content */}  
        <div style={{   
  marginBottom: '40px',  
  backgroundColor: '#1a1a1a',  
  padding: '30px',  
  borderRadius: '10px',  
  border: '1px solid #333'  
}}> 
  <h2 style={{  
    fontSize: '24px',  
    marginBottom: '20px',  
    color: '#f5c518'  
  }}>Known For</h2>  
  {movies.length > 0 ? (  
    <div style={{  
      display: 'grid',  
      gridTemplateColumns: window.innerWidth <= 768   
        ? 'repeat(auto-fill, minmax(120px, 1fr))'   
        : 'repeat(auto-fill, minmax(150px, 1fr))',  
      gap: window.innerWidth <= 768 ? '15px' : '20px'  
    }}>  
      {movies.map((movie, index) => (  
        <div  
          key={movie.id}  
          onClick={() => handleMovieClick(movie)}  
          style={{  
            backgroundColor: '#1a1a1a',  
            borderRadius: '10px',  
            overflow: 'hidden',  
            transition: 'transform 0.3s ease',  
            cursor: 'pointer'  
          }}  
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}  
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}  
        >  
          <img   
            src={movie.poster_url || 'https://via.placeholder.com/150x200'}   
            alt={movie.title}  
            style={{  
              width: '100%',  
              height: '200px',  
              objectFit: 'cover'  
            }}  
          />  
          <div style={{ padding: '10px' }}>  
            <div style={{  
              fontSize: '14px',  
              fontWeight: 'bold',  
              marginBottom: '5px',  
              color: 'white'  
            }}>  
              {movie.title}  
            </div>  
            <div style={{  
              fontSize: '12px',  
              color: '#888'  
            }}>  
              {movie.year} • {movie.type}  
            </div>  
          </div>  
        </div>  
      ))}  
    </div>  
  ) : (  
    <p style={{ color: '#888', fontStyle: 'italic' }}>No movies found for this celebrity.</p>  
  )}  
</div>  
  
{/* Awards section */}  
<div style={{   
  marginBottom: '40px',  
  backgroundColor: '#1a1a1a',  
  padding: '30px',  
  borderRadius: '10px',  
  border: '1px solid #333'  
}}>
  <h2 style={{  
    fontSize: '24px',  
    marginBottom: '20px',  
    color: '#f5c518'  
  }}>Awards & Recognition</h2>  
  {awards.length > 0 ? (  
    <div style={{  
      display: 'grid',  
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',  
      gap: '20px'  
    }}>  
      {awards.map((award, index) => (  
        <div  
          key={award.id}  
          style={{  
            backgroundColor: '#1a1a1a',  
            borderRadius: '10px',  
            padding: '20px',  
            border: '1px solid #333',  
            transition: 'transform 0.3s ease'  
          }}  
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}  
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}  
        >  
          <div style={{  
            display: 'flex',  
            alignItems: 'center',  
            marginBottom: '10px'  
          }}>  
            <div style={{  
              fontSize: '24px',  
              marginRight: '10px'  
            }}>🏆</div>  
            <div>  
              <div style={{  
                fontSize: '16px',  
                fontWeight: 'bold',  
                color: '#f5c518',  
                marginBottom: '5px'  
              }}>  
                {award.name}  
              </div>  
              <div style={{  
                fontSize: '14px',  
                color: '#888'  
              }}>  
                {award.year} • {award.type}  
              </div>  
            </div>  
          </div>  
        </div>  
      ))}  
    </div>  
  ) : (  
    <p style={{ color: '#888', fontStyle: 'italic' }}>No awards found for this celebrity.</p>  
  )}  
</div>

{/* Related Celebrities Section */}  
{relatedCelebrities.length > 0 && (  
  <div style={{     
    marginBottom: '50px',    
    backgroundColor: '#1a1a1a',    
    padding: '40px',    
    borderRadius: '15px',    
    border: '1px solid #333'    
  }}>  
    <h2 style={{    
      fontSize: '28px',    
      marginBottom: '30px',    
      color: '#f5c518',  
      fontWeight: '600'  
    }}>Related Celebrities</h2>  
    
    <div style={{ position: 'relative' }}>  
      <button  
        onClick={() => scrollRelatedCelebrities('left')}  
        style={{  
          position: 'absolute',  
          left: '-20px',  
          top: '50%',  
          transform: 'translateY(-50%)',  
          backgroundColor: '#f5c518',  
          color: 'black',  
          border: 'none',  
          borderRadius: '50%',  
          width: '40px',  
          height: '40px',  
          cursor: 'pointer',  
          fontSize: '18px',  
          zIndex: 2  
        }}  
      >  
        ‹  
      </button>  
        
      <div  
        id="related-celebrities-container"  
        style={{  
          display: 'flex',  
          gap: '20px',  
          overflowX: 'auto',  
          scrollBehavior: 'smooth',  
          paddingBottom: '10px'  
        }}  
      >  
        {relatedCelebrities.map((relatedCeleb) => (  
          <div  
            key={relatedCeleb.celebrity_id}  
            onClick={() => handleRelatedCelebrityClick(relatedCeleb.celebrity_id)}  
            style={{  
              minWidth: '150px',  
              backgroundColor: '#2a2a2a',  
              borderRadius: '12px',  
              overflow: 'hidden',  
              cursor: 'pointer',  
              transition: 'transform 0.3s ease',  
              border: '1px solid #444'  
            }}  
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}  
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}  
          >  
            <img  
              src={relatedCeleb.photo_url || 'https://via.placeholder.com/150x200'}  
              alt={relatedCeleb.name}  
              style={{  
                width: '100%',  
                height: '200px',  
                objectFit: 'cover'  
              }}  
            />  
            <div style={{ padding: '15px' }}>  
              <div style={{  
                fontSize: '14px',  
                fontWeight: '600',  
                color: 'white',  
                marginBottom: '5px',  
                textAlign: 'center'  
              }}>  
                {relatedCeleb.name}  
              </div>  
              <div style={{  
                fontSize: '12px',  
                color: '#aaa',  
                textAlign: 'center'  
              }}>  
                {relatedCeleb.common_movies} movies together  
              </div>  
            </div>  
          </div>  
        ))}  
      </div>  
        
      <button  
        onClick={() => scrollRelatedCelebrities('right')}  
        style={{  
          position: 'absolute',  
          right: '-20px',  
          top: '50%',  
          transform: 'translateY(-50%)',  
          backgroundColor: '#f5c518',  
          color: 'black',  
          border: 'none',  
          borderRadius: '50%',  
          width: '40px',  
          height: '40px',  
          cursor: 'pointer',  
          fontSize: '18px',  
          zIndex: 2  
        }}  
      >  
        ›  
      </button>  
    </div>  
  </div>  
)}

      </div>
    </div>
  );
}

export default CelebrityProfile;