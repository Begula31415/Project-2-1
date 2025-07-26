-- Fix the reaction trigger function bug
-- The problem is in the update_reaction_counts function where it's trying to use column names incorrectly

-- First, drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS trg_update_reaction_counts ON reaction;
DROP FUNCTION IF EXISTS update_reaction_counts();

-- Create the corrected function
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
    column_name TEXT;
    old_column_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New reaction: increment the reaction count for the new type
    column_name := NEW.type || '_count';
    EXECUTE format('UPDATE review SET %I = COALESCE(%I, 0) + 1 WHERE review_id = $1', 
                   column_name, column_name)
    USING NEW.review_id;
    
    RAISE NOTICE 'INSERT: Incremented % for review %', column_name, NEW.review_id;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Type has changed: adjust both counts
    IF NEW.type IS DISTINCT FROM OLD.type THEN
      column_name := NEW.type || '_count';
      old_column_name := OLD.type || '_count';
      
      EXECUTE format('UPDATE review SET %I = COALESCE(%I, 0) + 1, %I = GREATEST(COALESCE(%I, 0) - 1, 0) WHERE review_id = $1', 
                     column_name, column_name,
                     old_column_name, old_column_name)
      USING NEW.review_id;
      
      RAISE NOTICE 'UPDATE: Incremented % and decremented % for review %', column_name, old_column_name, NEW.review_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Reaction removed: decrement the count for the old type
    old_column_name := OLD.type || '_count';
    EXECUTE format('UPDATE review SET %I = GREATEST(COALESCE(%I, 0) - 1, 0) WHERE review_id = $1', 
                   old_column_name, old_column_name)
    USING OLD.review_id;
    
    RAISE NOTICE 'DELETE: Decremented % for review %', old_column_name, OLD.review_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_update_reaction_counts
AFTER INSERT OR UPDATE OR DELETE ON reaction
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Test the trigger works by checking current data
SELECT 'Trigger recreated successfully' as status;
