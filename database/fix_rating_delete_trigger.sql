-- Fix missing DELETE trigger for rating statistics update
-- This trigger is needed to update content.average_rating and content.rating_count 
-- when a rating is deleted

-- Create a function to handle rating statistics update for DELETE operations
CREATE OR REPLACE FUNCTION update_content_rating_stats_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DOUBLE PRECISION;
  total_count INT;
BEGIN
  -- Calculate new average and count after the deletion
  SELECT ROUND(AVG(score), 2), COUNT(*) INTO avg_rating, total_count
  FROM rating WHERE content_id = OLD.content_id;
  
  -- Handle case when no ratings remain (set to 0)
  IF total_count = 0 THEN
    avg_rating := 0;
  END IF;

  -- Update the content table with new statistics
  UPDATE content
  SET average_rating = COALESCE(avg_rating, 0), rating_count = total_count
  WHERE content_id = OLD.content_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the DELETE trigger
CREATE TRIGGER update_rating_stats_after_delete
AFTER DELETE ON rating
FOR EACH ROW EXECUTE FUNCTION update_content_rating_stats_on_delete();

-- Also update the existing INSERT/UPDATE function to use COALESCE for safety
CREATE OR REPLACE FUNCTION update_content_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DOUBLE PRECISION;
  total_count INT;
BEGIN
  SELECT ROUND(AVG(score), 2), COUNT(*) INTO avg_rating, total_count
  FROM rating WHERE content_id = NEW.content_id;

  UPDATE content
  SET average_rating = COALESCE(avg_rating, 0), rating_count = total_count
  WHERE content_id = NEW.content_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
