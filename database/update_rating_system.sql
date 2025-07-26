-- Fix rating system: Add unique constraint and improve reaction system
-- Run this after your existing database setup

-- Add unique constraint to prevent duplicate ratings
ALTER TABLE rating ADD CONSTRAINT unique_rating_user_content 
UNIQUE (registered_user_id, content_id);

-- This will prevent multiple ratings from same user for same content
-- The ON CONFLICT in the API will now work properly

-- Also ensure reaction table has the same constraint (should already exist but let's be safe)
ALTER TABLE reaction ADD CONSTRAINT unique_reaction_user_review 
UNIQUE (review_id, registered_user_id);

-- Check current rating duplicates (if any)
SELECT 
    registered_user_id, 
    content_id, 
    COUNT(*) as duplicate_count
FROM rating 
GROUP BY registered_user_id, content_id 
HAVING COUNT(*) > 1;

-- If there are duplicates, clean them up first:
-- (Uncomment and run only if the above query shows duplicates)
/*
DELETE FROM rating r1
WHERE r1.rating_id > (
    SELECT MIN(r2.rating_id)
    FROM rating r2
    WHERE r2.registered_user_id = r1.registered_user_id 
    AND r2.content_id = r1.content_id
);
*/
