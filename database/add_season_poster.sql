-- Add poster_url column to season table
-- This script adds a poster_url column to the season table to store season-specific poster images

-- Add the poster_url column to the season table
ALTER TABLE season ADD COLUMN poster_url VARCHAR(500);

-- Update the trailer_url column size to match other poster URLs (if needed)
-- Already done in the main schema file: ALTER TABLE season ALTER COLUMN trailer_url TYPE VARCHAR(500);

-- Add a comment to document the column
COMMENT ON COLUMN season.poster_url IS 'URL to the season poster image from TMDB or other sources';

-- Optional: Add a check constraint to ensure valid URLs
-- ALTER TABLE season ADD CONSTRAINT season_poster_url_format 
-- CHECK (poster_url IS NULL OR poster_url ~* '^https?://.*\.(jpg|jpeg|png|webp)(\?.*)?$');

-- Display current season table structure
\d season;

-- Show existing seasons that will be updated
SELECT s.season_id, s.series_id, s.season_number, s.season_name, c.title as series_title, s.poster_url
FROM season s
JOIN content c ON s.series_id = c.content_id
ORDER BY c.title, s.season_number;
