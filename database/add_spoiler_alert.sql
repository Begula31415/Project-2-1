-- Add spoiler_alert column to review table
-- This script adds a boolean column to track whether a review contains spoilers

-- Add the spoiler_alert column to the review table
ALTER TABLE review ADD COLUMN spoiler_alert BOOLEAN DEFAULT FALSE;

-- Add a comment to document the column
COMMENT ON COLUMN review.spoiler_alert IS 'Indicates whether the review contains spoilers and should be blurred by default';

-- Add an index for faster filtering of spoiler reviews
CREATE INDEX idx_review_spoiler_alert ON review(spoiler_alert);

-- Display current review table structure
\d review;

-- Show existing reviews that will have spoiler_alert set to FALSE by default
SELECT 
    r.review_id, 
    r.text, 
    r.spoiler_alert,
    u.username as reviewer,
    c.title as movie_title
FROM review r
JOIN users u ON r.registered_user_id = u.user_id  
JOIN content c ON r.content_id = c.content_id
ORDER BY r.created_at DESC
LIMIT 10;

-- Optional: Update some existing reviews to have spoilers for testing
-- Uncomment and run these lines if you want to mark some existing reviews as spoilers for testing
/*
UPDATE review 
SET spoiler_alert = TRUE 
WHERE review_id IN (
    SELECT review_id 
    FROM review 
    WHERE LOWER(text) LIKE '%ending%' 
       OR LOWER(text) LIKE '%dies%' 
       OR LOWER(text) LIKE '%twist%'
       OR LOWER(text) LIKE '%finale%'
    LIMIT 5
);
*/

-- Verify the changes
SELECT COUNT(*) as total_reviews, 
       SUM(CASE WHEN spoiler_alert = TRUE THEN 1 ELSE 0 END) as spoiler_reviews,
       SUM(CASE WHEN spoiler_alert = FALSE THEN 1 ELSE 0 END) as non_spoiler_reviews
FROM review;
