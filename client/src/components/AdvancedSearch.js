import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdvancedSearch.module.css';
import { FaList, FaTh, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { advancedSearch, searchCelebrities, getGenres, getLanguages, getCountries } from '../services/api';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  
  // State for active tab (titles/names)
  const [activeTab, setActiveTab] = useState('titles');
  
  // State for search filters
  const [filters, setFilters] = useState({
    // Movie/Title filters
    titleName: '',
    titleType: '',
    releaseDate: { from: '', to: '', fromYear: '', toYear: '' },
    imdbRating: { from: '', to: '' },
    numberOfRatings: { from: '', to: '' },
    genre: [],
    language: '',
    country: '',
    castCrew: '',
    runtime: { from: '', to: '' },
    keywords: '',
    // Celebrity/Names filters
    celebrityName: '',
    birthDate: { from: '', to: '', fromYear: '', toYear: '' },
    deathDate: { from: '', to: '', fromYear: '', toYear: '' },
    birthday: '', // MM-DD format
    gender: ''
  });
  
  // State for UI
  const [sortBy, setSortBy] = useState('user_rating');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const [allExpanded, setAllExpanded] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    // Movie/Title filters
    titleName: true,
    titleType: true,
    releaseDate: false,
    imdbRating: false,
    numberOfRatings: false,
    genre: false,
    language: false,
    country: false,
    castCrew: false,
    runtime: false,
    keywords: false,
    // Celebrity/Names filters
    celebrityName: true,
    birthDate: false,
    deathDate: false,
    birthday: false,
    gender: false
  });
  
  // Results state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Available genres from database
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [genresData, languagesData, countriesData] = await Promise.all([
          getGenres(),
          getLanguages(),
          getCountries()
        ]);
        
        setGenres(genresData.genres || []);
        setLanguages(languagesData.languages || []);
        setCountries(countriesData.countries || []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Use fallback data if API fails
        setGenres([
          'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
          'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
          'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 
          'TV Movie', 'Thriller', 'War', 'Western', 'Action & Adventure', 
          'Kids', 'News', 'Reality', 'Sci-Fi & Fantasy', 'Soap', 
          'Talk', 'War & Politics', 'Sci-fi'
        ]);
      }
    };
    
    loadData();
  }, []);

  // Reset sort options when tab changes
  useEffect(() => {
    if (activeTab === 'titles') {
      setSortBy('user_rating');
    } else {
      setSortBy('name');
    }
    setResults([]);
    setHasSearched(false);
  }, [activeTab]);

  // Auto-sort results when sortBy or sortDirection changes
  useEffect(() => {
    if (results.length > 0 && hasSearched) {
      const sortedResults = [...results].sort((a, b) => {
        let aValue, bValue;
        
        if (activeTab === 'titles') {
          // Movie/TV Series sorting
          switch (sortBy) {
            case 'alphabetical':
              aValue = a.title?.toLowerCase() || '';
              bValue = b.title?.toLowerCase() || '';
              break;
            case 'user_rating':
              aValue = parseFloat(a.average_rating) || 0;
              bValue = parseFloat(b.average_rating) || 0;
              break;
            case 'number_of_ratings':
              aValue = parseInt(a.rating_count) || 0;
              bValue = parseInt(b.rating_count) || 0;
              break;
            case 'box_office':
              aValue = parseFloat(a.box_office_collection) || 0;
              bValue = parseFloat(b.box_office_collection) || 0;
              break;
            case 'runtime':
              aValue = parseInt(a.duration) || 0;
              bValue = parseInt(b.duration) || 0;
              break;
            case 'year':
              aValue = new Date(a.release_date).getFullYear() || 0;
              bValue = new Date(b.release_date).getFullYear() || 0;
              break;
            case 'release_date':
              aValue = new Date(a.release_date);
              bValue = new Date(b.release_date);
              break;
            default:
              aValue = a.title?.toLowerCase() || '';
              bValue = b.title?.toLowerCase() || '';
          }
        } else {
          // Celebrity sorting
          switch (sortBy) {
            case 'name':
              aValue = a.name?.toLowerCase() || '';
              bValue = b.name?.toLowerCase() || '';
              break;
            case 'birth_date':
              aValue = new Date(a.birth_date || '1900-01-01');
              bValue = new Date(b.birth_date || '1900-01-01');
              break;
            case 'movie_count':
              aValue = parseInt(a.movie_count) || 0;
              bValue = parseInt(b.movie_count) || 0;
              break;
            default:
              aValue = a.name?.toLowerCase() || '';
              bValue = b.name?.toLowerCase() || '';
          }
        }

        // Handle string vs number comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        } else {
          if (sortDirection === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
      });
      
      setResults(sortedResults);
    }
  }, [sortBy, sortDirection, activeTab]);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only search if at least one filter has a value
      const hasActiveFilters = activeTab === 'titles' 
        ? (filters.titleName.trim() || 
           filters.titleType || 
           filters.releaseDate.from || 
           filters.releaseDate.to || 
           filters.releaseDate.fromYear || 
           filters.releaseDate.toYear ||
           filters.imdbRating.from || 
           filters.imdbRating.to ||
           filters.numberOfRatings.from || 
           filters.numberOfRatings.to ||
           filters.genre.length > 0 ||
           filters.language.trim() ||
           filters.country.trim() ||
           filters.castCrew.trim() ||
           filters.runtime.from ||
           filters.runtime.to ||
           filters.keywords.trim())
        : (filters.celebrityName.trim() ||
           filters.birthDate.from ||
           filters.birthDate.to ||
           filters.birthDate.fromYear ||
           filters.birthDate.toYear ||
           filters.deathDate.from ||
           filters.deathDate.to ||
           filters.deathDate.fromYear ||
           filters.deathDate.toYear ||
           filters.birthday.trim() ||
           filters.gender);

      if (hasActiveFilters) {
        handleSearch();
      } else if (hasSearched) {
        // Clear results if no filters are active
        setResults([]);
        setResultCount(0);
        setHasSearched(false);
      }
    }, 500); // 500ms debounce to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [filters, activeTab]); // Trigger when any filter changes

  const sortOptions = activeTab === 'titles' ? [
    // Movie/TV Series sort options
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'user_rating', label: 'User rating' },
    { value: 'number_of_ratings', label: 'Number of ratings' },
    { value: 'box_office', label: 'US box office' },
    { value: 'runtime', label: 'Runtime' },
    { value: 'year', label: 'Year' },
    { value: 'release_date', label: 'Release date' }
  ] : [
    // Celebrity sort options
    { value: 'name', label: 'Name' },
    { value: 'birth_date', label: 'Birth date' },
    { value: 'movie_count', label: 'Number of movies' }
  ];

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleGenreToggle = (genre) => {
    setFilters(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field, type, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value
      }
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      if (activeTab === 'titles') {
        // Movie/TV Series search
        const searchFilters = {
          titleName: filters.titleName,
          titleType: filters.titleType,
          releaseDate: filters.releaseDate,
          imdbRating: filters.imdbRating,
          numberOfRatings: filters.numberOfRatings,
          genre: filters.genre,
          language: filters.language,
          country: filters.country,
          castCrew: filters.castCrew,
          runtime: filters.runtime,
          keywords: filters.keywords,
          sortBy: sortBy,
          sortDirection: sortDirection
        };

        console.log('Movie search filters:', searchFilters);
        
        const response = await advancedSearch(searchFilters);
        
        if (response.success) {
          setResults(response.results || []);
          setResultCount(response.count || 0);
        } else {
          setResults([]);
          setResultCount(0);
          console.error('Movie search failed:', response.message);
        }
      } else {
        // Celebrity search
        const celebrityFilters = {
          celebrityName: filters.celebrityName,
          birthDate: filters.birthDate,
          deathDate: filters.deathDate,
          birthday: filters.birthday,
          gender: filters.gender,
          sortBy: sortBy,
          sortDirection: sortDirection
        };

        console.log('Celebrity search filters:', celebrityFilters);
        
        const response = await searchCelebrities(celebrityFilters);
        
        if (response.success) {
          setResults(response.results || []);
          setResultCount(response.count || 0);
        } else {
          setResults([]);
          setResultCount(0);
          console.error('Celebrity search failed:', response.message);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Auto-sorting will be triggered by useEffect
  };

  const toggleAllFilters = () => {
    const newExpandedState = !allExpanded;
    setAllExpanded(newExpandedState);
    
    const newExpandedFilters = {};
    Object.keys(expandedFilters).forEach(key => {
      newExpandedFilters[key] = newExpandedState;
    });
    setExpandedFilters(newExpandedFilters);
  };

  const renderFilterSection = (title, filterName, children) => (
    <div className={styles.filterSection}>
      <div 
        className={styles.filterHeader}
        onClick={() => toggleFilter(filterName)}
      >
        <h3>{title}</h3>
        <FaChevronDown 
          className={`${styles.chevron} ${expandedFilters[filterName] ? styles.expanded : ''}`}
        />
      </div>
      {expandedFilters[filterName] && (
        <div className={styles.filterContent}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{activeTab === 'titles' ? 'Advanced title search' : 'Advanced names search'}</h1>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'titles' ? styles.active : ''}`}
          onClick={() => setActiveTab('titles')}
        >
          📺 TITLES
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'names' ? styles.active : ''}`}
          onClick={() => setActiveTab('names')}
        >
          👥 NAMES
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Left Sidebar - Filters */}
        <div className={styles.sidebar}>
          <div className={styles.filtersHeader}>
            <h2>Search filters</h2>
            <button className={styles.expandAll} onClick={toggleAllFilters}>
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          {/* CONDITIONAL FILTERS BASED ON ACTIVE TAB */}
          {activeTab === 'titles' ? (
            <>
              {/* Title Name Filter */}
              {renderFilterSection('Title name', 'titleName', (
                <input
                  type="text"
                  placeholder="e.g. The Godfather"
                  value={filters.titleName}
                  onChange={(e) => handleInputChange('titleName', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Title Type Filter */}
              {renderFilterSection('Title type', 'titleType', (
                <div className={styles.titleTypeOptions}>
                  <div className={styles.availableOptions}>
                    <button 
                      className={`${styles.optionButton} ${filters.titleType === 'movie' ? styles.selected : ''}`}
                      onClick={() => handleInputChange('titleType', filters.titleType === 'movie' ? '' : 'movie')}
                    >
                      Movie
                    </button>
                    <button 
                      className={`${styles.optionButton} ${filters.titleType === 'tv-series' ? styles.selected : ''}`}
                      onClick={() => handleInputChange('titleType', filters.titleType === 'tv-series' ? '' : 'tv-series')}
                    >
                      TV Series
                    </button>
                  </div>
                </div>
              ))}

              {/* Release Date Filter */}
              {renderFilterSection('Release date', 'releaseDate', (
                <div className={styles.dateInputs}>
                  <div className={styles.dateGroup}>
                    <label>Enter full date</label>
                    <div className={styles.dateRange}>
                      <input
                        type="date"
                        value={filters.releaseDate.from}
                        onChange={(e) => handleDateChange('releaseDate', 'from', e.target.value)}
                        className={styles.dateInput}
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={filters.releaseDate.to}
                        onChange={(e) => handleDateChange('releaseDate', 'to', e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>
                  <div className={styles.yearGroup}>
                    <label>or just enter yyyy, or yyyy-mm below</label>
                    <div className={styles.yearRange}>
                      <input
                        type="text"
                        placeholder="From year"
                        value={filters.releaseDate.fromYear || ''}
                        onChange={(e) => handleDateChange('releaseDate', 'fromYear', e.target.value)}
                        className={styles.yearInput}
                      />
                      <span>to</span>
                      <input
                        type="text"
                        placeholder="To year"
                        value={filters.releaseDate.toYear || ''}
                        onChange={(e) => handleDateChange('releaseDate', 'toYear', e.target.value)}
                        className={styles.yearInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* IMDb Ratings Filter */}
              {renderFilterSection('IMDb ratings', 'imdbRating', (
                <div className={styles.ratingRange}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g. 1.0"
                    value={filters.imdbRating.from}
                    onChange={(e) => handleDateChange('imdbRating', 'from', e.target.value)}
                    className={styles.ratingInput}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g. 10.0"
                    value={filters.imdbRating.to}
                    onChange={(e) => handleDateChange('imdbRating', 'to', e.target.value)}
                    className={styles.ratingInput}
                  />
                </div>
              ))}

              {/* Number of Ratings Filter */}
              {renderFilterSection('Number of Ratings', 'numberOfRatings', (
                <div className={styles.ratingRange}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min ratings"
                    value={filters.numberOfRatings.from}
                    onChange={(e) => handleDateChange('numberOfRatings', 'from', e.target.value)}
                    className={styles.ratingInput}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max ratings"
                    value={filters.numberOfRatings.to}
                    onChange={(e) => handleDateChange('numberOfRatings', 'to', e.target.value)}
                    className={styles.ratingInput}
                  />
                </div>
              ))}

              {/* Genre Filter */}
              {renderFilterSection('Genre', 'genre', (
                <div className={styles.genreGrid}>
                  {genres.map(genre => (
                    <button
                      key={genre}
                      className={`${styles.genrePill} ${filters.genre.includes(genre) ? styles.selected : ''}`}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      <span>{genre}</span>
                      {filters.genre.includes(genre) && (
                        <span className={styles.crossMark}>×</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {/* Language Filter */}
              {renderFilterSection('Language', 'language', (
                <input
                  type="text"
                  placeholder="e.g. English, Spanish"
                  value={filters.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Country Filter */}
              {renderFilterSection('Country', 'country', (
                <input
                  type="text"
                  placeholder="e.g. USA, UK"
                  value={filters.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Cast or Crew Filter */}
              {renderFilterSection('Cast or Crew', 'castCrew', (
                <input
                  type="text"
                  placeholder="e.g. Tom Hanks, Steven Spielberg"
                  value={filters.castCrew}
                  onChange={(e) => handleInputChange('castCrew', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Runtime Filter */}
              {renderFilterSection('Runtime', 'runtime', (
                <div className={styles.runtimeRange}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min minutes"
                    value={filters.runtime.from}
                    onChange={(e) => handleDateChange('runtime', 'from', e.target.value)}
                    className={styles.runtimeInput}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max minutes"
                    value={filters.runtime.to}
                    onChange={(e) => handleDateChange('runtime', 'to', e.target.value)}
                    className={styles.runtimeInput}
                  />
                </div>
              ))}

              {/* Keywords Filter */}
              {renderFilterSection('Additional Keywords', 'keywords', (
                <input
                  type="text"
                  placeholder="e.g. superhero, space"
                  value={filters.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  className={styles.textInput}
                />
              ))}
            </>
          ) : (
            <>
              {/* CELEBRITY/NAMES FILTERS */}
              {/* Name Filter */}
              {renderFilterSection('Name', 'celebrityName', (
                <input
                  type="text"
                  placeholder="e.g. Audrey Hepburn"
                  value={filters.celebrityName}
                  onChange={(e) => handleInputChange('celebrityName', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Birth Date Filter */}
              {renderFilterSection('Birth date', 'birthDate', (
                <div className={styles.dateInputs}>
                  <div className={styles.dateGroup}>
                    <label>Enter full date</label>
                    <div className={styles.dateRange}>
                      <input
                        type="date"
                        value={filters.birthDate.from}
                        onChange={(e) => handleDateChange('birthDate', 'from', e.target.value)}
                        className={styles.dateInput}
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={filters.birthDate.to}
                        onChange={(e) => handleDateChange('birthDate', 'to', e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>
                  <div className={styles.yearGroup}>
                    <label>or just enter yyyy, or yyyy-mm below</label>
                    <div className={styles.yearRange}>
                      <input
                        type="text"
                        placeholder="From year"
                        value={filters.birthDate.fromYear || ''}
                        onChange={(e) => handleDateChange('birthDate', 'fromYear', e.target.value)}
                        className={styles.yearInput}
                      />
                      <span>to</span>
                      <input
                        type="text"
                        placeholder="To year"
                        value={filters.birthDate.toYear || ''}
                        onChange={(e) => handleDateChange('birthDate', 'toYear', e.target.value)}
                        className={styles.yearInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Birthday Filter */}
              {renderFilterSection('Birthday', 'birthday', (
                <input
                  type="text"
                  placeholder="MM-DD (e.g. 05-04 for May 4)"
                  value={filters.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className={styles.textInput}
                />
              ))}

              {/* Death Date Filter */}
              {renderFilterSection('Death date', 'deathDate', (
                <div className={styles.dateInputs}>
                  <div className={styles.dateGroup}>
                    <label>Enter full date</label>
                    <div className={styles.dateRange}>
                      <input
                        type="date"
                        value={filters.deathDate.from}
                        onChange={(e) => handleDateChange('deathDate', 'from', e.target.value)}
                        className={styles.dateInput}
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={filters.deathDate.to}
                        onChange={(e) => handleDateChange('deathDate', 'to', e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>
                  <div className={styles.yearGroup}>
                    <label>or just enter yyyy, or yyyy-mm below</label>
                    <div className={styles.yearRange}>
                      <input
                        type="text"
                        placeholder="From year"
                        value={filters.deathDate.fromYear || ''}
                        onChange={(e) => handleDateChange('deathDate', 'fromYear', e.target.value)}
                        className={styles.yearInput}
                      />
                      <span>to</span>
                      <input
                        type="text"
                        placeholder="To year"
                        value={filters.deathDate.toYear || ''}
                        onChange={(e) => handleDateChange('deathDate', 'toYear', e.target.value)}
                        className={styles.yearInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Gender Identity Filter */}
              {renderFilterSection('Gender identity', 'gender', (
                <div className={styles.genderOptions}>
                  <button 
                    className={`${styles.optionButton} ${filters.gender === 'Male' ? styles.selected : ''}`}
                    onClick={() => handleInputChange('gender', filters.gender === 'Male' ? '' : 'Male')}
                  >
                    Male
                  </button>
                  <button 
                    className={`${styles.optionButton} ${filters.gender === 'Female' ? styles.selected : ''}`}
                    onClick={() => handleInputChange('gender', filters.gender === 'Female' ? '' : 'Female')}
                  >
                    Female
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right Content - Results */}
        <div className={styles.resultsArea}>
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              <span className={styles.resultCount}>
                {hasSearched ? `${results.length} of ${resultCount} results` : 'Use filters to start searching'}
              </span>
            </div>
            
            <div className={styles.resultsControls}>
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
                  className={styles.sortDirectionButton}
                  onClick={toggleSortDirection}
                  title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              
              <div className={styles.viewControls}>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </button>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaTh />
                </button>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className={styles.resultsContent}>
            {loading ? (
              <div className={styles.loading}>Searching...</div>
            ) : !hasSearched ? (
              <div className={styles.noResults}>
                <p>Use the filters on the left to search for {activeTab === 'titles' ? 'movies and TV shows' : 'celebrities'}.</p>
              </div>
            ) : results.length === 0 ? (
              <div className={styles.noResults}>
                <p>No results found. Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className={`${styles.resultsList} ${viewMode === 'grid' ? styles.gridView : styles.listView}`}>
                {results.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.resultItem}
                    onClick={() => {
                      if (activeTab === 'titles') {
                        navigate(`/movie/${item.id}`);
                      } else {
                        navigate(`/celebrity/${item.id}`);
                      }
                    }}
                  >
                    {activeTab === 'titles' ? (
                      // Movie/TV Show Result Item
                      <>
                        <div className={styles.resultPoster}>
                          <img 
                            src={item.poster_url || '/placeholder-movie.jpg'} 
                            alt={item.title}
                            onError={(e) => {
                              e.target.src = '/placeholder-movie.jpg';
                            }}
                          />
                        </div>
                        <div className={styles.resultInfo}>
                          <h3 className={styles.resultTitle}>{item.title}</h3>
                          <div className={styles.resultMeta}>
                            <span className={styles.resultYear}>
                              {new Date(item.release_date).getFullYear()}
                            </span>
                            <span className={styles.resultType}>{item.type}</span>
                            {item.duration && (
                              <span className={styles.resultDuration}>{item.duration} min</span>
                            )}
                          </div>
                          <div className={styles.resultRating}>
                            <span className={styles.ratingValue}>
                              ⭐ {item.average_rating || 'N/A'}
                            </span>
                            <span className={styles.ratingCount}>
                              ({item.rating_count || 0} ratings)
                            </span>
                          </div>
                          {item.description && (
                            <p className={styles.resultDescription}>
                              {item.description.length > 150 
                                ? `${item.description.substring(0, 150)}...` 
                                : item.description
                              }
                            </p>
                          )}
                          <div className={styles.resultDetails}>
                            {item.language_name && (
                              <span className={styles.resultLanguage}>{item.language_name}</span>
                            )}
                            <span className={styles.resultViews}>{item.views || 0} views</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Celebrity Result Item
                      <>
                        <div className={styles.resultPoster}>
                          <img 
                            src={item.photo_url || '/placeholder-person.jpg'} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/placeholder-person.jpg';
                            }}
                          />
                        </div>
                        <div className={styles.resultInfo}>
                          <h3 className={styles.resultTitle}>{item.name}</h3>
                          <div className={styles.resultMeta}>
                            {item.birth_date && (
                              <span className={styles.resultYear}>
                                Born: {new Date(item.birth_date).getFullYear()}
                              </span>
                            )}
                            {item.death_date && (
                              <span className={styles.resultYear}>
                                Died: {new Date(item.death_date).getFullYear()}
                              </span>
                            )}
                            {item.gender && (
                              <span className={styles.resultType}>{item.gender}</span>
                            )}
                          </div>
                          {item.place_of_birth && (
                            <div className={styles.resultRating}>
                              <span className={styles.ratingValue}>
                                📍 {item.place_of_birth}
                              </span>
                            </div>
                          )}
                          {item.bio && (
                            <p className={styles.resultDescription}>
                              {item.bio.length > 150 
                                ? `${item.bio.substring(0, 150)}...` 
                                : item.bio
                              }
                            </p>
                          )}
                          <div className={styles.resultDetails}>
                            {item.movie_count && (
                              <span className={styles.resultLanguage}>
                                {item.movie_count} movies
                              </span>
                            )}
                            {item.known_for_department && (
                              <span className={styles.resultViews}>
                                Known for: {item.known_for_department}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
