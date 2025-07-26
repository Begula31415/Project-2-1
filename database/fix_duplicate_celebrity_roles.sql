-- Fix duplicate celebrity_role entries by consolidating them
-- This script identifies duplicates, updates references, and removes duplicates

-- BACKUP RECOMMENDATION: Before running this script, consider backing up your tables:
-- pg_dump -t celebrity_role -t celebrity_role_content your_database > backup_before_fix.sql

-- Step 1: First, let's see what duplicates we have
SELECT 
    celebrity_id, 
    role_id, 
    COUNT(*) as duplicate_count,
    ARRAY_AGG(celebrity_role_id ORDER BY celebrity_role_id) as all_role_ids
FROM celebrity_role 
GROUP BY celebrity_id, role_id 
HAVING COUNT(*) > 1
ORDER BY celebrity_id, role_id;

-- Step 2: Update celebrity_role_content to point to the keeper IDs
-- For each set of duplicates, we'll keep the one with the smallest celebrity_role_id
-- and update all references to point to that one

WITH duplicate_groups AS (
    -- Find all duplicate groups and identify the keeper (min ID) and all IDs
    SELECT 
        celebrity_id,
        role_id,
        MIN(celebrity_role_id) as keeper_id,
        ARRAY_AGG(celebrity_role_id ORDER BY celebrity_role_id) as all_ids
    FROM celebrity_role 
    GROUP BY celebrity_id, role_id 
    HAVING COUNT(*) > 1
),
ids_to_update AS (
    -- Get all IDs except the keeper (first one in the sorted array)
    SELECT 
        keeper_id,
        UNNEST(all_ids[2:]) as old_id
    FROM duplicate_groups
    WHERE array_length(all_ids, 1) > 1
)
-- Update celebrity_role_content to use keeper IDs instead of duplicate IDs
UPDATE celebrity_role_content crc
SET celebrity_role_id = itu.keeper_id
FROM ids_to_update itu
WHERE crc.celebrity_role_id = itu.old_id;

-- Step 3: Remove the duplicate celebrity_role entries
-- Keep only the ones with minimum celebrity_role_id for each celebrity+role combination
DELETE FROM celebrity_role cr1
WHERE EXISTS (
    SELECT 1 
    FROM celebrity_role cr2 
    WHERE cr2.celebrity_id = cr1.celebrity_id 
    AND cr2.role_id = cr1.role_id 
    AND cr2.celebrity_role_id < cr1.celebrity_role_id
);

-- Step 4: Add a unique constraint to prevent future duplicates
ALTER TABLE celebrity_role 
ADD CONSTRAINT unique_celebrity_role 
UNIQUE (celebrity_id, role_id);

-- Step 5: Verify the fix - check for any remaining duplicates
SELECT 
    celebrity_id, 
    role_id, 
    COUNT(*) as count
FROM celebrity_role 
GROUP BY celebrity_id, role_id 
HAVING COUNT(*) > 1;

-- Step 6: Verify that all celebrity_role_content references are still valid
SELECT COUNT(*) as orphaned_references
FROM celebrity_role_content crc
LEFT JOIN celebrity_role cr ON crc.celebrity_role_id = cr.celebrity_role_id
WHERE cr.celebrity_role_id IS NULL;

-- If the above query returns 0, then all references are valid
-- If it returns > 0, there are orphaned references that need attention

-- Step 7: Display summary of what was fixed
SELECT 
    'Total celebrity_role entries after cleanup' as description,
    COUNT(*) as count
FROM celebrity_role
UNION ALL
SELECT 
    'Total celebrity_role_content entries' as description,
    COUNT(*) as count
FROM celebrity_role_content;
