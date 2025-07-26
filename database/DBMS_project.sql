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
