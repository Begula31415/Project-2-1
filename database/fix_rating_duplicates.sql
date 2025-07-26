-- Fix rating duplicates by adding unique constraint and updating frontend
-- This prevents users from rating the same movie multiple times

-- First, remove any existing duplicate ratings (keep the latest one)
WITH duplicates AS (
  SELECT 
    rating_id,
    ROW_NUMBER() OVER (PARTITION BY registered_user_id, content_id ORDER BY created_at DESC) as rn
  FROM rating
)
DELETE FROM rating 
WHERE rating_id IN (
  SELECT rating_id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE rating 
ADD CONSTRAINT unique_user_content_rating 
UNIQUE (registered_user_id, content_id);

-- Check for any remaining duplicates
SELECT 
  registered_user_id, 
  content_id, 
  COUNT(*) as duplicate_count
FROM rating 
GROUP BY registered_user_id, content_id 
HAVING COUNT(*) > 1;
