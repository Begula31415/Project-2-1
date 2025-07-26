CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(100),
  username VARCHAR(50),
  password_hash VARCHAR(256),
  bio TEXT,
  birth_date DATE,
  location VARCHAR(100),
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

CREATE TABLE admin (
  admin_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id),
  phone VARCHAR(20),
  official_mail VARCHAR(100)
);

CREATE TABLE registered_user (
  registered_user_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id),
  profile_picture_url VARCHAR(100)
);

CREATE TABLE country (
  country_id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE language (
  language_id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE genre (
  genre_id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE role (
  role_id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE celebrity (
  celebrity_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  bio TEXT,
  birth_date DATE,
  death_date DATE,
  place_of_birth VARCHAR(100),
  gender VARCHAR(100),
  photo_url VARCHAR(500)
);

CREATE TABLE award (
  award_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  year INT,
  type VARCHAR(100)
);

CREATE TABLE celebrity_award (
  celebrity_award_id SERIAL PRIMARY KEY,
  celebrity_id INT REFERENCES celebrity(celebrity_id),
  award_id INT REFERENCES award(award_id)
);

CREATE TABLE celebrity_role (
  celebrity_role_id SERIAL PRIMARY KEY,
  celebrity_id INT REFERENCES celebrity(celebrity_id),
  role_id INT REFERENCES role(role_id)
);

CREATE TABLE celebrity_role_content (
  celebrity_role_content_id SERIAL PRIMARY KEY,
  celebrity_role_id INT REFERENCES celebrity_role(celebrity_role_id),
  content_id INT
);

CREATE TABLE content (
  content_id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  release_date DATE,
  language_id INT REFERENCES language(language_id),
  type VARCHAR(20) CHECK (type IN ('Movie', 'Series', 'Documentary')),
  duration INT,
  poster_url VARCHAR(500),
  trailer_url VARCHAR(100),
  budget DECIMAL(15,2),
  box_office_collection DECIMAL(15,2),
  currency_code VARCHAR(10),
  min_age SMALLINT,
  views INT
);

CREATE TABLE content_genre (
  content_genre_id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content(content_id),
  genre_id INT REFERENCES genre(genre_id)
);

CREATE TABLE content_country (
  content_country_id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content(content_id),
  country_id INT REFERENCES country(country_id),
  role VARCHAR(20) CHECK (role IN ('production', 'filming', 'setting')),
  notes TEXT
);

CREATE TABLE content_language (
  content_language_id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content(content_id),
  language_id INT REFERENCES language(language_id)
);

CREATE TABLE content_award (
  content_award_id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content(content_id),
  award_id INT REFERENCES award(award_id)
);

CREATE TABLE season (
  season_id SERIAL PRIMARY KEY,
  series_id INT REFERENCES content(content_id),
  season_number INT,
  season_name VARCHAR(100),
  description TEXT,
  episode_count INT,
  release_date DATE,
  trailer_url VARCHAR(100)
);

CREATE TABLE episode (
  episode_id SERIAL PRIMARY KEY,
  season_id INT REFERENCES season(season_id),
  episode_number INT,
  title VARCHAR(100),
  duration INT,
  trailer_url VARCHAR(100),
  release_date DATE
);

CREATE TABLE review (
  review_id SERIAL PRIMARY KEY,
  registered_user_id INT REFERENCES registered_user(registered_user_id),
  content_id INT REFERENCES content(content_id),
  text TEXT,
  created_at TIMESTAMP
);

CREATE TABLE reaction (
  reaction_id SERIAL PRIMARY KEY,
  review_id INT REFERENCES review(review_id),
  registered_user_id INT REFERENCES registered_user(registered_user_id),
  type VARCHAR(100),
  UNIQUE(review_id, registered_user_id)
);

CREATE TABLE rating (
  rating_id SERIAL PRIMARY KEY,
  registered_user_id INT REFERENCES registered_user(registered_user_id),
  content_id INT REFERENCES content(content_id),
  score DOUBLE PRECISION,
  created_at TIMESTAMP
);

CREATE TABLE wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  registered_user_id INT REFERENCES registered_user(registered_user_id),
  content_id INT REFERENCES content(content_id)
);

CREATE TABLE image (
  image_id SERIAL PRIMARY KEY,
  url VARCHAR(100),
  caption TEXT,
  uploaded_at TIMESTAMP,
  content_id INT REFERENCES content(content_id),
  celebrity_id INT REFERENCES celebrity(celebrity_id),
  CHECK (
    (content_id IS NOT NULL AND celebrity_id IS NULL) OR
    (celebrity_id IS NOT NULL AND content_id IS NULL)
  )
);

CREATE TABLE content_views (
  view_id INT,
  registered_user_id INT REFERENCES registered_user(registered_user_id),
  content_id INT UNIQUE REFERENCES CONTENT(content_id),
  when_viewed TIMESTAMP
);
  
COMMENT ON TABLE image IS 'Exactly one of content_id or celebrity_id must be NOT NULL';




-- USERS
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(50);
ALTER TABLE admin ALTER COLUMN official_mail TYPE VARCHAR(255);
ALTER TABLE registered_user ALTER COLUMN profile_picture_url TYPE VARCHAR(500);

-- CONTENT
ALTER TABLE content ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE content ALTER COLUMN trailer_url TYPE VARCHAR(500);

-- SEASON & EPISODE
ALTER TABLE season ALTER COLUMN season_name TYPE VARCHAR(255);
ALTER TABLE season ALTER COLUMN trailer_url TYPE VARCHAR(500);
ALTER TABLE episode ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE episode ALTER COLUMN trailer_url TYPE VARCHAR(500);

-- IMAGE
ALTER TABLE image ALTER COLUMN url TYPE VARCHAR(500);

-- AWARD
ALTER TABLE award ALTER COLUMN name TYPE VARCHAR(100);
ALTER TABLE award ALTER COLUMN type TYPE VARCHAR(100);

-- Add UNIQUE constraints where needed
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE(username);
ALTER TABLE admin ADD CONSTRAINT unique_official_mail UNIQUE(official_mail);
ALTER TABLE genre ADD CONSTRAINT unique_genre_name UNIQUE(name);
ALTER TABLE language ADD CONSTRAINT unique_language_name UNIQUE(name);
ALTER TABLE country ADD CONSTRAINT unique_country_name UNIQUE(name);
ALTER TABLE role ADD CONSTRAINT unique_role_name UNIQUE(name);
ALTER TABLE award ADD CONSTRAINT unique_award_name_year UNIQUE(name, year);


-- Prevent duplicate content-award pairs
ALTER TABLE content_award ADD CONSTRAINT unique_content_award UNIQUE(content_id, award_id);

-- Prevent duplicate celebrity-award pairs
ALTER TABLE celebrity_award ADD CONSTRAINT unique_celebrity_award UNIQUE(celebrity_id, award_id);

-- Prevent duplicate wishlist entries
ALTER TABLE wishlist ADD CONSTRAINT unique_user_wishlist UNIQUE(registered_user_id, content_id);

ALTER TABLE content_country DROP COLUMN notes;

ALTER TABLE content DROP COLUMN language_id;

ALTER TABLE content_language ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;

ALTER TABLE content_language
ADD CONSTRAINT unique_content_language UNIQUE (content_id, language_id);

ALTER TABLE content_award
ADD CONSTRAINT unique_content_award UNIQUE (content_id, award_id);

ALTER TABLE celebrity_award
ADD CONSTRAINT unique_celebrity_award UNIQUE (celebrity_id, award_id);

ALTER TABLE celebrity_role_content
ADD CONSTRAINT unique_celebrity_role_content UNIQUE (celebrity_role_id, content_id);

ALTER TABLE wishlist
ADD CONSTRAINT unique_wishlist UNIQUE (registered_user_id, content_id);

ALTER TABLE content_views
ADD CONSTRAINT unique_content_views UNIQUE (registered_user_id, content_id);

-- Drop the old column if needed
ALTER TABLE content_views DROP COLUMN view_id;

-- Add it back as SERIAL PRIMARY KEY
ALTER TABLE content_views ADD COLUMN view_id SERIAL PRIMARY KEY;


ALTER TABLE rating
ALTER COLUMN score TYPE SMALLINT USING score::SMALLINT;

ALTER TABLE rating
ADD CONSTRAINT rating_score_range CHECK (score BETWEEN 1 AND 10);


ALTER TABLE episode DROP COLUMN trailer_url;

ALTER TABLE season ADD CONSTRAINT unique_series_season UNIQUE (series_id, season_number);
ALTER TABLE episode ADD CONSTRAINT unique_season_episode UNIQUE (season_id, episode_number);

ALTER TABLE celebrity ADD CONSTRAINT unique_celebrity_name_birth UNIQUE (name, birth_date);

-- 1. Update content_genre
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE content_genre cg
SET content_id = d.keeper_id
FROM duplicates d
WHERE cg.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 2. Update content_language
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE content_language cl
SET content_id = d.keeper_id
FROM duplicates d
WHERE cl.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 3. Update content_country
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE content_country cc
SET content_id = d.keeper_id
FROM duplicates d
WHERE cc.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 4. Update content_award
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE content_award ca
SET content_id = d.keeper_id
FROM duplicates d
WHERE ca.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 5. Update content_views
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE content_views cv
SET content_id = d.keeper_id
FROM duplicates d
WHERE cv.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 6. Update wishlist
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE wishlist w
SET content_id = d.keeper_id
FROM duplicates d
WHERE w.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 7. Update review
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE review r
SET content_id = d.keeper_id
FROM duplicates d
WHERE r.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 8. Update rating
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE rating ra
SET content_id = d.keeper_id
FROM duplicates d
WHERE ra.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 9. Update image
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE image i
SET content_id = d.keeper_id
FROM duplicates d
WHERE i.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- 10. Update celebrity_role_content (if you have this table)
WITH duplicates AS (
  SELECT content_id,
         MIN(content_id) OVER (PARTITION BY title, release_date, type) AS keeper_id
  FROM content
)
UPDATE celebrity_role_content crc
SET content_id = d.keeper_id
FROM duplicates d
WHERE crc.content_id = d.content_id AND d.content_id <> d.keeper_id;

-- Repeat for any other table that references content_id...

-- 11. Now delete the duplicate content rows
DELETE FROM content
WHERE content_id NOT IN (
    SELECT MIN(content_id)
    FROM content
    GROUP BY title, release_date, type
);

-- 12. Add the unique constraint to prevent future duplicates
ALTER TABLE content ADD CONSTRAINT unique_content_title_release_type UNIQUE (title, release_date, type);


UPDATE content c
SET views = COALESCE(cv.view_count, 0)
FROM (
    SELECT content_id, COUNT(*) AS view_count
    FROM content_views
    GROUP BY content_id
) cv
WHERE c.content_id = cv.content_id;

CREATE TABLE user_fav_celeb (
  user_fav_celeb_id SERIAL PRIMARY KEY,
  registered_user_id INT REFERENCES registered_user(registered_user_id) ON DELETE CASCADE,
  celebrity_id INT REFERENCES celebrity(celebrity_id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_celebrity_fav UNIQUE (registered_user_id, celebrity_id)
);


DELETE FROM users
WHERE user_id = 8;

DELETE FROM content_genre
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
    'Belyas',
    'Pleasure'
  )
);

DELETE FROM content_country
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
    'Belyas',
    'Pleasure'
  )
);

DELETE FROM content_language
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM content_award
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM content_views
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM image
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM rating
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM reaction
WHERE review_id IN (
  SELECT review_id
  FROM review
  WHERE content_id IN (
    SELECT content_id
    FROM content
    WHERE title IN (
      'Wild Awakening',
      'Couple Exchange',
      'Stepmom''s desire',
      'Female Teacher: In Front of the Students',
      'Skin. Like. Sun.',
      'Jokōsei torio: seikan shiken',
          'Belyas',
    'Pleasure'
    )
  )
);

DELETE FROM review
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM wishlist
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);

DELETE FROM celebrity_role_content
WHERE content_id IN (
  SELECT content_id
  FROM content
  WHERE title IN (
    'Wild Awakening',
    'Couple Exchange',
    'Stepmom''s desire',
    'Female Teacher: In Front of the Students',
    'Skin. Like. Sun.',
    'Jokōsei torio: seikan shiken',
        'Belyas',
    'Pleasure'
  )
);


DELETE FROM content
WHERE title IN (
  'Wild Awakening',
  'Couple Exchange',
  'Stepmom''s desire',
  'Female Teacher: In Front of the Students',
  'Skin. Like. Sun.',
  'Jokosei torio: seikan shiken',
      'Belyas',
    'Pleasure'
);

SELECT name FROM genre;

ALTER TABLE content ADD COLUMN average_rating DOUBLE PRECISION DEFAULT 0;
ALTER TABLE content ADD COLUMN rating_count INT DEFAULT 0;

UPDATE content
SET rating_count = sub.count,
    average_rating = sub.avg
FROM (
  SELECT content_id, 
         COUNT(*) AS count, 
         ROUND(AVG(score)::numeric, 2) AS avg
  FROM rating
  GROUP BY content_id
) AS sub
WHERE content.content_id = sub.content_id;


-- 1. Auto-fill created_at Timestamps
CREATE OR REPLACE FUNCTION auto_set_created_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_created_at_users
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION auto_set_created_at();

CREATE TRIGGER set_created_at_review
BEFORE INSERT ON review
FOR EACH ROW EXECUTE FUNCTION auto_set_created_at();

CREATE TRIGGER set_created_at_rating
BEFORE INSERT ON rating
FOR EACH ROW EXECUTE FUNCTION auto_set_created_at();

CREATE TRIGGER set_created_at_image
BEFORE INSERT ON image
FOR EACH ROW EXECUTE FUNCTION auto_set_created_at();

CREATE TRIGGER set_created_at_content_views
BEFORE INSERT ON content_views
FOR EACH ROW EXECUTE FUNCTION auto_set_created_at();

-- 2. Prevent Duplicate Ratings (Upsert)
CREATE OR REPLACE FUNCTION upsert_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM rating
    WHERE registered_user_id = NEW.registered_user_id AND content_id = NEW.content_id
  ) THEN
    UPDATE rating
    SET score = NEW.score, created_at = CURRENT_TIMESTAMP
    WHERE registered_user_id = NEW.registered_user_id AND content_id = NEW.content_id;
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_upsert_rating
BEFORE INSERT ON rating
FOR EACH ROW EXECUTE FUNCTION upsert_rating();

-- Auto-Increase views in content on content_views Insert
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content
  SET views = views + 1
  WHERE content_id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_view_count
AFTER INSERT ON content_views
FOR EACH ROW EXECUTE FUNCTION increment_view_count();

-- Preventing double role assignment
CREATE OR REPLACE FUNCTION prevent_duplicate_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'User already assigned as admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_duplicate_admin
BEFORE INSERT ON admin
FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_admin();

CREATE OR REPLACE FUNCTION prevent_duplicate_registered()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM registered_user WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'User already assigned as registered_user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_duplicate_registered_user
BEFORE INSERT ON registered_user
FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_registered();

-- 7. Validate image table content
CREATE OR REPLACE FUNCTION validate_image_content()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.content_id IS NULL AND NEW.celebrity_id IS NULL) OR
     (NEW.content_id IS NOT NULL AND NEW.celebrity_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Exactly one of content_id or celebrity_id must be provided';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_image_constraint
BEFORE INSERT OR UPDATE ON image
FOR EACH ROW EXECUTE FUNCTION validate_image_content();

-- Validate min_age based on content type
CREATE OR REPLACE FUNCTION validate_age_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'Documentary' AND NEW.min_age IS NOT NULL THEN
    RAISE EXCEPTION 'Documentary should not have a minimum age';
  ELSIF NEW.min_age NOT IN (0, 7, 13, 16, 18) THEN
    RAISE EXCEPTION 'Invalid min_age. Allowed values are 0, 7, 13, 16, 18';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_age_rating
BEFORE INSERT OR UPDATE ON content
FOR EACH ROW EXECUTE FUNCTION validate_age_rating();

-- 11. Update rating_count and average_rating on rating change
CREATE OR REPLACE FUNCTION update_content_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DOUBLE PRECISION;
  total_count INT;
BEGIN
  SELECT ROUND(AVG(score), 2), COUNT(*) INTO avg_rating, total_count
  FROM rating WHERE content_id = NEW.content_id;

  UPDATE content
  SET average_rating = avg_rating, rating_count = total_count
  WHERE content_id = NEW.content_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_stats_after_insert
AFTER INSERT ON rating
FOR EACH ROW EXECUTE FUNCTION update_content_rating_stats();

CREATE TRIGGER update_rating_stats_after_update
AFTER UPDATE ON rating
FOR EACH ROW EXECUTE FUNCTION update_content_rating_stats();


CREATE OR REPLACE FUNCTION delete_content_and_dependencies(p_content_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM reaction
  WHERE review_id IN (
    SELECT review_id FROM review WHERE content_id = p_content_id
  );

  DELETE FROM review WHERE content_id = p_content_id;

  DELETE FROM rating WHERE content_id = p_content_id;

  DELETE FROM wishlist WHERE content_id = p_content_id;

  DELETE FROM content_views WHERE content_id = p_content_id;

  DELETE FROM image WHERE content_id = p_content_id;

  DELETE FROM content_award WHERE content_id = p_content_id;

  DELETE FROM content_genre WHERE content_id = p_content_id;

  DELETE FROM content_country WHERE content_id = p_content_id;

  DELETE FROM content_language WHERE content_id = p_content_id;

  DELETE FROM celebrity_role_content WHERE content_id = p_content_id;

  DELETE FROM episode WHERE season_id IN (
    SELECT season_id FROM season WHERE series_id = p_content_id
  );
  DELETE FROM season WHERE series_id = p_content_id;

  DELETE FROM content WHERE content_id = p_content_id;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: delete_celebrity_and_dependencies(celebrity_id)
CREATE OR REPLACE FUNCTION delete_celebrity_and_dependencies(p_celebrity_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM celebrity_award WHERE celebrity_id = p_celebrity_id;
  DELETE FROM image WHERE celebrity_id = p_celebrity_id;

  DELETE FROM celebrity_role_content WHERE celebrity_role_id IN (
    SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = p_celebrity_id
  );
  DELETE FROM celebrity_role WHERE celebrity_id = p_celebrity_id;
  DELETE FROM celebrity WHERE celebrity_id = p_celebrity_id;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: delete_award_and_dependencies(award_id)
CREATE OR REPLACE FUNCTION delete_award_and_dependencies(p_award_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM content_award WHERE award_id = p_award_id;
  DELETE FROM celebrity_award WHERE award_id = p_award_id;
  
  DELETE FROM award WHERE award_id = p_award_id;
END;
$$ LANGUAGE plpgsql;


-- ==============================================
-- FUNCTION: insert_content_if_not_exists(...)
-- ==============================================
CREATE OR REPLACE FUNCTION insert_content_if_not_exists(
  p_title VARCHAR,
  p_description TEXT,
  p_release_date DATE,
  p_type VARCHAR,
  p_duration INT,
  p_poster_url VARCHAR,
  p_trailer_url VARCHAR,
  p_budget DECIMAL,
  p_box_office_collection DECIMAL,
  p_currency_code VARCHAR,
  p_min_age SMALLINT,
  p_views INT DEFAULT 0
)
RETURNS INT AS $$
DECLARE
  existing_id INT;
  new_id INT;
BEGIN
  SELECT content_id INTO existing_id
  FROM content
  WHERE title = p_title AND release_date = p_release_date AND type = p_type;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO content (
    title, description, release_date, type,
    duration, poster_url, trailer_url, budget,
    box_office_collection, currency_code, min_age, views
  )
  VALUES (
    p_title, p_description, p_release_date, p_type,
    p_duration, p_poster_url, p_trailer_url, p_budget,
    p_box_office_collection, p_currency_code, p_min_age, p_views
  )
  RETURNING content_id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: insert_celebrity_if_not_exists(...)
-- ==============================================
CREATE OR REPLACE FUNCTION insert_celebrity_if_not_exists(
  p_name VARCHAR,
  p_birth_date DATE,
  p_bio TEXT DEFAULT NULL,
  p_death_date DATE DEFAULT NULL,
  p_place_of_birth VARCHAR DEFAULT NULL,
  p_gender VARCHAR DEFAULT NULL,
  p_photo_url VARCHAR DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  existing_id INT;
  new_id INT;
BEGIN
  SELECT celebrity_id INTO existing_id
  FROM celebrity
  WHERE name = p_name AND birth_date = p_birth_date;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO celebrity (
    name, bio, birth_date, death_date,
    place_of_birth, gender, photo_url
  )
  VALUES (
    p_name, p_bio, p_birth_date, p_death_date,
    p_place_of_birth, p_gender, p_photo_url
  )
  RETURNING celebrity_id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: insert_award_if_not_exists(...)
-- ==============================================
CREATE OR REPLACE FUNCTION insert_award_if_not_exists(
  p_name VARCHAR,
  p_year INT,
  p_type VARCHAR
)
RETURNS INT AS $$
DECLARE
  existing_id INT;
  new_id INT;
BEGIN
  SELECT award_id INTO existing_id
  FROM award
  WHERE name = p_name AND year = p_year;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO award (name, year, type)
  VALUES (p_name, p_year, p_type)
  RETURNING award_id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New reaction: increment the reaction count for the new type
    EXECUTE format('UPDATE review SET %I = COALESCE(%I, 0) + 1 WHERE review_id = $1', 
                   NEW.type || '_count', NEW.type || '_count')
    USING NEW.review_id;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Type has changed: adjust both counts
    IF NEW.type IS DISTINCT FROM OLD.type THEN
      EXECUTE format('UPDATE review SET %I = COALESCE(%I, 0) + 1, %I = GREATEST(COALESCE(%I, 0) - 1, 0) WHERE review_id = $1', 
                     NEW.type || '_count', NEW.type || '_count',
                     OLD.type || '_count', OLD.type || '_count')
      USING NEW.review_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Reaction removed: decrement the count for the old type
    EXECUTE format('UPDATE review SET %I = GREATEST(COALESCE(%I, 0) - 1, 0) WHERE review_id = $1', 
                   OLD.type || '_count', OLD.type || '_count')
    USING OLD.review_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reaction_counts
AFTER INSERT OR UPDATE OR DELETE ON reaction
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();



SELECT 
  event_object_table AS table_name,
  trigger_name,
  action_timing,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
order by table_name;

ALTER TABLE review
ADD COLUMN like_count INT DEFAULT 0,
ADD COLUMN dislike_count INT DEFAULT 0,
ADD COLUMN love_count INT DEFAULT 0,
ADD COLUMN funny_count INT DEFAULT 0,
ADD COLUMN wow_count INT DEFAULT 0,
ADD COLUMN angry_count INT DEFAULT 0;


UPDATE review r
SET 
  like_count = sub.like_count,
  dislike_count = sub.dislike_count,
  love_count = sub.love_count,
  funny_count = sub.funny_count,
  wow_count = sub.wow_count,
  angry_count = sub.angry_count
FROM (
  SELECT
    review_id,
    COUNT(*) FILTER (WHERE type = 'like') AS like_count,
    COUNT(*) FILTER (WHERE type = 'dislike') AS dislike_count,
    COUNT(*) FILTER (WHERE type = 'love') AS love_count,
    COUNT(*) FILTER (WHERE type = 'funny') AS funny_count,
    COUNT(*) FILTER (WHERE type = 'wow') AS wow_count,
    COUNT(*) FILTER (WHERE type = 'angry') AS angry_count
  FROM reaction
  GROUP BY review_id
) sub
WHERE r.review_id = sub.review_id;

-- Update female actors to have role_id = 2 (Actress)
-- This query updates celebrity_role table to set role_id = 2 for all female celebrities
-- who currently have role_id = 1 (Actor)

UPDATE celebrity_role cr
SET role_id = 2
FROM celebrity c
WHERE cr.celebrity_id = c.celebrity_id 
  AND c.gender = 'Female'
  AND cr.role_id = 1;

-- Optional: Verify the update by checking the results
SELECT 
  c.name,
  c.gender,
  r.name as role_name,
  cr.role_id
FROM celebrity_role cr
JOIN celebrity c ON cr.celebrity_id = c.celebrity_id
JOIN role r ON cr.role_id = r.role_id
WHERE c.gender = 'Female'
ORDER BY c.name;

-- Fix reaction_id sequence gap
-- Reset the sequence to continue from the correct next number
SELECT setval('reaction_reaction_id_seq', COALESCE((SELECT MAX(reaction_id) FROM reaction), 0) + 1, false);

-- Optional: Check the current sequence value
SELECT currval('reaction_reaction_id_seq') as current_sequence_value;

-- NOTE: SERIAL ID gaps are NORMAL in PostgreSQL when rows are deleted
-- The sequence doesn't reuse deleted IDs to avoid concurrency issues
-- This is the expected behavior and doesn't indicate a problem
-- Our API now minimizes DELETEs by using UPDATEs when changing reaction types

-- NOTE: For reaction trigger fix, use the separate fix_reaction_trigger.sql file
-- It contains a better version with proper variable declarations and debug logging

-- Add CASCADE DELETE for reactions when review is deleted
-- This ensures reactions are automatically deleted when their review is deleted
ALTER TABLE reaction DROP CONSTRAINT IF EXISTS reaction_review_id_fkey;
ALTER TABLE reaction ADD CONSTRAINT reaction_review_id_fkey 
  FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE CASCADE;

-- Verify the constraint was added correctly
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reaction'
  AND kcu.column_name = 'review_id';