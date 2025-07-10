import psycopg2
import requests
import json
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def is_appropriate_title(title):
    """Return False if the title is inappropriate or low-quality."""
    banned_keywords = [
        "ass", "a$$", "cock", "dick", "pussy", "fuck", "shit", "bitch", "cunt", "penis", "vagina",
        "massive", "old", "taboo", "porn", "xxx", "sex", "nude", "slut", "whore"
        # Add more as needed
    ]
    title_lower = title.lower()
    # Filter out titles with banned words or that look like spam/low quality
    for word in banned_keywords:
        if word in title_lower:
            return False
    # Optionally, filter out titles that are too short or have suspicious patterns
    if len(title.strip()) < 3:
        return False
    return True

class TMDBDataPopulator:
    def __init__(self):
        # TMDB API Configuration
        self.api_key = "dbff8d9d00c960063466e9b257954bd8"
        self.access_token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmZmOGQ5ZDAwYzk2MDA2MzQ2NmU5YjI1Nzk1NGJkOCIsIm5iZiI6MTc1MDgwMjc0NC4yOCwic3ViIjoiNjg1YjIxMzhkODdiNGRlYTAyMmNhNTQ1Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.iGOZw3WnLmlX-uKCzdHDhrfQIUN3ZPbVH65K1wwVVlQ"
        self.base_url = "https://api.themoviedb.org/3"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        # Database Configuration
        self.db_config = {
            'host': 'ep-wild-sun-a847eqq8-pooler.eastus2.azure.neon.tech',
            'port': 5432,
            'database': 'neondb',
            'user': 'neondb_owner',
            'password': 'npg_VwHRAkxd0ST1',
            'sslmode': 'require'
        }
        
        self.conn = None
        self.cursor = None
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            logger.info("Connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"Error connecting to database: {e}")
            raise
    
    def close_db(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database connection closed")
    
    def make_api_request(self, endpoint, params=None):
        """Make API request to TMDB with error handling and rate limiting"""
        url = f"{self.base_url}{endpoint}"
        if params is None:
            params = {}
        params['api_key'] = self.api_key
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            time.sleep(0.25)  # Rate limiting: 4 requests per second
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed for {endpoint}: {e}")
            return None
    
    def populate_countries(self):
        """Populate countries table"""
        logger.info("Populating countries...")
        data = self.make_api_request("/configuration/countries")
        if not data:
            return
        
        for country in data:
            try:
                self.cursor.execute(
                    "INSERT INTO country (name) VALUES (%s) ON CONFLICT DO NOTHING",
                    (country['english_name'],)
                )
            except Exception as e:
                logger.error(f"Error inserting country {country['english_name']}: {e}")
        
        self.conn.commit()
        logger.info(f"Inserted {len(data)} countries")
    
    def populate_languages(self):
        """Populate languages table"""
        logger.info("Populating languages...")
        data = self.make_api_request("/configuration/languages")
        if not data:
            return
        
        for language in data:
            try:
                self.cursor.execute(
                    "INSERT INTO language (name) VALUES (%s) ON CONFLICT DO NOTHING",
                    (language['english_name'],)
                )
            except Exception as e:
                logger.error(f"Error inserting language {language['english_name']}: {e}")
        
        self.conn.commit()
        logger.info(f"Inserted {len(data)} languages")
    
    def populate_genres(self):
        """Populate genres table for movies and TV shows"""
        logger.info("Populating genres...")
        
        # Get movie genres
        movie_genres = self.make_api_request("/genre/movie/list")
        if movie_genres:
            for genre in movie_genres['genres']:
                try:
                    self.cursor.execute(
                        "INSERT INTO genre (name) VALUES (%s) ON CONFLICT DO NOTHING",
                        (genre['name'],)
                    )
                except Exception as e:
                    logger.error(f"Error inserting genre {genre['name']}: {e}")
        
        # Get TV genres
        tv_genres = self.make_api_request("/genre/tv/list")
        if tv_genres:
            for genre in tv_genres['genres']:
                try:
                    self.cursor.execute(
                        "INSERT INTO genre (name) VALUES (%s) ON CONFLICT DO NOTHING",
                        (genre['name'],)
                    )
                except Exception as e:
                    logger.error(f"Error inserting genre {genre['name']}: {e}")
        
        self.conn.commit()
        logger.info("Genres populated successfully")
    
    def populate_roles(self):
        """Populate common roles table"""
        logger.info("Populating roles...")
        common_roles = [
            'Actor', 'Actress', 'Director', 'Producer', 'Writer', 'Cinematographer',
            'Editor', 'Composer', 'Production Designer', 'Costume Designer',
            'Executive Producer', 'Co-Producer', 'Associate Producer', 'Casting Director',
            'Sound Designer', 'Visual Effects Supervisor', 'Stunt Coordinator'
        ]
        
        for role in common_roles:
            try:
                self.cursor.execute(
                    "INSERT INTO role (name) VALUES (%s) ON CONFLICT DO NOTHING",
                    (role,)
                )
            except Exception as e:
                logger.error(f"Error inserting role {role}: {e}")
        
        self.conn.commit()
        logger.info(f"Inserted {len(common_roles)} roles")
    
    def get_language_id(self, language_code):
        """Get language ID from database"""
        if not language_code:
            return None
        
        # Get language name from TMDB
        languages = self.make_api_request("/configuration/languages")
        if languages:
            for lang in languages:
                if lang['iso_639_1'] == language_code:
                    self.cursor.execute("SELECT language_id FROM language WHERE name = %s", (lang['english_name'],))
                    result = self.cursor.fetchone()
                    return result[0] if result else None
        return None
    
    def get_genre_id(self, genre_name):
        """Get genre ID from database"""
        self.cursor.execute("SELECT genre_id FROM genre WHERE name = %s", (genre_name,))
        result = self.cursor.fetchone()
        return result[0] if result else None
    
    def get_country_id(self, country_code):
        """Get country ID from database"""
        if not country_code:
            return None
        
        # Get country name from TMDB
        countries = self.make_api_request("/configuration/countries")
        if countries:
            for country in countries:
                if country['iso_3166_1'] == country_code:
                    self.cursor.execute("SELECT country_id FROM country WHERE name = %s", (country['english_name'],))
                    result = self.cursor.fetchone()
                    return result[0] if result else None
        return None
    
    def get_trailer_url(self, content_id, content_type='movie'):
        """Get YouTube trailer URL for movie or TV show"""
        endpoint = f"/{content_type}/{content_id}/videos"
        videos_data = self.make_api_request(endpoint)
        
        if videos_data and 'results' in videos_data:
            # Look for official trailers first, then any trailer
            trailers = [v for v in videos_data['results'] if v.get('type') == 'Trailer' and v.get('site') == 'YouTube']
            if trailers:
                # Prefer official trailers
                official_trailer = next((t for t in trailers if 'official' in t.get('name', '').lower()), trailers[0])
                return f"https://www.youtube.com/watch?v={official_trailer['key']}"
        return None

    def populate_movies(self, pages=8):
        """Populate movies from popular movies endpoint"""
        logger.info(f"Populating movies from {pages} pages...")

        for page in range(1, pages + 1):
            logger.info(f"Processing movies page {page}")
            data = self.make_api_request("/movie/popular", {"page": page})
            if not data or 'results' not in data:
                continue

            for movie in data['results']:
                try:
                    movie_details = self.make_api_request(f"/movie/{movie['id']}")
                    if not movie_details:
                        continue

                    # Filter inappropriate/low-quality titles
                    if not is_appropriate_title(movie_details.get('title', '')):
                        logger.info(f"Skipped inappropriate/low-quality movie: {movie_details.get('title')}")
                        continue

                    language_id = self.get_language_id(movie_details.get('original_language'))
                    trailer_url = self.get_trailer_url(movie['id'], 'movie')

                    self.cursor.execute("""
                        INSERT INTO content (title, description, release_date, type, 
                                            duration, poster_url, trailer_url, budget, box_office_collection, 
                                            currency_code, min_age, views)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING content_id
                    """, (
                        movie_details.get('title'),
                        movie_details.get('overview'),
                        movie_details.get('release_date') if movie_details.get('release_date') else None,
                        'Movie',
                        movie_details.get('runtime'),
                        f"https://image.tmdb.org/t/p/w500{movie_details.get('poster_path')}" if movie_details.get('poster_path') else None,
                        trailer_url,
                        movie_details.get('budget'),
                        movie_details.get('revenue'),
                        'USD',
                        13,
                        0
                    ))

                    content_id = self.cursor.fetchone()[0]

                    # Insert genres
                    if movie_details.get('genres'):
                        for genre in movie_details['genres']:
                            genre_id = self.get_genre_id(genre['name'])
                            if genre_id:
                                self.cursor.execute(
                                    "INSERT INTO content_genre (content_id, genre_id) VALUES (%s, %s)",
                                    (content_id, genre_id)
                                )

                    # Insert production countries
                    if movie_details.get('production_countries'):
                        for country in movie_details['production_countries']:
                            country_id = self.get_country_id(country['iso_3166_1'])
                            if country_id:
                                self.cursor.execute(
                                    "INSERT INTO content_country (content_id, country_id, role) VALUES (%s, %s, %s)",
                                    (content_id, country_id, 'production')
                                )

                    self.conn.commit()
                    logger.info(f"Inserted movie: {movie_details.get('title')}")

                except Exception as e:
                    logger.error(f"Error inserting movie {movie.get('title', 'Unknown')}: {e}")
                    self.conn.rollback()

    def populate_tv_shows(self, pages=8):
        """Populate TV series from popular TV endpoint with series-level trailer check"""
        logger.info(f"Populating TV series from {pages} pages...")

        for page in range(1, pages + 1):
            logger.info(f"Processing TV series page {page}")
            data = self.make_api_request("/tv/popular", {"page": page})
            if not data or 'results' not in data:
                continue

            for show in data['results']:
                try:
                    show_details = self.make_api_request(f"/tv/{show['id']}")
                    if not show_details:
                        continue

                    # Filter inappropriate/low-quality titles
                    if not is_appropriate_title(show_details.get('name', '')):
                        logger.info(f"Skipped inappropriate/low-quality show: {show_details.get('name')}")
                        continue

                    # --- FILTERS ---
                    seasons = show_details.get('seasons', [])
                    # Only consider "Series" (not general TV shows)
                    if show_details.get('type', '').lower() != 'scripted' and show_details.get('type', '').lower() != 'series':
                        logger.info(f"Skipped '{show_details.get('name')}' because it's not a scripted series.")
                        continue

                    # Skip if too many seasons
                    if len(seasons) > 4:
                        logger.info(f"Skipped '{show_details.get('name')}' due to too many seasons ({len(seasons)})")
                        continue

                    # Check for seasons with too many episodes
                    skip_show = False
                    for season in seasons:
                        if season['season_number'] == 0:
                            continue  # skip specials
                        season_details = self.make_api_request(f"/tv/{show['id']}/season/{season['season_number']}")
                        if season_details and 'episodes' in season_details:
                            if len(season_details['episodes']) > 30:
                                logger.info(f"Skipped '{show_details.get('name')}' due to season {season['season_number']} having too many episodes ({len(season_details['episodes'])})")
                                skip_show = True
                                break
                    if skip_show:
                        continue

                    # Check for a trailer at the series level
                    trailer_url = self.get_trailer_url(show['id'], 'tv')
                    if not trailer_url:
                        logger.info(f"Skipped '{show_details.get('name')}' because the series has no trailer.")
                        continue
                    # --- END FILTERS ---

                    self.cursor.execute("""
                        INSERT INTO content (title, description, release_date, type, 
                                            poster_url, trailer_url, min_age, views)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING content_id
                    """, (
                        show_details.get('name'),
                        show_details.get('overview'),
                        show_details.get('first_air_date') if show_details.get('first_air_date') else None,
                        'Series',
                        f"https://image.tmdb.org/t/p/w500{show_details.get('poster_path')}" if show_details.get('poster_path') else None,
                        trailer_url,
                        13,
                        0
                    ))

                    content_id = self.cursor.fetchone()[0]

                    # Insert genres
                    if show_details.get('genres'):
                        for genre in show_details['genres']:
                            genre_id = self.get_genre_id(genre['name'])
                            if genre_id:
                                self.cursor.execute(
                                    "INSERT INTO content_genre (content_id, genre_id) VALUES (%s, %s)",
                                    (content_id, genre_id)
                                )

                    # Insert production countries
                    if show_details.get('production_countries'):
                        for country in show_details['production_countries']:
                            country_id = self.get_country_id(country['iso_3166_1'])
                            if country_id:
                                self.cursor.execute(
                                    "INSERT INTO content_country (content_id, country_id, role) VALUES (%s, %s, %s)",
                                    (content_id, country_id, 'production')
                                )

                    self.conn.commit()
                    logger.info(f"Inserted TV series: {show_details.get('name')}")

                except Exception as e:
                    logger.error(f"Error inserting TV series {show.get('name', 'Unknown')}: {e}")
                    self.conn.rollback()
    def populate_celebrities(self, pages=3):
        """Populate celebrities from popular people endpoint"""
        logger.info(f"Populating celebrities from {pages} pages...")
        
        for page in range(1, pages + 1):
            logger.info(f"Processing celebrities page {page}")
            data = self.make_api_request("/person/popular", {"page": page})
            if not data or 'results' not in data:
                continue
            
            for person in data['results']:
                try:
                    # Get detailed person information
                    person_details = self.make_api_request(f"/person/{person['id']}")
                    if not person_details:
                        continue
                    
                    # Insert celebrity
                    self.cursor.execute("""
                        INSERT INTO celebrity (name, bio, birth_date, death_date, 
                                             place_of_birth, gender, photo_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING celebrity_id
                    """, (
                        person_details.get('name'),
                        person_details.get('biography'),
                        person_details.get('birthday') if person_details.get('birthday') else None,
                        person_details.get('deathday') if person_details.get('deathday') else None,
                        person_details.get('place_of_birth'),
                        'Male' if person_details.get('gender') == 2 else 'Female' if person_details.get('gender') == 1 else 'Other',
                        f"https://image.tmdb.org/t/p/w500{person_details.get('profile_path')}" if person_details.get('profile_path') else None
                    ))
                    
                    celebrity_id = self.cursor.fetchone()[0]
                    
                    # Insert known roles
                    if person_details.get('known_for_department'):
                        dept = person_details['known_for_department']
                        role_name = 'Actor' if dept == 'Acting' else dept
                        
                        self.cursor.execute("SELECT role_id FROM role WHERE name = %s", (role_name,))
                        role_result = self.cursor.fetchone()
                        if role_result:
                            self.cursor.execute(
                                "INSERT INTO celebrity_role (celebrity_id, role_id) VALUES (%s, %s)",
                                (celebrity_id, role_result[0])
                            )
                    
                    self.conn.commit()
                    logger.info(f"Inserted celebrity: {person_details.get('name')}")
                    
                except Exception as e:
                    logger.error(f"Error inserting celebrity {person.get('name', 'Unknown')}: {e}")
                    self.conn.rollback()
    
    def run_population(self):
        """Run the complete data population process"""
        try:
            self.connect_db()
            
            # Populate reference tables first
            # self.populate_countries()
            # self.populate_languages()
            # self.populate_genres()
            # self.populate_roles()
            
            # Populate main content
            # self.populate_movies(pages=8)      # Get 160 popular movies
            self.populate_tv_shows(pages=20)    # Get 40 popular TV shows
            # self.populate_celebrities(pages=3) # Get 60 popular celebrities
            
            logger.info("Data population completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during population: {e}")
            if self.conn:
                self.conn.rollback()
        finally:
            self.close_db()

if __name__ == "__main__":
    populator = TMDBDataPopulator()
    populator.run_population()
