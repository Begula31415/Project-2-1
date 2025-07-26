#!/usr/bin/env python3
"""
Season Poster Populator Script
This script populates the season table with poster URLs from TMDB API
for existing TV series in the database.
"""

import os
import sys
import time
import requests
import psycopg2
import logging
from datetime import datetime
from typing import Optional, Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('season_poster_population.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SeasonPosterPopulator:
    def __init__(self):
        """Initialize the season poster populator with TMDB API and database connections."""
        # TMDB Configuration
        self.tmdb_api_key = "dbff8d9d00c960063466e9b257954bd8"  # Your existing TMDB API key
        self.tmdb_base_url = "https://api.themoviedb.org/3"
        self.tmdb_image_base_url = "https://image.tmdb.org/t/p/w500"
        
        # Request session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'FilmFusion Season Poster Populator/1.0'
        })
        
        # Database connection
        self.conn = None
        self.cursor = None
        
        # Rate limiting
        self.request_delay = 0.25  # 4 requests per second (TMDB limit is 40/10s)
        
    def connect_to_database(self) -> bool:
        """Establish connection to PostgreSQL database."""
        try:
            # Update these connection parameters to match your database
            self.conn = psycopg2.connect(
                host="ep-wild-sun-a847eqq8-pooler.eastus2.azure.neon.tech",
                database="neondb",
                user="neondb_owner",
                password="npg_VwHRAkxd0ST1",
                port="5432",
                sslmode="require"
            )
            self.cursor = self.conn.cursor()
            logger.info("Successfully connected to database")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    def close_database_connection(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database connection closed")
    
    def search_tmdb_series(self, series_title: str) -> Optional[int]:
        """
        Search for a TV series on TMDB and return the series ID.
        
        Args:
            series_title: The title of the series to search for
            
        Returns:
            TMDB series ID if found, None otherwise
        """
        try:
            # Clean up the series title for better matching
            cleaned_title = series_title.strip()
            
            url = f"{self.tmdb_base_url}/search/tv"
            params = {
                'api_key': self.tmdb_api_key,
                'query': cleaned_title,
                'language': 'en-US',
                'page': 1
            }
            
            time.sleep(self.request_delay)  # Rate limiting
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data['results']:
                # Find best match (exact title match preferred)
                for result in data['results']:
                    if result['name'].lower() == cleaned_title.lower():
                        logger.info(f"Found exact match for '{series_title}': TMDB ID {result['id']}")
                        return result['id']
                
                # If no exact match, use first result
                first_result = data['results'][0]
                logger.info(f"Using best match for '{series_title}': '{first_result['name']}' (TMDB ID {first_result['id']})")
                return first_result['id']
            
            logger.warning(f"No TMDB results found for series: {series_title}")
            return None
            
        except Exception as e:
            logger.error(f"Error searching TMDB for series '{series_title}': {e}")
            return None
    
    def get_season_details(self, tmdb_series_id: int, season_number: int) -> Optional[Dict[str, Any]]:
        """
        Get season details from TMDB including poster URL.
        
        Args:
            tmdb_series_id: TMDB series ID
            season_number: Season number
            
        Returns:
            Season details dictionary or None if not found
        """
        try:
            url = f"{self.tmdb_base_url}/tv/{tmdb_series_id}/season/{season_number}"
            params = {
                'api_key': self.tmdb_api_key,
                'language': 'en-US'
            }
            
            time.sleep(self.request_delay)  # Rate limiting
            response = self.session.get(url, params=params)
            
            if response.status_code == 404:
                logger.warning(f"Season {season_number} not found for TMDB series {tmdb_series_id}")
                return None
                
            response.raise_for_status()
            data = response.json()
            
            poster_url = None
            if data.get('poster_path'):
                poster_url = f"{self.tmdb_image_base_url}{data['poster_path']}"
            
            return {
                'season_number': data.get('season_number'),
                'name': data.get('name'),
                'poster_url': poster_url,
                'episode_count': data.get('episode_count'),
                'air_date': data.get('air_date')
            }
            
        except Exception as e:
            logger.error(f"Error getting season details for TMDB series {tmdb_series_id}, season {season_number}: {e}")
            return None
    
    def get_existing_series_and_seasons(self) -> List[Dict[str, Any]]:
        """
        Get all existing series and their seasons from the database.
        
        Returns:
            List of dictionaries containing series and season information
        """
        try:
            query = """
            SELECT 
                c.content_id as series_id,
                c.title as series_title,
                s.season_id,
                s.season_number,
                s.season_name,
                s.poster_url as current_poster_url
            FROM content c
            JOIN season s ON c.content_id = s.series_id
            WHERE c.type = 'Series'
            ORDER BY c.title, s.season_number
            """
            
            self.cursor.execute(query)
            results = self.cursor.fetchall()
            
            series_seasons = []
            for row in results:
                series_seasons.append({
                    'series_id': row[0],
                    'series_title': row[1],
                    'season_id': row[2],
                    'season_number': row[3],
                    'season_name': row[4],
                    'current_poster_url': row[5]
                })
            
            logger.info(f"Found {len(series_seasons)} seasons across {len(set(r['series_id'] for r in series_seasons))} series")
            return series_seasons
            
        except Exception as e:
            logger.error(f"Error getting existing series and seasons: {e}")
            return []
    
    def update_season_poster(self, season_id: int, poster_url: str) -> bool:
        """
        Update the poster URL for a specific season.
        
        Args:
            season_id: Database season ID
            poster_url: URL to the season poster
            
        Returns:
            True if successful, False otherwise
        """
        try:
            query = "UPDATE season SET poster_url = %s WHERE season_id = %s"
            self.cursor.execute(query, (poster_url, season_id))
            self.conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error updating poster for season {season_id}: {e}")
            self.conn.rollback()
            return False
    
    def populate_season_posters(self, force_update: bool = False) -> None:
        """
        Main method to populate season posters for all existing series.
        
        Args:
            force_update: If True, update even seasons that already have poster URLs
        """
        if not self.connect_to_database():
            logger.error("Cannot proceed without database connection")
            return
        
        try:
            # Get all existing series and seasons
            series_seasons = self.get_existing_series_and_seasons()
            
            if not series_seasons:
                logger.info("No series and seasons found in database")
                return
            
            # Group by series to minimize TMDB API calls
            series_groups = {}
            for item in series_seasons:
                series_id = item['series_id']
                if series_id not in series_groups:
                    series_groups[series_id] = {
                        'title': item['series_title'],
                        'seasons': []
                    }
                series_groups[series_id]['seasons'].append(item)
            
            total_seasons = len(series_seasons)
            updated_count = 0
            skipped_count = 0
            error_count = 0
            
            logger.info(f"Starting to populate posters for {total_seasons} seasons across {len(series_groups)} series")
            
            for series_id, series_data in series_groups.items():
                series_title = series_data['title']
                seasons = series_data['seasons']
                
                logger.info(f"Processing series: {series_title} ({len(seasons)} seasons)")
                
                # Search for the series on TMDB
                tmdb_series_id = self.search_tmdb_series(series_title)
                
                if not tmdb_series_id:
                    logger.warning(f"Could not find TMDB ID for series: {series_title}")
                    error_count += len(seasons)
                    continue
                
                # Process each season
                for season_info in seasons:
                    season_id = season_info['season_id']
                    season_number = season_info['season_number']
                    current_poster = season_info['current_poster_url']
                    
                    # Skip if poster already exists and not forcing update
                    if current_poster and not force_update:
                        logger.info(f"Season {season_number} of '{series_title}' already has poster, skipping")
                        skipped_count += 1
                        continue
                    
                    # Get season details from TMDB
                    season_details = self.get_season_details(tmdb_series_id, season_number)
                    
                    if not season_details or not season_details['poster_url']:
                        logger.warning(f"No poster found for season {season_number} of '{series_title}'")
                        error_count += 1
                        continue
                    
                    # Update the database
                    poster_url = season_details['poster_url']
                    if self.update_season_poster(season_id, poster_url):
                        logger.info(f"Updated poster for season {season_number} of '{series_title}': {poster_url}")
                        updated_count += 1
                    else:
                        logger.error(f"Failed to update poster for season {season_number} of '{series_title}'")
                        error_count += 1
            
            # Summary
            logger.info("="*50)
            logger.info("SEASON POSTER POPULATION COMPLETE")
            logger.info(f"Total seasons processed: {total_seasons}")
            logger.info(f"Successfully updated: {updated_count}")
            logger.info(f"Skipped (already had posters): {skipped_count}")
            logger.info(f"Errors/Not found: {error_count}")
            logger.info("="*50)
            
        except Exception as e:
            logger.error(f"Error in populate_season_posters: {e}")
        finally:
            self.close_database_connection()
    
    def validate_api_key(self) -> bool:
        """Validate TMDB API key."""
        try:
            url = f"{self.tmdb_base_url}/configuration"
            params = {'api_key': self.tmdb_api_key}
            
            response = self.session.get(url, params=params)
            if response.status_code == 401:
                logger.error("Invalid TMDB API key")
                return False
            elif response.status_code == 200:
                logger.info("TMDB API key validated successfully")
                return True
            else:
                logger.warning(f"Unexpected response validating API key: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Error validating API key: {e}")
            return False

def main():
    """Main function to run the season poster populator."""
    print("FilmFusion Season Poster Populator")
    print("="*40)
    
    # Check if API key needs to be set
    populator = SeasonPosterPopulator()
    
    if populator.tmdb_api_key == "YOUR_TMDB_API_KEY_HERE":
        print("\n❌ TMDB API key not configured!")
        print("Please edit this file and replace 'YOUR_TMDB_API_KEY_HERE' with your actual TMDB API key.")
        print("You can get a free API key from: https://www.themoviedb.org/settings/api")
        return
    
    # Validate API key
    if not populator.validate_api_key():
        print("\n❌ TMDB API key validation failed!")
        return
    
    # Ask user for confirmation
    print(f"\nThis script will:")
    print("1. Connect to your FilmFusion database")
    print("2. Find all existing TV series and their seasons")
    print("3. Search TMDB for matching series")
    print("4. Download season poster URLs")
    print("5. Update the season table with poster URLs")
    
    choice = input("\nDo you want to proceed? (y/n): ").lower().strip()
    if choice != 'y':
        print("Operation cancelled.")
        return
    
    # Ask about force update
    force_update = False
    force_choice = input("Force update seasons that already have posters? (y/n): ").lower().strip()
    if force_choice == 'y':
        force_update = True
    
    # Run the populator
    try:
        populator.populate_season_posters(force_update=force_update)
        print("\n✅ Season poster population completed!")
        print("Check the 'season_poster_population.log' file for detailed logs.")
    except KeyboardInterrupt:
        print("\n\n⚠️ Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        logger.error(f"Main execution error: {e}")

if __name__ == "__main__":
    main()
