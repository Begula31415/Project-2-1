import React,{useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { getCelebrityById, getCelebrityMovies,getCelebrityAwards,addToFavouriteCelebrities } from '../services/api'; // Adjust path as needed

const CelebrityProfile = ( { currentUser } ) => {
    const { id } = useParams();
    const [celebrity, setCelebrity] = useState(null);
    const [movies, setMovies] = useState([]);  
     const [awards, setAwards] = useState([]); 
    const [loading, setLoading] = useState(true);


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

  const handleMovieClick = (movieTitle) => {
    
    // Handle movie click - could navigate to movie details page

    console.log(`Clicked on ${movieTitle}`);
    alert(`You clicked on ${movieTitle}`);
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px'
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
            ← Back to Home  
          </button>  
            
          <button   
            onClick={handleAddToFavourites}  
            style={{  
              backgroundColor: '#e50914',  
              color: 'white',  
              padding: '10px 20px',  
              border: 'none',  
              borderRadius: '5px',  
              fontWeight: 'bold',  
              cursor: 'pointer',  
              transition: 'background-color 0.3s ease'  
            }}  
            onMouseOver={(e) => e.target.style.backgroundColor = '#b8070f'}  
            onMouseOut={(e) => e.target.style.backgroundColor = '#e50914'}  
          >  
            ♥ Add to Favourites  
          </button>  
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

<p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Years Active:</strong> {celebrity.years_active || 'N/A'}
</p>
<p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
  <strong>Height:</strong> {celebrity.height || 'N/A'}
</p>

            </div>
          </div>

          {/* Right side - Name and Biography */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '36px' : '48px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'white'
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
                fontSize: '24px',
                marginBottom: '15px',
                color: '#f5c518'
              }}>{celebrity.bio}</h2>
              <p style={{
                lineHeight: '1.8',
                fontSize: '16px',
                color: '#cccccc'
              }}>
               
                <br /><br />
                
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
          onClick={() => handleMovieClick(movie.title)}  
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
      </div>
    </div>
  );
}

export default CelebrityProfile;