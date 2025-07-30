import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { basicSearch, markAsWatched } from '../services/api';
import { getSessionId } from '../utils/session';
import styles from './SearchResults.module.css';

const SearchResults = ({ isAuthenticated, currentUser, onAuthRequired }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState({ movies: [], series: [], celebrities: [] });
  const [totalCounts, setTotalCounts] = useState({ movies: 0, series: 0, celebrities: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchedCount, setWatchedCount] = useState(0);
  
  // Filter and sorting states
  const [sortBy, setSortBy] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, category]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await basicSearch(query, category);
      if (searchResults.success) {
        setResults(searchResults.results);
        setTotalCounts(searchResults.totalCounts);
      } else {
        setError(searchResults.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'rating', label: 'User rating' },
    { value: 'rating_count', label: 'Number of ratings' },
    { value: 'your_rating', label: 'Your rating' },
    { value: 'release_date', label: 'Release date' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'runtime', label: 'Runtime' }
  ];

  const handleSortByChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const toggleSortDirection = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortResults = (items, type = 'content') => {
    if (!items || items.length === 0) return [];
    
    return [...items].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'rating':
          valueA = type === 'content' ? (a.average_rating || 0) : 0;
          valueB = type === 'content' ? (b.average_rating || 0) : 0;
          break;
        case 'rating_count':
          valueA = type === 'content' ? (a.rating_count || 0) : (a.movie_count || 0);
          valueB = type === 'content' ? (b.rating_count || 0) : (b.movie_count || 0);
          break;
        case 'release_date':
          valueA = type === 'content' ? new Date(a.release_date || 0) : new Date(a.birth_date || 0);
          valueB = type === 'content' ? new Date(b.release_date || 0) : new Date(b.birth_date || 0);
          break;
        case 'alphabetical':
          valueA = type === 'content' ? (a.title || '').toLowerCase() : (a.name || '').toLowerCase();
          valueB = type === 'content' ? (b.title || '').toLowerCase() : (b.name || '').toLowerCase();
          break;
        case 'runtime':
          valueA = type === 'content' ? (a.duration || 0) : 0;
          valueB = type === 'content' ? (b.duration || 0) : 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleCelebrityClick = (celebrityId) => {
    navigate(`/celebrity/${celebrityId}`);
  };

  const handleMarkAsWatched = async (e, movieId) => {
    e.stopPropagation(); // Prevent movie card click
    if (!isAuthenticated) {
      // Show login popup
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    
    try {
      const result = await markAsWatched(movieId, currentUser.user_id);
      if (result.success) {
        if (result.counted) {
          alert('Marked as watched! View count updated.');
        } else {
          alert('Already marked as watched recently.');
        }
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
      alert('Failed to mark as watched. Please try again.');
    }
  };

  const renderMovieCard = (movie, index) => (
    <div 
      key={`${movie.id}-${index}`} 
      className={`${styles.resultCard} ${viewMode === 'grid' ? styles.gridCard : styles.listCard}`}
      onClick={() => handleMovieClick(movie.id)}
    >
      <div className={styles.posterContainer}>
        <img 
          src={movie.poster_url || '/placeholder-movie.jpg'} 
          alt={movie.title}
          className={styles.poster}
        />
        {viewMode === 'grid' && (
          <button 
            className={styles.watchedButton}
            onClick={(e) => handleMarkAsWatched(e, movie.id)}
          >
            <span className={styles.watchedIcon}>👁</span>
            Mark as watched
          </button>
        )}
      </div>
      <div className={styles.movieInfo}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{movie.title}</h3>
          <div className={styles.metaAndButton}>
            <div className={styles.meta}>
              <span className={styles.year}>{movie.year}</span>
              <span className={styles.duration}>{movie.duration}m</span>
              <span className={styles.type}>{movie.type}</span>
            </div>
            {viewMode === 'list' && (
              <button 
                className={styles.watchedButtonList}
                onClick={(e) => handleMarkAsWatched(e, movie.id)}
              >
                <span className={styles.watchedIcon}>👁</span>
                Mark as watched
              </button>
            )}
          </div>
        </div>
        <div className={styles.rating}>
          <span className={styles.ratingValue}>⭐ {movie.average_rating || 'N/A'}</span>
          <span className={styles.ratingCount}>({movie.rating_count || 0})</span>
        </div>
        <div className={styles.views}>{movie.views || 0} views</div>
        {movie.description && viewMode === 'list' && (
          <p className={styles.description}>{movie.description.substring(0, 150)}...</p>
        )}
      </div>
    </div>
  );

  const renderCelebrityCard = (celebrity, index) => (
    <div 
      key={`${celebrity.id}-${index}`} 
      className={`${styles.resultCard} ${viewMode === 'grid' ? styles.gridCard : styles.listCard}`}
      onClick={() => handleCelebrityClick(celebrity.id)}
    >
      <div className={styles.posterContainer}>
        <img 
          src={celebrity.photo_url || '/placeholder-person.jpg'} 
          alt={celebrity.name}
          className={styles.poster}
        />
      </div>
      <div className={styles.celebrityInfo}>
        <h3 className={styles.title}>{celebrity.name}</h3>
        <div className={styles.meta}>
          {celebrity.birth_date && (
            <span className={styles.birthDate}>
              Born: {new Date(celebrity.birth_date).getFullYear()}
            </span>
          )}
          {celebrity.place_of_birth && (
            <span className={styles.birthPlace}>{celebrity.place_of_birth}</span>
          )}
        </div>
        <div className={styles.movieCount}>
          {celebrity.movie_count || 0} movies
        </div>
        {celebrity.bio && (
          <div className={styles.bio}>
            {celebrity.bio.substring(0, 100)}...
          </div>
        )}
      </div>
    </div>
  );

  const getTotalResults = () => {
    const { movies, series, celebrities } = results;
    return (movies?.length || 0) + (series?.length || 0) + (celebrities?.length || 0);
  };

  const getTotalMoviesInDatabase = () => {
    return totalCounts.movies + totalCounts.series;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Search Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchInfo}>
          <h1 className={styles.mainTitle}>Search Results for "{query}"</h1>
          <div className={styles.watchedInfo}>
            <span className={styles.watchedText}>{watchedCount} OF {getTotalMoviesInDatabase()} WATCHED</span>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '0%' }}></div>
              </div>
              <span className={styles.percentage}>0%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.resultsContainer}>
        {/* Movies Section */}
        {(category === 'all' || category === 'titles') && results.movies && results.movies.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Movies ({results.movies.length})</h2>
              <div className={styles.sectionControls}>
                <div className={styles.sortContainer}>
                  <label>Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => handleSortByChange(e.target.value)}
                    className={styles.sortSelect}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={toggleSortDirection}
                    className={styles.sortDirectionButton}
                    title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
                
                <div className={styles.viewControls}>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
            <div className={`${styles.resultsGrid} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
              {sortResults(results.movies, 'content').map((movie, index) => renderMovieCard(movie, index))}
            </div>
          </div>
        )}

        {/* TV Series Section */}
        {(category === 'all' || category === 'titles') && results.series && results.series.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>TV Series ({results.series.length})</h2>
              <div className={styles.sectionControls}>
                <div className={styles.viewControls}>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
            <div className={`${styles.resultsGrid} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
              {sortResults(results.series, 'content').map((series, index) => renderMovieCard(series, index))}
            </div>
          </div>
        )}

        {/* Celebrities Section */}
        {(category === 'all' || category === 'celebs') && results.celebrities && results.celebrities.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>People ({results.celebrities.length})</h2>
              <div className={styles.sectionControls}>
                <div className={styles.viewControls}>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button 
                    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
            <div className={`${styles.resultsGrid} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
              {sortResults(results.celebrities, 'celebrity').map((celebrity, index) => renderCelebrityCard(celebrity, index))}
            </div>
          </div>
        )}

        {/* No Results */}
        {getTotalResults() === 0 && !loading && (
          <div className={styles.noResults}>
            <h2>No results found</h2>
            <p>Try adjusting your search terms or check the spelling.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
