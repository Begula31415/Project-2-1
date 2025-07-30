-- Fix content_views trigger issue
-- The content_views table uses 'when_viewed' instead of 'created_at'

-- Drop the incorrect trigger
DROP TRIGGER IF EXISTS set_created_at_content_views ON content_views;

-- Create a proper trigger function for content_views
CREATE OR REPLACE FUNCTION auto_set_when_viewed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.when_viewed IS NULL THEN
    NEW.when_viewed := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the correct trigger for content_views
CREATE TRIGGER set_when_viewed_content_views
BEFORE INSERT ON content_views
FOR EACH ROW EXECUTE FUNCTION auto_set_when_viewed();

-- Check if the trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'content_views';
