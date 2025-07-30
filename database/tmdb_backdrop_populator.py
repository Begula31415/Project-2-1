#!/usr/bin/env python3
"""
Backdrop Image Populator Script
This script populates the image table with backdrop URLs from TMDB API
for existing content (movies and TV series) in the database.
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
        logging.FileHandler('backdrop_image_population.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class BackdropImagePopulator:
    def search_tmdb_content(self, title: str) -> dict:
        """
        Search TMDB for content (movie or TV) by title.
        Returns the best match dict or None if not found.
        """
        try:
            # Search for movie
            url_movie = f"{self.tmdb_base_url}/search/movie"
            params = {"api_key": self.tmdb_api_key, "query": title}
            response_movie = self.session.get(url_movie, params=params)
            if response_movie.status_code == 200:
                results = response_movie.json().get("results", [])
                if results:
                    best = max(results, key=lambda x: x.get("popularity", 0))
                    best["media_type"] = "movie"
                    return best
            # Search for TV
            url_tv = f"{self.tmdb_base_url}/search/tv"
            response_tv = self.session.get(url_tv, params=params)
            if response_tv.status_code == 200:
                results = response_tv.json().get("results", [])
                if results:
                    best = max(results, key=lambda x: x.get("popularity", 0))
                    best["media_type"] = "tv"
                    return best
            return None
        except Exception as e:
            logger.error(f"Error searching TMDB for content '{title}': {e}")
            return None
    def __init__(self):
        """Initialize the backdrop image populator with TMDB API and database connections."""
        # TMDB Configuration
        self.tmdb_api_key = "dbff8d9d00c960063466e9b257954bd8"  # Your existing TMDB API key
        self.tmdb_base_url = "https://api.themoviedb.org/3"
        self.tmdb_image_base_url = "https://image.tmdb.org/t/p/original"
        
        # Request session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'FilmFusion Backdrop Image Populator/1.0'
        })
        
        # Database connection
        self.conn = None
        self.cursor = None
        
        # Rate limiting
        self.request_delay = 0.25  # 4 requests per second (TMDB limit is 40/10s)
        
        # Configuration - No limit on images per content
        
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
    
    def search_tmdb_person(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Search for a person (celebrity) on TMDB and return the best match.
        
        Args:
            name: The name of the person to search for
            
        Returns:
            TMDB person details if found, None otherwise
        """
        try:
            # Clean up the name for better matching
            cleaned_name = name.strip()
            
            url = f"{self.tmdb_base_url}/search/person"
            params = {
                'api_key': self.tmdb_api_key,
                'query': cleaned_name,
                'language': 'en-US',
                'page': 1
            }
            
            time.sleep(self.request_delay)  # Rate limiting
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data['results']:
                # Find best match (exact name match preferred)
                for result in data['results']:
                    if result['name'].lower() == cleaned_name.lower():
                        logger.info(f"Found exact match for '{name}': '{result['name']}' (TMDB ID {result['id']})")
                        return result
                
                # If no exact match, use first result
                first_result = data['results'][0]
                logger.info(f"Using best match for '{name}': '{first_result['name']}' (TMDB ID {first_result['id']})")
                return first_result
            
            logger.warning(f"No TMDB results found for person: {name}")
            return None
            
        except Exception as e:
            logger.error(f"Error searching TMDB for person '{name}': {e}")
            return None
    
    def get_tmdb_person_images(self, tmdb_id: int) -> List[Dict[str, Any]]:
        """
        Get profile images for specific TMDB person.
        
        Args:
            tmdb_id: TMDB person ID
            
        Returns:
            List of profile image details
        """
        try:
            url = f"{self.tmdb_base_url}/person/{tmdb_id}/images"
            params = {
                'api_key': self.tmdb_api_key
            }
            
            time.sleep(self.request_delay)  # Rate limiting
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            profiles = data.get('profiles', [])
            
            if profiles:
                logger.info(f"Found {len(profiles)} profile images for TMDB person ID {tmdb_id}")
            else:
                logger.warning(f"No profile images found for TMDB person ID {tmdb_id}")
            
            return profiles
            
        except Exception as e:
            logger.error(f"Error getting images for TMDB person ID {tmdb_id}: {e}")
            return []
        """
        Search for content (movie or TV series) on TMDB and return the best match.
        
        Args:
            title: The title of the content to search for
            
        Returns:
            TMDB content details if found, None otherwise
        """
        try:
            # Clean up the title for better matching
            cleaned_title = title.strip()
            
            url = f"{self.tmdb_base_url}/search/multi"
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
                # Filter out person results, keep only movies and TV shows
                content_results = [r for r in data['results'] if r.get('media_type') in ['movie', 'tv']]
                
                if not content_results:
                    logger.warning(f"No movie/TV results found for: {title}")
                    return None
                
                # Find best match (exact title match preferred)
                for result in content_results:
                    result_title = result.get('title') or result.get('name', '')
                    if result_title.lower() == cleaned_title.lower():
                        logger.info(f"Found exact match for '{title}': '{result_title}' (TMDB ID {result['id']})")
                        return result
                
                # If no exact match, use first result
                first_result = content_results[0]
                result_title = first_result.get('title') or first_result.get('name', '')
                logger.info(f"Using best match for '{title}': '{result_title}' (TMDB ID {first_result['id']})")
                return first_result
            
            logger.warning(f"No TMDB results found for content: {title}")
            return None
            
        except Exception as e:
            logger.error(f"Error searching TMDB for content '{title}': {e}")
            return None
    
    def get_tmdb_images(self, tmdb_id: int, media_type: str) -> List[Dict[str, Any]]:
        """
        Get backdrop images for specific TMDB content.
        
        Args:
            tmdb_id: TMDB content ID
            media_type: 'movie' or 'tv'
            
        Returns:
            List of backdrop image details
        """
        try:
            url = f"{self.tmdb_base_url}/{media_type}/{tmdb_id}/images"
            params = {
                'api_key': self.tmdb_api_key,
                'language': 'en-US,null'  # Get English and language-neutral images
            }
            
            time.sleep(self.request_delay)  # Rate limiting
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            backdrops = data.get('backdrops', [])
            
            if backdrops:
                logger.info(f"Found {len(backdrops)} backdrop images for TMDB ID {tmdb_id}")
            else:
                logger.warning(f"No backdrop images found for TMDB ID {tmdb_id}")
            
            return backdrops
            
        except Exception as e:
            logger.error(f"Error getting images for TMDB ID {tmdb_id}: {e}")
            return []
    
    def get_existing_content(self) -> List[Dict[str, Any]]:
        """
        Get all existing content from the database.
        
        Returns:
            List of dictionaries containing content information
        """
        try:
            query = """
            SELECT 
                content_id,
                title,
                type
            FROM content
            ORDER BY title
            """
            
            self.cursor.execute(query)
            results = self.cursor.fetchall()
            
            content_list = []
            for row in results:
                content_list.append({
                    'content_id': row[0],
                    'title': row[1],
                    'type': row[2]
                })
            
            logger.info(f"Found {len(content_list)} content items in database")
            return content_list
            
        except Exception as e:
            logger.error(f"Error getting existing content: {e}")
            return []
    
    def get_existing_celebrities(self) -> List[Dict[str, Any]]:
        """
        Get all existing celebrities from the database.
        
        Returns:
            List of dictionaries containing celebrity information
        """
        try:
            query = """
            SELECT 
                celebrity_id,
                name
            FROM celebrity
            ORDER BY name
            """
            
            self.cursor.execute(query)
            results = self.cursor.fetchall()
            
            celebrity_list = []
            for row in results:
                celebrity_list.append({
                    'celebrity_id': row[0],
                    'name': row[1]
                })
            
            logger.info(f"Found {len(celebrity_list)} celebrities in database")
            return celebrity_list
            
        except Exception as e:
            logger.error(f"Error getting existing celebrities: {e}")
            return []
    
    def check_existing_images(self, content_id: int = None, celebrity_id: int = None) -> int:
        """
        Check how many images already exist for content or celebrity.
        
        Args:
            content_id: Database content ID (for content images)
            celebrity_id: Database celebrity ID (for celebrity images)
            
        Returns:
            Number of existing images
        """
        try:
            if content_id:
                query = "SELECT COUNT(*) FROM image WHERE content_id = %s"
                self.cursor.execute(query, (content_id,))
            elif celebrity_id:
                query = "SELECT COUNT(*) FROM image WHERE celebrity_id = %s"
                self.cursor.execute(query, (celebrity_id,))
            else:
                return 0
            
            count = self.cursor.fetchone()[0]
            return count
        except Exception as e:
            logger.error(f"Error checking existing images: {e}")
            return 0
    
    def insert_image(self, url: str, caption: str, content_id: int = None, celebrity_id: int = None) -> bool:
        """
        Insert a backdrop image into the database.
        
        Args:
            url: Image URL
            caption: Image caption
            content_id: Database content ID (for content images)
            celebrity_id: Database celebrity ID (for celebrity images)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            query = """
            INSERT INTO image (url, caption, created_at, content_id, celebrity_id)
            VALUES (%s, %s, %s, %s, %s)
            """
            self.cursor.execute(query, (url, caption, datetime.now(), content_id, celebrity_id))
            self.conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error inserting image: {e}")
            self.conn.rollback()
            return False
    
    def populate_backdrop_images(self, force_update: bool = False) -> None:
        """
        Main method to populate backdrop images for all existing content and celebrity images.
        
        Args:
            force_update: If True, add images even for content/celebrities that already have images
        """
        if not self.connect_to_database():
            logger.error("Cannot proceed without database connection")
            return
        
        try:
            # Get all existing content and celebrities
            content_list = self.get_existing_content()
            celebrity_list = self.get_existing_celebrities()
            
            if not content_list and not celebrity_list:
                logger.info("No content or celebrities found in database")
                return
            
            total_items = len(content_list) + len(celebrity_list)
            processed_count = 0
            updated_count = 0
            skipped_count = 0
            error_count = 0
            total_images_added = 0
            
            logger.info(f"Starting to populate images for {len(content_list)} content items and {len(celebrity_list)} celebrities")
            
            # Process content (movies/TV series) backdrop images
            for content_info in content_list:
                content_id = content_info['content_id']
                title = content_info['title']
                content_type = content_info['type']
                
                processed_count += 1
                logger.info(f"Processing content ({processed_count}/{total_items}): {title} ({content_type})")
                
                # Check if images already exist
                existing_image_count = self.check_existing_images(content_id=content_id)
                
                if existing_image_count > 0 and not force_update:
                    logger.info(f"Content '{title}' already has {existing_image_count} images, skipping")
                    skipped_count += 1
                    continue
                
                # Search for content on TMDB
                tmdb_result = self.search_tmdb_content(title)
                
                if not tmdb_result:
                    logger.warning(f"Could not find TMDB match for: {title}")
                    error_count += 1
                    continue
                
                # Determine media type for TMDB API
                media_type = 'movie' if tmdb_result.get('media_type') == 'movie' or 'release_date' in tmdb_result else 'tv'
                tmdb_id = tmdb_result['id']
                
                # Get backdrop images
                backdrops = self.get_tmdb_images(tmdb_id, media_type)
                
                if not backdrops:
                    logger.warning(f"No backdrop images found for: {title}")
                    error_count += 1
                    continue
                
                # Sort by vote_average (quality) and take ALL images
                backdrops.sort(key=lambda x: x.get('vote_average', 0), reverse=True)
                selected_backdrops = backdrops  # Take all available backdrops
                
                # Insert images into database
                images_added_for_content = 0
                for i, backdrop in enumerate(selected_backdrops):
                    image_url = f"{self.tmdb_image_base_url}{backdrop['file_path']}"
                    caption = f"Backdrop image {i+1} for {title}"
                    
                    if self.insert_image(image_url, caption, content_id=content_id):
                        images_added_for_content += 1
                        total_images_added += 1
                    else:
                        logger.error(f"Failed to insert image {i+1} for '{title}'")
                
                if images_added_for_content > 0:
                    logger.info(f"Added {images_added_for_content} backdrop images for '{title}'")
                    updated_count += 1
                else:
                    logger.warning(f"No images were added for '{title}'")
                    error_count += 1
            
            # Process celebrity profile images
            for celebrity_info in celebrity_list:
                celebrity_id = celebrity_info['celebrity_id']
                name = celebrity_info['name']
                
                processed_count += 1
                logger.info(f"Processing celebrity ({processed_count}/{total_items}): {name}")
                
                # Check if images already exist
                existing_image_count = self.check_existing_images(celebrity_id=celebrity_id)
                
                if existing_image_count > 0 and not force_update:
                    logger.info(f"Celebrity '{name}' already has {existing_image_count} images, skipping")
                    skipped_count += 1
                    continue
                
                # Search for person on TMDB
                tmdb_result = self.search_tmdb_person(name)
                
                if not tmdb_result:
                    logger.warning(f"Could not find TMDB match for: {name}")
                    error_count += 1
                    continue
                
                tmdb_id = tmdb_result['id']
                
                # Get profile images
                profiles = self.get_tmdb_person_images(tmdb_id)
                
                if not profiles:
                    logger.warning(f"No profile images found for: {name}")
                    error_count += 1
                    continue
                
                # Sort by vote_average (quality) and take ALL images
                profiles.sort(key=lambda x: x.get('vote_average', 0), reverse=True)
                
                # Insert images into database
                images_added_for_celebrity = 0
                for i, profile in enumerate(profiles):
                    image_url = f"{self.tmdb_image_base_url}{profile['file_path']}"
                    caption = f"Profile image {i+1} for {name}"
                    
                    if self.insert_image(image_url, caption, celebrity_id=celebrity_id):
                        images_added_for_celebrity += 1
                        total_images_added += 1
                    else:
                        logger.error(f"Failed to insert image {i+1} for '{name}'")
                
                if images_added_for_celebrity > 0:
                    logger.info(f"Added {images_added_for_celebrity} profile images for '{name}'")
                    updated_count += 1
                else:
                    logger.warning(f"No images were added for '{name}'")
                    error_count += 1
            
            # Summary
            logger.info("="*60)
            logger.info("IMAGE POPULATION COMPLETE")
            logger.info(f"Total items processed: {total_items} ({len(content_list)} content + {len(celebrity_list)} celebrities)")
            logger.info(f"Successfully updated: {updated_count}")
            logger.info(f"Skipped (already had images): {skipped_count}")
            logger.info(f"Errors/Not found: {error_count}")
            logger.info(f"Total images added: {total_images_added}")
            logger.info("="*60)
            
        except Exception as e:
            logger.error(f"Error in populate_backdrop_images: {e}")
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
    
    def set_max_images_per_content(self, max_images: int):
        """Set the maximum number of images to fetch per content item."""
        if max_images > 0:
            self.max_images_per_content = max_images
            logger.info(f"Set maximum images per content to: {max_images}")
        else:
            logger.warning("Maximum images per content must be greater than 0")

def main():
    """Main function to run the backdrop image populator."""
    print("FilmFusion Backdrop Image Populator")
    print("="*40)
    
    # Create populator instance
    populator = BackdropImagePopulator()
    
    # Validate API key
    if not populator.validate_api_key():
        print("\n❌ TMDB API key validation failed!")
        return
    
    # Ask user for configuration
    print(f"\nThis script will:")
    print("1. Connect to your FilmFusion database")
    print("2. Find all existing content (movies and TV series) and celebrities")
    print("3. Search TMDB for matching content and people")
    print("4. Download ALL available backdrop image URLs for content and profile images for celebrities")
    print("5. Update the image table with backdrop URLs")
    
    # Ask for confirmation
    choice = input(f"\nDo you want to proceed? (y/n): ").lower().strip()
    if choice != 'y':
        print("Operation cancelled.")
        return
    
    # Ask about force update
    force_update = False
    force_choice = input("Add images even for content that already has images? (y/n): ").lower().strip()
    if force_choice == 'y':
        force_update = True
    
    # Run the populator
    try:
        populator.populate_backdrop_images(force_update=force_update)
        print("\n✅ Backdrop image population completed!")
        print("Check the 'backdrop_image_population.log' file for detailed logs.")
    except KeyboardInterrupt:
        print("\n\n⚠️ Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        logger.error(f"Main execution error: {e}")

if __name__ == "__main__":
    main()