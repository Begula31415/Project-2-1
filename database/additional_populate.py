# additional_populate.py - Scripts for remaining tables

import psycopg2
import requests
import json
import time
from datetime import datetime
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdditionalDataPopulator:
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
    
    def is_appropriate_title(title):
        """Return False if the title is inappropriate or low-quality."""
        banned_keywords = [
            "ass", "a$$", "cock", "dick", "pussy", "fuck", "shit", "bitch", "cunt", "penis", "vagina",
            "taboo", "porn", "xxx", "sex", "nude", "slut", "whore", "xXx"
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

    def populate_awards(self):
        """Populate awards table with popular awards"""
        logger.info("Populating awards...")
        
        # Common film awards
        awards = [
            {"name": "Academy Award for Best Picture", "type": "Academy Award"},
            {"name": "Academy Award for Best Director", "type": "Academy Award"},
            {"name": "Academy Award for Best Actor", "type": "Academy Award"},
            {"name": "Academy Award for Best Actress", "type": "Academy Award"},
            {"name": "Academy Award for Best Supporting Actor", "type": "Academy Award"},
            {"name": "Academy Award for Best Supporting Actress", "type": "Academy Award"},
            {"name": "Golden Globe Award for Best Motion Picture", "type": "Golden Globe"},
            {"name": "Golden Globe Award for Best Director", "type": "Golden Globe"},
            {"name": "Golden Globe Award for Best Actor", "type": "Golden Globe"},
            {"name": "Golden Globe Award for Best Actress", "type": "Golden Globe"},
            {"name": "BAFTA Award for Best Film", "type": "BAFTA"},
            {"name": "BAFTA Award for Best Director", "type": "BAFTA"},
            {"name": "Emmy Award for Outstanding Drama Series", "type": "Emmy"},
            {"name": "Emmy Award for Outstanding Comedy Series", "type": "Emmy"},
            {"name": "Screen Actors Guild Award for Outstanding Performance", "type": "SAG"},
            {"name": "Cannes Film Festival Palme d'Or", "type": "Cannes"},
        ]
        
        for award in awards:
            for year in range(2018, 2025):  # Last 7 years
                try:
                    self.cursor.execute(
                        "INSERT INTO award (name, year, type) VALUES (%s, %s, %s)",
                        (award["name"], year, award["type"])
                    )
                except Exception as e:
                    logger.error(f"Error inserting award {award['name']} {year}: {e}")
        
        self.conn.commit()
        logger.info(f"Inserted awards for years 2018-2024")
    
    def populate_seasons_and_episodes(self):
        """Populate seasons and episodes for TV series"""
        logger.info("Populating seasons and episodes...")
        
        # Get all TV series from content table
        self.cursor.execute("SELECT content_id, title FROM content WHERE type = 'Series'")
        tv_series = self.cursor.fetchall()
        
        for content_id, title in tv_series:
            try:
                # Get TMDB ID for this series (we'll need to store this mapping)
                # For now, we'll search for the series by title
                search_data = self.make_api_request("/search/tv", {"query": title})
                if not search_data or not search_data.get('results'):
                    continue
                
                tmdb_id = search_data['results'][0]['id']
                
                # Get season details
                series_details = self.make_api_request(f"/tv/{tmdb_id}")
                if not series_details:
                    continue
                
                seasons = series_details.get('seasons', [])
                for season in seasons:
                    if season['season_number'] == 0:  # Skip specials
                        continue
                    
                    # Insert season
                    self.cursor.execute("""
                        INSERT INTO season (series_id, season_number, season_name, description, 
                                          episode_count, release_date)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING season_id
                    """, (
                        content_id,
                        season['season_number'],
                        season['name'],
                        season['overview'],
                        season['episode_count'],
                        season.get('air_date')
                    ))
                    
                    season_id = self.cursor.fetchone()[0]
                    
                    # Get episodes for this season
                    season_details = self.make_api_request(f"/tv/{tmdb_id}/season/{season['season_number']}")
                    if season_details and 'episodes' in season_details:
                        for episode in season_details['episodes']:
                            self.cursor.execute("""
                                INSERT INTO episode (season_id, episode_number, title, duration, 
                                                   release_date)
                                VALUES (%s, %s, %s, %s, %s)
                            """, (
                                season_id,
                                episode['episode_number'],
                                episode['name'],
                                episode.get('runtime'),
                                episode.get('air_date')
                            ))
                
                self.conn.commit()
                logger.info(f"Inserted seasons/episodes for: {title}")
                
            except Exception as e:
                logger.error(f"Error processing series {title}: {e}")
                self.conn.rollback()
    
    def populate_celebrity_content_relationships(self):
        """Populate celebrity-content relationships using TMDB cast/crew data"""
        logger.info("Populating celebrity-content relationships...")
        
        # Get all content IDs and titles
        self.cursor.execute("SELECT content_id, title, type FROM content")
        content_list = self.cursor.fetchall()
        
        for content_id, title, content_type in content_list:
            try:
                # Search for the content on TMDB
                search_endpoint = "/search/movie" if content_type == "Movie" else "/search/tv"
                search_data = self.make_api_request(search_endpoint, {"query": title})
                
                if not search_data or not search_data.get('results'):
                    continue
                
                tmdb_id = search_data['results'][0]['id']
                
                # Get credits
                credits_endpoint = f"/movie/{tmdb_id}/credits" if content_type == "Movie" else f"/tv/{tmdb_id}/credits"
                credits_data = self.make_api_request(credits_endpoint)
                
                if not credits_data:
                    continue
                
                # Process cast (actors)
                for cast_member in credits_data.get('cast', [])[:10]:  # Limit to top 10
                    # Find celebrity in our database
                    self.cursor.execute("SELECT celebrity_id FROM celebrity WHERE name = %s", (cast_member['name'],))
                    celebrity_result = self.cursor.fetchone()
                    
                    if celebrity_result:
                        celebrity_id = celebrity_result[0]
                        
                        # Get actor role ID
                        self.cursor.execute("SELECT role_id FROM role WHERE name = 'Actor'")
                        role_result = self.cursor.fetchone()
                        
                        if role_result:
                            role_id = role_result[0]
                            
                            # Insert celebrity-role relationship if not exists
                            self.cursor.execute("""
                                INSERT INTO celebrity_role (celebrity_id, role_id) 
                                VALUES (%s, %s) 
                                ON CONFLICT DO NOTHING
                                RETURNING celebrity_role_id
                            """, (celebrity_id, role_id))
                            
                            result = self.cursor.fetchone()
                            if result:
                                celebrity_role_id = result[0]
                            else:
                                # Get existing celebrity_role_id
                                self.cursor.execute(
                                    "SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = %s AND role_id = %s",
                                    (celebrity_id, role_id)
                                )
                                celebrity_role_id = self.cursor.fetchone()[0]
                            
                            # Insert celebrity-role-content relationship
                            self.cursor.execute("""
                                INSERT INTO celebrity_role_content (celebrity_role_id, content_id) 
                                VALUES (%s, %s) 
                                ON CONFLICT DO NOTHING
                            """, (celebrity_role_id, content_id))
                
                # Process crew (directors, producers, etc.)
                for crew_member in credits_data.get('crew', [])[:5]:  # Limit to top 5
                    # Find celebrity in our database
                    self.cursor.execute("SELECT celebrity_id FROM celebrity WHERE name = %s", (crew_member['name'],))
                    celebrity_result = self.cursor.fetchone()
                    
                    if celebrity_result:
                        celebrity_id = celebrity_result[0]
                        
                        # Get role ID based on job
                        job = crew_member.get('job', 'Producer')
                        self.cursor.execute("SELECT role_id FROM role WHERE name = %s", (job,))
                        role_result = self.cursor.fetchone()
                        
                        if role_result:
                            role_id = role_result[0]
                            
                            # Insert celebrity-role relationship if not exists
                            self.cursor.execute("""
                                INSERT INTO celebrity_role (celebrity_id, role_id) 
                                VALUES (%s, %s) 
                                ON CONFLICT DO NOTHING
                                RETURNING celebrity_role_id
                            """, (celebrity_id, role_id))
                            
                            result = self.cursor.fetchone()
                            if result:
                                celebrity_role_id = result[0]
                            else:
                                # Get existing celebrity_role_id
                                self.cursor.execute(
                                    "SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = %s AND role_id = %s",
                                    (celebrity_id, role_id)
                                )
                                existing = self.cursor.fetchone()
                                if existing:
                                    celebrity_role_id = existing[0]
                                else:
                                    continue
                            
                            # Insert celebrity-role-content relationship
                            self.cursor.execute("""
                                INSERT INTO celebrity_role_content (celebrity_role_id, content_id) 
                                VALUES (%s, %s) 
                                ON CONFLICT DO NOTHING
                            """, (celebrity_role_id, content_id))
                
                self.conn.commit()
                logger.info(f"Processed relationships for: {title}")
                
            except Exception as e:
                logger.error(f"Error processing relationships for {title}: {e}")
                self.conn.rollback()
    
    def update_season_trailers(self):
        """Update trailer_url for all seasons in the season table."""
        logger.info("Updating season trailer URLs...")
        self.cursor.execute("SELECT season_id, series_id, season_number FROM season")
        seasons = self.cursor.fetchall()
        for season_id, series_id, season_number in seasons:
            # Get TMDB ID for this series (you may need to fetch it from your content table)
            self.cursor.execute("SELECT title FROM content WHERE content_id = %s", (series_id,))
            row = self.cursor.fetchone()
            if not row:
                continue
            title = row[0]
            # Search TMDB for the series to get tmdb_id
            search_data = self.make_api_request("/search/tv", {"query": title})
            if not search_data or not search_data.get('results'):
                continue
            tmdb_id = search_data['results'][0]['id']
            # Get season details with videos
            season_details = self.make_api_request(f"/tv/{tmdb_id}/season/{season_number}")
            trailer_url = None
            if season_details and 'videos' in season_details and 'results' in season_details['videos']:
                for video in season_details['videos']['results']:
                    if video.get('type') == 'Trailer' and video.get('site') == 'YouTube':
                        trailer_url = f"https://www.youtube.com/watch?v={video['key']}"
                        break
            # Update the trailer_url in the season table
            self.cursor.execute(
                "UPDATE season SET trailer_url = %s WHERE season_id = %s",
                (trailer_url, season_id)
            )
        self.conn.commit()
        logger.info("Season trailer URLs updated.")
    # def populate_sample_users(self):
    #     """Populate sample users and registered users"""
    #     logger.info("Populating sample users...")
        
    #     sample_users = [
    #         {"name": "John Doe", "email": "john.doe@example.com", "username": "johndoe", "bio": "Movie enthusiast"},
    #         {"name": "Jane Smith", "email": "jane.smith@example.com", "username": "janesmith", "bio": "TV series lover"},
    #         {"name": "Mike Johnson", "email": "mike.johnson@example.com", "username": "mikej", "bio": "Film critic"},
    #         {"name": "Sarah Wilson", "email": "sarah.wilson@example.com", "username": "sarahw", "bio": "Documentary fan"},
    #         {"name": "Alex Brown", "email": "alex.brown@example.com", "username": "alexb", "bio": "Action movie fan"},
    #     ]
        
    #     for user in sample_users:
    #         try:
    #             # Insert user
    #             self.cursor.execute("""
    #                 INSERT INTO users (name, email, username, password_hash, bio, role)
    #                 VALUES (%s, %s, %s, %s, %s, %s)
    #                 RETURNING user_id
    #             """, (
    #                 user["name"],
    #                 user["email"],
    #                 user["username"],
    #                 "hashed_password_here",  # In real app, use proper hashing
    #                 user["bio"],
    #                 "user"
    #             ))
                
    #             user_id = self.cursor.fetchone()[0]
                
    #             # Insert registered user
    #             self.cursor.execute("""
    #                 INSERT INTO registered_user (user_id, profile_picture_url)
    #                 VALUES (%s, %s)
    #             """, (user_id, f"https://ui-avatars.com/api/?name={user['name'].replace(' ', '+')}&background=random"))
                
    #         except Exception as e:
    #             logger.error(f"Error inserting user {user['name']}: {e}")
        
    #     self.conn.commit()
    #     logger.info(f"Inserted {len(sample_users)} sample users")
    
    def populate_sample_reviews_and_ratings(self):
        """Populate sample reviews and ratings"""
        logger.info("Populating sample reviews and ratings...")
        
        # Get registered users
        self.cursor.execute("SELECT registered_user_id FROM registered_user")
        users = [row[0] for row in self.cursor.fetchall()]
        
        # Get content IDs
        self.cursor.execute("SELECT content_id FROM content")
        content_ids = [row[0] for row in self.cursor.fetchall()]
        
        sample_reviews = [
            "Amazing movie! Great storyline and excellent acting.",
            "One of the best series I've ever watched. Highly recommended!",
            "Good entertainment value but could have been better.",
            "Brilliant cinematography and direction. A masterpiece!",
            "Decent watch but nothing extraordinary.",
            "Waste of time. Poor script and bad acting.",
            "Excellent production quality and engaging plot.",
            "Perfect for weekend binge-watching!",
        ]
        
        for user_id in users:
            # Each user reviews 5-10 random content items
            user_content = random.sample(content_ids, min(10, len(content_ids)))
            
            for content_id in user_content:
                try:
                    # Insert review
                    review_text = random.choice(sample_reviews)
                    self.cursor.execute("""
                        INSERT INTO review (registered_user_id, content_id, text, created_at)
                        VALUES (%s, %s, %s, %s)
                        RETURNING review_id
                    """, (user_id, content_id, review_text, datetime.now()))
                    
                    review_id = self.cursor.fetchone()[0]
                    
                    # Insert rating
                    rating_score = random.uniform(1.0, 10.0)
                    self.cursor.execute("""
                        INSERT INTO rating (registered_user_id, content_id, score, created_at)
                        VALUES (%s, %s, %s, %s)
                    """, (user_id, content_id, rating_score, datetime.now()))
                    
                    # Maybe add to wishlist (30% chance)
                    if random.random() < 0.3:
                        self.cursor.execute("""
                            INSERT INTO wishlist (registered_user_id, content_id)
                            VALUES (%s, %s)
                            ON CONFLICT DO NOTHING
                        """, (user_id, content_id))
                    
                except Exception as e:
                    logger.error(f"Error inserting review/rating: {e}")
        
        self.conn.commit()
        logger.info("Inserted sample reviews and ratings")
    
    def populate_additional_images(self):
        """Populate additional images for content and celebrities"""
        logger.info("Populating additional images...")
        
        # Get content with poster URLs
        self.cursor.execute("SELECT content_id, title, poster_url FROM content WHERE poster_url IS NOT NULL")
        content_list = self.cursor.fetchall()
        
        for content_id, title, poster_url in content_list:
            try:
                self.cursor.execute("""
                    INSERT INTO image (url, caption, uploaded_at, content_id)
                    VALUES (%s, %s, %s, %s)
                """, (poster_url, f"Poster for {title}", datetime.now(), content_id))
            except Exception as e:
                logger.error(f"Error inserting image for {title}: {e}")
        
        # Get celebrities with photo URLs
        self.cursor.execute("SELECT celebrity_id, name, photo_url FROM celebrity WHERE photo_url IS NOT NULL")
        celebrity_list = self.cursor.fetchall()
        
        for celebrity_id, name, photo_url in celebrity_list:
            try:
                self.cursor.execute("""
                    INSERT INTO image (url, caption, uploaded_at, celebrity_id)
                    VALUES (%s, %s, %s, %s)
                """, (photo_url, f"Photo of {name}", datetime.now(), celebrity_id))
            except Exception as e:
                logger.error(f"Error inserting image for {name}: {e}")
        
        self.conn.commit()
        logger.info("Inserted additional images")

    def populate_content_awards(self):
        """Randomly link content to awards for demo purposes"""
        logger.info("Populating content_award table...")
        self.cursor.execute("SELECT content_id FROM content")
        content_ids = [row[0] for row in self.cursor.fetchall()]
        self.cursor.execute("SELECT award_id FROM award")
        award_ids = [row[0] for row in self.cursor.fetchall()]
        for content_id in random.sample(content_ids, min(10, len(content_ids))):
            for award_id in random.sample(award_ids, min(3, len(award_ids))):
                try:
                    self.cursor.execute(
                        "INSERT INTO content_award (content_id, award_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (content_id, award_id)
                    )
                except Exception as e:
                    logger.error(f"Error linking content {content_id} to award {award_id}: {e}")
        self.conn.commit()
        logger.info("Inserted sample content_award links.")

    def populate_celebrity_awards(self):
        """Randomly link celebrities to awards for demo purposes"""
        logger.info("Populating celebrity_award table...")
        self.cursor.execute("SELECT celebrity_id FROM celebrity")
        celebrity_ids = [row[0] for row in self.cursor.fetchall()]
        self.cursor.execute("SELECT award_id FROM award")
        award_ids = [row[0] for row in self.cursor.fetchall()]
        for celebrity_id in random.sample(celebrity_ids, min(10, len(celebrity_ids))):
            for award_id in random.sample(award_ids, min(2, len(award_ids))):
                try:
                    self.cursor.execute(
                        "INSERT INTO celebrity_award (celebrity_id, award_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (celebrity_id, award_id)
                    )
                except Exception as e:
                    logger.error(f"Error linking celebrity {celebrity_id} to award {award_id}: {e}")
        self.conn.commit()
        logger.info("Inserted sample celebrity_award links.")

  
    def populate_content_views(self):
        logger.info("Populating content_views table...")
        self.cursor.execute("SELECT registered_user_id FROM registered_user")
        user_ids = [row[0] for row in self.cursor.fetchall()]
        self.cursor.execute("SELECT content_id FROM content")
        content_ids = [row[0] for row in self.cursor.fetchall()]
        logger.info(f"User IDs: {user_ids}")
        logger.info(f"Content IDs: {content_ids}")
        for user_id in user_ids:
            viewed_content = random.sample(content_ids, min(10, len(content_ids)))
            for content_id in viewed_content:
                try:
                    self.cursor.execute(
                        "INSERT INTO content_views (registered_user_id, content_id, when_viewed) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                        (user_id, content_id, datetime.now())
                    )
                except Exception as e:
                    logger.error(f"Error inserting content view: {e}")
        self.conn.commit()
        logger.info("Inserted sample content views.")

        
    def populate_reactions(self):
        logger.info("Populating reaction table...")
        self.cursor.execute("SELECT review_id FROM review")
        review_ids = [row[0] for row in self.cursor.fetchall()]
        self.cursor.execute("SELECT registered_user_id FROM registered_user")
        user_ids = [row[0] for row in self.cursor.fetchall()]
        reaction_types = ["like", "dislike", "love", "funny"]
        for review_id in review_ids:
            reacting_users = random.sample(user_ids, min(3, len(user_ids)))
            for user_id in reacting_users:
                try:
                    reaction = random.choice(reaction_types)
                    self.cursor.execute(
                        "INSERT INTO reaction (review_id, registered_user_id, type) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                        (review_id, user_id, reaction)
                    )
                except Exception as e:
                    logger.error(f"Error inserting reaction: {e}")
        self.conn.commit()
        logger.info("Inserted sample reactions.")    


    def populate_content_languages(self):
        logger.info("Repopulating content_language table from TMDB...")
        self.cursor.execute("SELECT content_id, title, type FROM content")
        content_list = self.cursor.fetchall()
        for content_id, title, content_type in content_list:
            try:
                search_endpoint = "/search/movie" if content_type == "Movie" else "/search/tv"
                search_data = self.make_api_request(search_endpoint, {"query": title})
                if not search_data or not search_data.get('results'):
                    continue
                tmdb_id = search_data['results'][0]['id']
                details_endpoint = f"/movie/{tmdb_id}" if content_type == "Movie" else f"/tv/{tmdb_id}"
                details = self.make_api_request(details_endpoint)
                if not details or 'spoken_languages' not in details:
                    continue
                for idx, lang in enumerate(details['spoken_languages']):
                    # Insert language if not exists
                    self.cursor.execute(
                        "INSERT INTO language (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                        (lang['english_name'],)
                    )
                    self.cursor.execute("SELECT language_id FROM language WHERE name = %s", (lang['english_name'],))
                    lang_row = self.cursor.fetchone()
                    if lang_row:
                        language_id = lang_row[0]
                        is_primary = (idx == 0)
                        self.cursor.execute(
                            "INSERT INTO content_language (content_id, language_id, is_primary) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                            (content_id, language_id, is_primary)
                        )
            except Exception as e:
                logger.error(f"Error linking content {content_id} to languages: {e}")
        self.conn.commit()
        logger.info("Repopulated content_language table.")    
    
    def run_additional_population(self):
        """Run additional data population"""
        try:
            self.connect_db()
            
            logger.info("Starting additional data population...")
            
            # Populate additional tables
            # self.populate_awards()
            # self.populate_content_awards()
            # self.populate_celebrity_awards()
            # # self.populate_sample_users()
            # self.populate_sample_reviews_and_ratings()
            # self.populate_additional_images()
            # self.populate_content_views()
            # self.populate_reactions()

        
            # self.populate_content_languages()
            
            # # These might take longer due to API calls
            # logger.info("Starting API-intensive operations...")
            # self.populate_seasons_and_episodes()
            # self.populate_celebrity_content_relationships()
            self.update_season_trailers()
            
            logger.info("Additional data population completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during additional population: {e}")
            if self.conn:
                self.conn.rollback()
        finally:
            self.close_db()

if __name__ == "__main__":
    populator = AdditionalDataPopulator()
    populator.run_additional_population()