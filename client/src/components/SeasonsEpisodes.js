import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SeasonsEpisodes.module.css';

const SeasonsEpisodes = () => {
  const { id } = useParams();
  const [seriesData, setSeriesData] = useState(null);
  const [seasonsWithEpisodes, setSeasonsWithEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        // Validate that id exists and is a valid number
        if (!id || isNaN(parseInt(id))) {
          setError('Invalid series ID');
          setLoading(false);
          return;
        }

        const seriesId = parseInt(id);
        
        // Fetch series details
        const seriesResponse = await fetch(`/api/content/${seriesId}`);
        if (!seriesResponse.ok) {
          throw new Error('Failed to fetch series details');
        }
        const series = await seriesResponse.json();
        setSeriesData(series);

        // Fetch seasons for this series
        const seasonsResponse = await fetch(`/api/series/${seriesId}/seasons`);
        if (!seasonsResponse.ok) {
          throw new Error('Failed to fetch seasons');
        }
        const seasons = await seasonsResponse.json();

        // Fetch episodes for each season
        const seasonsWithEpisodesData = await Promise.all(
          seasons.map(async (season) => {
            try {
              const episodesResponse = await fetch(`/api/series/${seriesId}/seasons/${season.season_number}/episodes`);
              if (!episodesResponse.ok) {
                console.warn(`Failed to fetch episodes for season ${season.season_number}`);
                return { ...season, episodes: [] };
              }
              const episodes = await episodesResponse.json();
              return { ...season, episodes };
            } catch (error) {
              console.error(`Error fetching episodes for season ${season.season_number}:`, error);
              return { ...season, episodes: [] };
            }
          })
        );

        setSeasonsWithEpisodes(seasonsWithEpisodesData);
      } catch (error) {
        console.error('Error fetching series data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading seasons and episodes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!seriesData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Series not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{seriesData.title}</h1>
        <p className={styles.description}>{seriesData.description}</p>
      </div>

      <div className={styles.seasonsContainer}>
        {seasonsWithEpisodes.length === 0 ? (
          <div className={styles.noSeasons}>No seasons available</div>
        ) : (
          seasonsWithEpisodes.map((season) => (
            <div key={season.season_id} className={styles.seasonSection}>
              <div className={styles.seasonHeader}>
                <h2>
                  Season {season.season_number}
                  {season.season_name && `: ${season.season_name}`}
                </h2>
                <span className={styles.episodeCount}>
                  {season.episodes.length} episodes
                </span>
                {season.release_date && (
                  <span className={styles.releaseDate}>
                    Released: {new Date(season.release_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {season.description && (
                <p className={styles.seasonDescription}>{season.description}</p>
              )}
              
              <div className={styles.seasonContent}>
                {season.poster_url && (
                  <img 
                    src={season.poster_url} 
                    alt={`Season ${season.season_number}`}
                    className={styles.seasonPoster}
                  />
                )}
                
                {season.trailer_url && (
                  <div className={styles.trailerContainer}>
                    <h4>Season Trailer</h4>
                    <div className={styles.videoPlayer}>
                      {season.trailer_url.includes('youtube.com') || season.trailer_url.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            season.trailer_url.includes('youtube.com/watch?v=') 
                              ? season.trailer_url.split('v=')[1] 
                              : season.trailer_url.includes('youtu.be/') 
                                ? season.trailer_url.split('youtu.be/')[1]
                                : ''
                          }`}
                          title={`Season ${season.season_number} Trailer`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className={styles.iframe}
                        ></iframe>
                      ) : (
                        <video controls className={styles.video}>
                          <source src={season.trailer_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.episodesSection}>
                <h3>Episodes</h3>
                <div className={styles.episodesGrid}>
                  {season.episodes.length === 0 ? (
                    <div className={styles.noEpisodes}>No episodes available</div>
                  ) : (
                    season.episodes.map((episode) => (
                      <div key={episode.episode_id} className={styles.episodeCard}>
                        <div className={styles.episodeNumber}>
                          Episode {episode.episode_number}
                        </div>
                        <h4 className={styles.episodeTitle}>{episode.title}</h4>
                        {episode.description && (
                          <p className={styles.episodeDescription}>
                            {episode.description}
                          </p>
                        )}
                        <div className={styles.episodeMeta}>
                          {episode.duration && (
                            <span className={styles.episodeDuration}>
                              {episode.duration} min
                            </span>
                          )}
                          {episode.air_date && (
                            <span className={styles.episodeAirDate}>
                              Aired: {new Date(episode.air_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SeasonsEpisodes;
