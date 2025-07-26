const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body
const { hashPassword, comparePassword } = require('./utils/password');


//ROUTES

//create a todo

app.post("/signup", async (req, res) => {
  const {
    name,
    email,
    username,
    password_hash,
    bio,
    birth_date,
    location,
    role,
    phone,
    official_mail,
    profile_picture_url,
  } = req.body;

  try {
    // Check email or username already exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email or username already exists" });
    }

    // If role is admin, check phone and official_mail uniqueness
    if (role === "admin") {
      const adminCheck = await pool.query(
        "SELECT * FROM admin WHERE phone = $1 OR official_mail = $2",
        [phone, official_mail]
      );

      if (adminCheck.rows.length > 0) {
        return res.status(400).json({ error: "Phone or official mail already exists" });
      }
    }

    const hashedPassword = await hashPassword(password_hash);
    // Insert into users
    const newUser = await pool.query(
      `INSERT INTO users 
      (name, created_at, email, username, password_hash, bio, birth_date, location, role)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id`,
      [name, email, username, hashedPassword, bio, birth_date, location, role]
    );

    const userId = newUser.rows[0].user_id;

    if (role === "admin") {
      await pool.query(
        "INSERT INTO admin (user_id, phone, official_mail) VALUES ($1, $2, $3)",
        [userId, phone, official_mail]
      );
    } else {
      await pool.query(
        "INSERT INTO registered_user (user_id, profile_picture_url) VALUES ($1, $2)",
        [userId, profile_picture_url]
      );
    }

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// SIGNIN ROUTE
app.post("/signin", async (req, res) => {
  const { username, password_hash, role } = req.body; // password_hash is plain password from frontend

  try {
    // Find user by username and role
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND role = $2",
      [username, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }

    const user = userResult.rows[0];

    const isMatch = await comparePassword(password_hash, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }

    // Optional: Send role-specific data
    if (role === "admin") {
      const adminResult = await pool.query(
        "SELECT phone, official_mail FROM admin WHERE user_id = $1",
        [user.user_id]
      );
      user.admin_info = adminResult.rows[0];
    } else {
      const userResult = await pool.query(
        "SELECT profile_picture_url FROM registered_user WHERE user_id = $1",
        [user.user_id]
      );
      user.profile_info = userResult.rows[0];
    }

    res.status(200).json({
      message: "Sign in successful",
      user
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ==================== FILMFUSION ENDPOINTS START ====================

// Get top rated movies (for trending section)
app.get("/movies/top-rated", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.content_id as id,
        c.title,
        EXTRACT(YEAR FROM c.release_date) as year,
        ROUND(AVG(r.score), 1) as rating,
        c.poster_url as poster,
        c.description,
        c.type
      FROM content c
      LEFT JOIN rating r ON c.content_id = r.content_id
      WHERE c.type = 'Movie'
      GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.description, c.type
      HAVING AVG(r.score) IS NOT NULL
      ORDER BY AVG(r.score) DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      movies: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get most viewed movies (for top viewed section)
app.get("/movies/most-viewed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.content_id as id,
        c.title,
        EXTRACT(YEAR FROM c.release_date) as year,
        ROUND(AVG(r.score), 1) as rating,
        c.poster_url as poster,
        c.description,
        c.views,
        c.type
      FROM content c
      LEFT JOIN rating r ON c.content_id = r.content_id
      WHERE c.type = 'Movie'
      GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.description, c.views, c.type
      ORDER BY c.views DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      movies: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get popular series (for series section)
app.get("/series/popular", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.content_id as id,
        c.title,
        EXTRACT(YEAR FROM c.release_date) as year,
        ROUND(AVG(r.score), 1) as rating,
        c.poster_url as poster,
        c.description,
        c.views,
        c.type,
        COUNT(s.season_id) as season_count
      FROM content c
      LEFT JOIN rating r ON c.content_id = r.content_id
      LEFT JOIN season s ON c.content_id = s.series_id
      WHERE c.type = 'Series'
      GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.description, c.views, c.type
      ORDER BY c.views DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      series: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get popular celebrities (most movies worked in)
app.get("/celebrities/popular", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.celebrity_id as id,
        c.name,
        c.bio,
        c.birth_date,
        c.photo_url as photo,
        c.place_of_birth,
        c.gender,
        COUNT(crc.content_id) as movie_count
      FROM celebrity c
      INNER JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      INNER JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      INNER JOIN content co ON crc.content_id = co.content_id
      WHERE co.type = 'Movie'
      GROUP BY c.celebrity_id, c.name, c.bio, c.birth_date, c.photo_url, c.place_of_birth, c.gender
      ORDER BY movie_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      celebrities: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Generic movies endpoint (for backward compatibility)
app.get("/movies", async (req, res) => {
  const { category } = req.query;
  
  try {
    let query;
    let params = [];

    switch (category) {
      case 'top-rated':
        return res.redirect('/movies/top-rated');
      case 'most-viewed':
        return res.redirect('/movies/most-viewed');
      case 'upcoming':
        // For upcoming movies, we'll get movies with future release dates
        query = `
          SELECT 
            c.content_id as id,
            c.title,
            EXTRACT(YEAR FROM c.release_date) as year,
            null as rating,
            c.poster_url as poster,
            c.description,
            c.type
          FROM content c
          WHERE c.type = 'Movie' AND c.release_date > CURRENT_DATE
          ORDER BY c.release_date ASC
          LIMIT 10
        `;
        break;
      default:
        query = `
          SELECT 
            c.content_id as id,
            c.title,
            EXTRACT(YEAR FROM c.release_date) as year,
            ROUND(AVG(r.score), 1) as rating,
            c.poster_url as poster,
            c.description,
            c.type
          FROM content c
          LEFT JOIN rating r ON c.content_id = r.content_id
          WHERE c.type = 'Movie'
          GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.description, c.type
          ORDER BY c.release_date DESC
          LIMIT 10
        `;
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      movies: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== FILMFUSION ENDPOINTS END ====================

app.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.role === "admin") {
      const adminData = await pool.query(
        "SELECT phone, official_mail FROM admin WHERE user_id = $1",
        [userId]
      );
      user.phone = adminData.rows[0]?.phone;
      user.official_mail = adminData.rows[0]?.official_mail;
    } else {
      const userData = await pool.query(
        "SELECT profile_picture_url FROM registered_user WHERE user_id = $1",
        [userId]
      );
      user.profile_picture_url = userData.rows[0]?.profile_picture_url;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
 
app.put("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, bio, profile_picture_url } = req.body;

  try {
    await pool.query(
      "UPDATE users SET username = $1, bio = $2 WHERE user_id = $3",
      [username, bio, userId]
    );

    await pool.query(
      "UPDATE registered_user SET profile_picture_url = $1 WHERE user_id = $2",
      [profile_picture_url, userId]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


app.delete("/watchlist", async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    await pool.query(
      "DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2",
      [userId, movieId]
    );

    res.status(200).json({ message: "Movie removed from watchlist" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error" );
  }
});


// Add new content (movie, series, documentary) by admin
app.post("/movies", async (req, res) => {
  const {
    title, description, release_date, language_id, type, duration,
    poster_url, trailer_url, budget, box_office_collection,
    currency_code, min_age
  } = req.body;

  const views = req.body.views || 0; // default value

  if (!title || !release_date || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO content
       (title, description, release_date, language_id, type, duration, poster_url, trailer_url,
        budget, box_office_collection, currency_code, min_age, views)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING content_id`,
      [title, description, release_date, language_id, type, duration,
       poster_url, trailer_url, budget, box_office_collection,
       currency_code, min_age, views]
    );

    res.status(201).json({ message: "Content added successfully", contentId: result.rows[0].content_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


//new start 

// Get All Content
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content ORDER BY release_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get All Celebrity
app.get('/api/celebrities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM celebrity ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get All Award
app.get('/api/awards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM award ORDER BY year DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


//new end 

// ==================== MOVIE DETAILS ENDPOINTS START ====================

// CHANGE: Similar movies endpoint - MUST be first to avoid route conflicts
app.get("/movies/similar", async (req, res) => {
  try {
    const { genres, excludeId } = req.query;
    
    if (!genres || !excludeId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required parameters: genres and excludeId" 
      });
    }

    const genreArray = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
    const movieId = parseInt(excludeId);

    console.log('Processing similar movies request:', {
      genres: genreArray,
      excludeId: movieId
    });

    if (isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid excludeId parameter, must be a number"
      });
    }
    
    const similarMovies = await pool.query(
      `SELECT DISTINCT 
        c.content_id as movie_id,
        c.title,
        c.release_date,
        c.poster_url,
        c.views,
        COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating
       FROM content c
       JOIN content_genre cg ON c.content_id = cg.content_id
       JOIN genre g ON cg.genre_id = g.genre_id
       LEFT JOIN rating r ON c.content_id = r.content_id
       WHERE g.name = ANY($1::text[])
       AND c.content_id <> $2
       AND c.type = 'Movie'
       GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.views
       ORDER BY average_rating DESC NULLS LAST, views DESC
       LIMIT 10`,
      [genreArray, movieId]
    );

    res.json({
      success: true,
      movies: similarMovies.rows
    });
  } catch (err) {
    console.error('Similar movies error:', err.message);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message 
    });
  }
});

// CHANGE: Added complete movie details endpoint with all related data
app.get("/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Get main movie details with language
    const movieResult = await pool.query(`
      SELECT 
        c.content_id,
        c.title,
        c.description,
        c.release_date,
        c.type,
        c.duration,
        c.poster_url,
        c.trailer_url,
        c.budget,
        c.box_office_collection,
        c.currency_code,
        c.min_age,
        c.views,
        l.name as language_name,
        COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating
      FROM content c
      LEFT JOIN content_language cl ON c.content_id = cl.content_id AND cl.is_primary = true
      LEFT JOIN language l ON cl.language_id = l.language_id
      LEFT JOIN rating r ON c.content_id = r.content_id
      WHERE c.content_id = $1
      GROUP BY 
        c.content_id,
        c.title,
        c.description,
        c.release_date,
        c.type,
        c.duration,
        c.poster_url,
        c.trailer_url,
        c.budget,
        c.box_office_collection,
        c.currency_code,
        c.min_age,
        c.views,
        l.name
    `, [id]);

    console.log('DB Query Result:', movieResult.rows); // Debug log

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found"
      });
    }

    const movie = movieResult.rows[0];

    // Get genres
    const genresResult = await pool.query(`
      SELECT g.name 
      FROM genre g
      JOIN content_genre cg ON g.genre_id = cg.genre_id
      WHERE cg.content_id = $1
    `, [id]);

    movie.genres = genresResult.rows.map(row => row.name);

    // Get director
    const directorResult = await pool.query(`
      SELECT cel.name
      FROM celebrity cel
      JOIN celebrity_role cr ON cel.celebrity_id = cr.celebrity_id
      JOIN role r ON cr.role_id = r.role_id
      JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      WHERE crc.content_id = $1 AND LOWER(r.name) = 'director'
      LIMIT 1
    `, [id]);

    movie.director = directorResult.rows.length > 0 ? directorResult.rows[0].name : null;

    // Get producer
    const producerResult = await pool.query(`
      SELECT cel.name
      FROM celebrity cel
      JOIN celebrity_role cr ON cel.celebrity_id = cr.celebrity_id
      JOIN role r ON cr.role_id = r.role_id
      JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      WHERE crc.content_id = $1 AND LOWER(r.name) = 'producer'
      LIMIT 1
    `, [id]);

    movie.producer = producerResult.rows.length > 0 ? producerResult.rows[0].name : null;

    // Get country
    const countryResult = await pool.query(`
      SELECT co.name
      FROM country co
      JOIN content_country cc ON co.country_id = cc.country_id
      WHERE cc.content_id = $1 AND cc.role = 'production'
      LIMIT 1
    `, [id]);

    movie.country = countryResult.rows.length > 0 ? countryResult.rows[0].name : null;

    res.json({
      success: true,
      movie: movie,
      message: 'Movie details fetched successfully'
    });

  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ 
      success: false, 
      movie: null, 
      message: "Server error" 
    });
  }
});

// CHANGE: Added movie images endpoint
app.get("/movies/:id/images", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        image_id,
        url,
        caption,
        uploaded_at
      FROM image 
      WHERE content_id = $1
      ORDER BY uploaded_at DESC
    `, [id]);

    res.json({
      success: true,
      images: result.rows,
      message: 'Movie images fetched successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      images: [], 
      message: "Server error" 
    });
  }
});

// CHANGE: Added movie reviews endpoint
app.get("/movies/:id/reviews", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        r.review_id,
        r.text,
        r.created_at,
        r.spoiler_alert,
        r.like_count,
        r.dislike_count,
        r.love_count,
        r.funny_count,
        r.wow_count,
        r.angry_count,
        u.username
      FROM review r
      JOIN registered_user ru ON r.registered_user_id = ru.registered_user_id
      JOIN users u ON ru.user_id = u.user_id
      WHERE r.content_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      reviews: result.rows,
      message: 'Movie reviews fetched successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      reviews: [], 
      message: "Server error" 
    });
  }
});

// CHANGE: Added movie cast endpoint
app.get("/movies/:id/cast", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        c.celebrity_id,
        c.name,
        c.photo_url,
        r.name as role_name,
        c.bio
      FROM celebrity c
      JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      JOIN role r ON cr.role_id = r.role_id
      JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      WHERE crc.content_id = $1
      ORDER BY r.name
    `, [id]);

    res.json({
      success: true,
      cast: result.rows,
      message: 'Movie cast fetched successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      cast: [], 
      message: "Server error" 
    });
  }
});

// Get awards for a specific movie
app.get("/movies/:id/awards", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        a.award_id,
        a.name,
        a.year,
        a.type
      FROM award a
      JOIN content_award ca ON a.award_id = ca.award_id
      WHERE ca.content_id = $1
      ORDER BY a.year DESC, a.name
    `, [id]);

    res.json({
      success: true,
      awards: result.rows,
      message: 'Movie awards fetched successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      awards: [], 
      message: "Server error" 
    });
  }
});


app.get("/movies/:id/rating-distribution", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        score,
        COUNT(*) as count
      FROM rating
      WHERE content_id = $1
      GROUP BY score
      ORDER BY score DESC
    `, [id]);

    res.json({
      success: true,
      distribution: result.rows,
      message: 'Rating distribution fetched successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      distribution: [], 
      message: "Server error" 
    });
  }
});

// CHANGE: Added similar movies endpoint - MUST be before the /:id routes to avoid conflict
app.get("/movies/similar", async (req, res) => {
  try {
    const { genres, excludeId } = req.query;
    if (!genres || !excludeId) {
      return res.status(400).json({ error: "Missing required parameters: genres and excludeId" });
    }
    
    const genreArray = genres.split(',').map(g => g.trim());
    
    // Get movies that share any of the genres, excluding the current movie
    const similarMovies = await pool.query(
      `WITH movie_genres AS (
        SELECT DISTINCT c.content_id, COUNT(g.name) as matching_genres
        FROM content c
        JOIN content_genre cg ON c.content_id = cg.content_id
        JOIN genre g ON cg.genre_id = g.genre_id
        WHERE g.name = ANY($1::text[])
        AND c.type = 'Movie'
        AND c.content_id <> $2
        GROUP BY c.content_id
      )
      SELECT DISTINCT 
        c.content_id as movie_id,
        c.title,
        c.release_date,
        c.poster_url,
        c.views,
        COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating,
        mg.matching_genres
      FROM content c
      JOIN movie_genres mg ON c.content_id = mg.content_id
      LEFT JOIN rating r ON c.content_id = r.content_id
      GROUP BY c.content_id, c.title, c.release_date, c.poster_url, c.views, mg.matching_genres
      ORDER BY mg.matching_genres DESC, average_rating DESC
      LIMIT 10`,
      [genreArray, movieId]
    );

    res.json(similarMovies.rows);
  } catch (err) {
    console.error('Similar movies error:', err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
// ==================== MOVIE DETAILS ENDPOINTS END ====================

// ==================== REVIEW ENDPOINTS START ====================

// Add a review for a movie
app.post("/movies/:id/reviews", async (req, res) => {
  const { id: content_id } = req.params;
  const { text, user_id, spoiler_alert = false } = req.body;

  try {
    // Check if user exists and is a registered user (not admin)
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id, u.username, u.name 
       FROM registered_user ru 
       JOIN users u ON ru.user_id = u.user_id 
       WHERE ru.user_id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: "Only registered users can submit reviews" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Check if movie exists
    const movieCheck = await pool.query(
      "SELECT content_id, title FROM content WHERE content_id = $1",
      [content_id]
    );

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Check if user already reviewed this movie
    const existingReview = await pool.query(
      "SELECT review_id FROM review WHERE registered_user_id = $1 AND content_id = $2",
      [registered_user_id, content_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ 
        error: "You have already reviewed this movie" 
      });
    }

    // Insert the review (created_at will be auto-set by trigger)
    const result = await pool.query(
      `INSERT INTO review (registered_user_id, content_id, text, spoiler_alert) 
       VALUES ($1, $2, $3, $4) 
       RETURNING review_id, text, created_at, spoiler_alert`,
      [registered_user_id, content_id, text, spoiler_alert]
    );

    const newReview = result.rows[0];

    // Return the complete review data
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: {
        review_id: newReview.review_id,
        text: newReview.text,
        created_at: newReview.created_at,
        spoiler_alert: newReview.spoiler_alert,
        username: userCheck.rows[0].username,
        user_name: userCheck.rows[0].name,
        like_count: 0,
        dislike_count: 0,
        love_count: 0,
        funny_count: 0,
        wow_count: 0,
        angry_count: 0
      }
    });

  } catch (err) {
    console.error('Add review error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// Update a review
app.put("/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { text, user_id, spoiler_alert = false } = req.body;

  try {
    // Verify the review belongs to the user
    const reviewCheck = await pool.query(
      `SELECT r.review_id, ru.user_id 
       FROM review r 
       JOIN registered_user ru ON r.registered_user_id = ru.registered_user_id 
       WHERE r.review_id = $1 AND ru.user_id = $2`,
      [reviewId, user_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: "You can only edit your own reviews" 
      });
    }

    // Update the review
    const result = await pool.query(
      `UPDATE review SET text = $1, spoiler_alert = $2, created_at = CURRENT_TIMESTAMP 
       WHERE review_id = $3 
       RETURNING review_id, text, created_at, spoiler_alert`,
      [text, spoiler_alert, reviewId]
    );

    res.json({
      success: true,
      message: "Review updated successfully",
      review: result.rows[0]
    });

  } catch (err) {
    console.error('Update review error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// Delete a review
app.delete("/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { user_id } = req.body;

  try {
    // Verify the review belongs to the user
    const reviewCheck = await pool.query(
      `SELECT r.review_id, ru.user_id 
       FROM review r 
       JOIN registered_user ru ON r.registered_user_id = ru.registered_user_id 
       WHERE r.review_id = $1 AND ru.user_id = $2`,
      [reviewId, user_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: "You can only delete your own reviews" 
      });
    }

    // Delete the review (reactions will be deleted by cascade if set up)
    await pool.query("DELETE FROM review WHERE review_id = $1", [reviewId]);

    res.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// ==================== REVIEW ENDPOINTS END ====================

// ==================== RATING ENDPOINTS START ====================

// Add or update a rating for a movie
app.post("/movies/:id/rating", async (req, res) => {
  const { id: content_id } = req.params;
  const { score, user_id } = req.body;

  // Validate score
  if (!score || score < 1 || score > 10) {
    return res.status(400).json({ 
      error: "Rating score must be between 1 and 10" 
    });
  }

  try {
    // Check if user exists and is a registered user
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id, u.username, u.name 
       FROM registered_user ru 
       JOIN users u ON ru.user_id = u.user_id 
       WHERE ru.user_id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: "Only registered users can submit ratings" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Check if movie exists
    const movieCheck = await pool.query(
      "SELECT content_id, title FROM content WHERE content_id = $1",
      [content_id]
    );

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Insert or update rating (your upsert_rating trigger will handle duplicates)
    const result = await pool.query(
      `INSERT INTO rating (registered_user_id, content_id, score) 
       VALUES ($1, $2, $3) 
       RETURNING rating_id, score, created_at`,
      [registered_user_id, content_id, score]
    );

    // Get updated movie average rating
    const avgResult = await pool.query(
      `SELECT average_rating, rating_count FROM content WHERE content_id = $1`,
      [content_id]
    );

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      rating: {
        rating_id: result.rows[0]?.rating_id,
        score: score,
        created_at: result.rows[0]?.created_at,
        username: userCheck.rows[0].username
      },
      movieStats: {
        average_rating: avgResult.rows[0]?.average_rating || 0,
        rating_count: avgResult.rows[0]?.rating_count || 0
      }
    });

  } catch (err) {
    console.error('Add rating error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// Get user's rating for a specific movie
app.get("/movies/:id/rating/:userId", async (req, res) => {
  const { id: content_id, userId } = req.params;

  try {
    // Get user's registered_user_id
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id 
       FROM registered_user ru 
       WHERE ru.user_id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Get user's rating for this movie
    const result = await pool.query(
      `SELECT rating_id, score, created_at 
       FROM rating 
       WHERE registered_user_id = $1 AND content_id = $2`,
      [registered_user_id, content_id]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        rating: null,
        message: "No rating found for this user and movie"
      });
    }

    res.json({
      success: true,
      rating: result.rows[0],
      message: "User rating fetched successfully"
    });

  } catch (err) {
    console.error('Get user rating error:', err.message);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message 
    });
  }
});

// Remove a user's rating for a movie
app.delete("/movies/:id/rating", async (req, res) => {
  const { id: content_id } = req.params;
  const { user_id } = req.body;

  try {
    // Get user's registered_user_id
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id 
       FROM registered_user ru 
       WHERE ru.user_id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Delete the rating
    const result = await pool.query(
      `DELETE FROM rating 
       WHERE registered_user_id = $1 AND content_id = $2 
       RETURNING rating_id`,
      [registered_user_id, content_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "No rating found to delete" 
      });
    }

    // Calculate updated movie average rating manually (in case trigger doesn't exist)
    const avgResult = await pool.query(
      `SELECT 
        ROUND(COALESCE(AVG(score), 0), 1) as average_rating, 
        COUNT(*) as rating_count 
       FROM rating 
       WHERE content_id = $1`,
      [content_id]
    );

    // Also update the content table manually to ensure consistency
    await pool.query(
      `UPDATE content 
       SET average_rating = $1, rating_count = $2 
       WHERE content_id = $3`,
      [
        avgResult.rows[0]?.average_rating || 0,
        avgResult.rows[0]?.rating_count || 0,
        content_id
      ]
    );

    res.json({
      success: true,
      message: "Rating removed successfully",
      movieStats: {
        average_rating: avgResult.rows[0]?.average_rating || 0,
        rating_count: avgResult.rows[0]?.rating_count || 0
      }
    });

  } catch (err) {
    console.error('Remove rating error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// ==================== RATING ENDPOINTS END ====================

// ==================== REACTION ENDPOINTS START ====================

// Add/Update/Remove reaction to a review
app.post("/reviews/:reviewId/reactions", async (req, res) => {
  const { reviewId } = req.params;
  const { type, user_id } = req.body;

  console.log('Reaction endpoint called:', { reviewId, type, user_id });

  try {
    // Get user's registered_user_id
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id 
       FROM registered_user ru 
       WHERE ru.user_id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Check if review exists
    const reviewCheck = await pool.query(
      "SELECT review_id FROM review WHERE review_id = $1",
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check current reaction state
    const existingReaction = await pool.query(
      `SELECT reaction_id, type FROM reaction 
       WHERE review_id = $1 AND registered_user_id = $2`,
      [reviewId, registered_user_id]
    );

    if (existingReaction.rows.length > 0) {
      const currentReaction = existingReaction.rows[0];
      
      if (currentReaction.type === type) {
        // Same reaction clicked - DELETE (unavoidable for toggle functionality)
        await pool.query(
          `DELETE FROM reaction 
           WHERE reaction_id = $1`,
          [currentReaction.reaction_id]
        );
        
        return res.json({
          success: true,
          action: 'removed',
          message: `${type} reaction removed`
        });
      } else {
        // Different reaction - UPDATE (preserves ID!)
        const result = await pool.query(
          `UPDATE reaction SET type = $1 
           WHERE reaction_id = $2
           RETURNING reaction_id, type`,
          [type, currentReaction.reaction_id]
        );
        
        return res.json({
          success: true,
          action: 'updated',
          reaction_id: result.rows[0].reaction_id,
          message: `Reaction changed to ${type}`
        });
      }
    } else {
      // No existing reaction - INSERT new one
      const result = await pool.query(
        `INSERT INTO reaction (review_id, registered_user_id, type) 
         VALUES ($1, $2, $3)
         RETURNING reaction_id, type`,
        [reviewId, registered_user_id, type]
      );
      
      return res.json({
        success: true,
        action: 'added',
        reaction_id: result.rows[0].reaction_id,
        message: `${type} reaction added`
      });
    }

  } catch (err) {
    console.error('Reaction error:', err.message);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// Get user's reactions for a movie's reviews
app.get("/reviews/reactions/:movieId/:userId", async (req, res) => {
  const { movieId, userId } = req.params;

  try {
    // Get user's registered_user_id
    const userCheck = await pool.query(
      `SELECT ru.registered_user_id 
       FROM registered_user ru 
       WHERE ru.user_id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const registered_user_id = userCheck.rows[0].registered_user_id;

    // Get all user's reactions for this movie's reviews
    const result = await pool.query(
      `SELECT r.review_id, r.type 
       FROM reaction r
       JOIN review rev ON r.review_id = rev.review_id
       WHERE rev.content_id = $1 AND r.registered_user_id = $2`,
      [movieId, registered_user_id]
    );

    // Convert to object format for easy lookup
    const reactions = {};
    result.rows.forEach(row => {
      reactions[row.review_id] = {
        [row.type]: true
      };
    });

    res.json({
      success: true,
      reactions: reactions,
      message: "User reactions fetched successfully"
    });

  } catch (err) {
    console.error('Get reactions error:', err.message);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message 
    });
  }
});

// ==================== REACTION ENDPOINTS END ====================

// ==================== ADVANCED SEARCH ENDPOINTS START ====================

// Advanced search for titles (movies/series)
app.post("/search/advanced", async (req, res) => {
  const {
    titleName,
    titleType,
    releaseDate,
    imdbRating,
    numberOfRatings,
    genre,
    language,
    country,
    castCrew,
    runtime,
    keywords,
    sortBy,
    sortDirection
  } = req.body;

  try {
    // Build the base query
    let query = `
      SELECT DISTINCT
        c.content_id as id,
        c.title,
        c.description,
        c.release_date,
        c.type,
        c.duration,
        c.poster_url,
        c.views,
        COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating,
        COUNT(r.rating_id) as rating_count,
        l.name as language_name
      FROM content c
      LEFT JOIN rating r ON c.content_id = r.content_id
      LEFT JOIN content_language cl ON c.content_id = cl.content_id AND cl.is_primary = true
      LEFT JOIN language l ON cl.language_id = l.language_id
    `;

    // Join tables as needed
    const joins = [];
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Title name filter
    if (titleName && titleName.trim()) {
      conditions.push(`c.title ILIKE $${paramIndex}`);
      params.push(`%${titleName.trim()}%`);
      paramIndex++;
    }

    // Title type filter
    if (titleType) {
      if (titleType === 'movie') {
        conditions.push(`c.type = 'Movie'`);
      } else if (titleType === 'tv-series') {
        conditions.push(`c.type = 'Series'`);
      }
    }

    // Release date filter
    if (releaseDate && (releaseDate.from || releaseDate.to || releaseDate.fromYear || releaseDate.toYear)) {
      // Handle full date range
      if (releaseDate.from) {
        conditions.push(`c.release_date >= $${paramIndex}`);
        params.push(releaseDate.from);
        paramIndex++;
      }
      if (releaseDate.to) {
        conditions.push(`c.release_date <= $${paramIndex}`);
        params.push(releaseDate.to);
        paramIndex++;
      }
      
      // Handle year-only range
      if (releaseDate.fromYear && !releaseDate.from) {
        conditions.push(`EXTRACT(YEAR FROM c.release_date) >= $${paramIndex}`);
        params.push(parseInt(releaseDate.fromYear));
        paramIndex++;
      }
      if (releaseDate.toYear && !releaseDate.to) {
        conditions.push(`EXTRACT(YEAR FROM c.release_date) <= $${paramIndex}`);
        params.push(parseInt(releaseDate.toYear));
        paramIndex++;
      }
    }

    // Runtime filter
    if (runtime && (runtime.from || runtime.to)) {
      if (runtime.from) {
        conditions.push(`c.duration >= $${paramIndex}`);
        params.push(parseInt(runtime.from));
        paramIndex++;
      }
      if (runtime.to) {
        conditions.push(`c.duration <= $${paramIndex}`);
        params.push(parseInt(runtime.to));
        paramIndex++;
      }
    }

    // Genre filter
    if (genre && genre.length > 0) {
      joins.push(`
        JOIN content_genre cg ON c.content_id = cg.content_id
        JOIN genre g ON cg.genre_id = g.genre_id
      `);
      conditions.push(`g.name = ANY($${paramIndex}::text[])`);
      params.push(genre);
      paramIndex++;
    }

    // Language filter
    if (language && language.trim()) {
      if (!joins.some(j => j.includes('content_language'))) {
        joins.push(`
          JOIN content_language cl2 ON c.content_id = cl2.content_id
          JOIN language l2 ON cl2.language_id = l2.language_id
        `);
      }
      conditions.push(`l2.name ILIKE $${paramIndex}`);
      params.push(`%${language.trim()}%`);
      paramIndex++;
    }

    // Country filter
    if (country && country.trim()) {
      joins.push(`
        JOIN content_country cc ON c.content_id = cc.content_id
        JOIN country co ON cc.country_id = co.country_id
      `);
      conditions.push(`co.name ILIKE $${paramIndex}`);
      params.push(`%${country.trim()}%`);
      paramIndex++;
    }

    // Cast or Crew filter
    if (castCrew && castCrew.trim()) {
      joins.push(`
        JOIN celebrity_role_content crc ON c.content_id = crc.content_id
        JOIN celebrity_role cr ON crc.celebrity_role_id = cr.celebrity_role_id
        JOIN celebrity cel ON cr.celebrity_id = cel.celebrity_id
      `);
      conditions.push(`cel.name ILIKE $${paramIndex}`);
      params.push(`%${castCrew.trim()}%`);
      paramIndex++;
    }

    // Keywords filter (search in title and description)
    if (keywords && keywords.trim()) {
      conditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex + 1})`);
      params.push(`%${keywords.trim()}%`);
      params.push(`%${keywords.trim()}%`);
      paramIndex += 2;
    }

    // Add joins to query
    query += joins.join(' ');

    // Add WHERE conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Group by for aggregation
    query += `
      GROUP BY 
        c.content_id, c.title, c.description, c.release_date, c.type, 
        c.duration, c.poster_url, c.views, l.name
    `;

    // Having clause for rating filters
    const havingConditions = [];
    if (imdbRating && (imdbRating.from || imdbRating.to)) {
      if (imdbRating.from) {
        havingConditions.push(`AVG(r.score) >= ${parseFloat(imdbRating.from)}`);
      }
      if (imdbRating.to) {
        havingConditions.push(`AVG(r.score) <= ${parseFloat(imdbRating.to)}`);
      }
    }

    if (numberOfRatings && (numberOfRatings.from || numberOfRatings.to)) {
      if (numberOfRatings.from) {
        havingConditions.push(`COUNT(r.rating_id) >= ${parseInt(numberOfRatings.from)}`);
      }
      if (numberOfRatings.to) {
        havingConditions.push(`COUNT(r.rating_id) <= ${parseInt(numberOfRatings.to)}`);
      }
    }

    if (havingConditions.length > 0) {
      query += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Add ordering
    let orderBy = 'c.title ASC'; // default
    if (sortBy) {
      switch (sortBy) {
        case 'alphabetical':
          orderBy = `c.title ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        case 'user_rating':
          orderBy = `average_rating ${sortDirection === 'desc' ? 'DESC' : 'ASC'} NULLS LAST`;
          break;
        case 'number_of_ratings':
          orderBy = `rating_count ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        case 'year':
          orderBy = `EXTRACT(YEAR FROM c.release_date) ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        case 'release_date':
          orderBy = `c.release_date ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        case 'runtime':
          orderBy = `c.duration ${sortDirection === 'desc' ? 'DESC' : 'ASC'} NULLS LAST`;
          break;
        case 'box_office':
          orderBy = `c.box_office_collection ${sortDirection === 'desc' ? 'DESC' : 'ASC'} NULLS LAST`;
          break;
        default:
          orderBy = 'c.title ASC';
      }
    }

    query += ` ORDER BY ${orderBy}`;
    query += ` LIMIT 50`; // Limit results

    console.log('Generated query:', query);
    console.log('Parameters:', params);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      results: result.rows,
      count: result.rows.length,
      message: 'Search completed successfully'
    });

  } catch (err) {
    console.error('Advanced search error:', err.message);
    res.status(500).json({ 
      success: false,
      results: [],
      count: 0,
      message: "Server error",
      error: err.message
    });
  }
});

// Get all available genres for filter dropdown
app.get("/search/genres", async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM genre ORDER BY name ASC');
    res.json({
      success: true,
      genres: result.rows.map(row => row.name)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      genres: [],
      message: "Server error" 
    });
  }
});

// Get all available languages for filter dropdown
app.get("/search/languages", async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM language ORDER BY name ASC');
    res.json({
      success: true,
      languages: result.rows.map(row => row.name)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      languages: [],
      message: "Server error" 
    });
  }
});

// Get all available countries for filter dropdown
app.get("/search/countries", async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM country ORDER BY name ASC');
    res.json({
      success: true,
      countries: result.rows.map(row => row.name)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      countries: [],
      message: "Server error" 
    });
  }
});

// Advanced search for celebrities
app.post("/search/celebrities", async (req, res) => {
  try {
    const {
      celebrityName,
      birthDate,
      deathDate,
      birthday,
      gender,
      sortBy = 'name',
      sortDirection = 'asc'
    } = req.body;

    console.log('Celebrity search request:', req.body);

    let query = `
      SELECT 
        c.celebrity_id as id,
        c.name,
        c.bio,
        c.birth_date,
        c.death_date,
        c.place_of_birth,
        c.gender,
        c.photo_url,
        COUNT(DISTINCT crc.content_id) as movie_count
      FROM celebrity c
      LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      LEFT JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      LEFT JOIN content co ON crc.content_id = co.content_id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Name filter
    if (celebrityName && celebrityName.trim()) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${celebrityName.trim()}%`);
      paramIndex++;
    }

    // Birth date filters
    if (birthDate) {
      if (birthDate.from) {
        conditions.push(`c.birth_date >= $${paramIndex}`);
        params.push(birthDate.from);
        paramIndex++;
      }
      if (birthDate.to) {
        conditions.push(`c.birth_date <= $${paramIndex}`);
        params.push(birthDate.to);
        paramIndex++;
      }
      if (birthDate.fromYear && !birthDate.from) {
        conditions.push(`EXTRACT(YEAR FROM c.birth_date) >= $${paramIndex}`);
        params.push(parseInt(birthDate.fromYear));
        paramIndex++;
      }
      if (birthDate.toYear && !birthDate.to) {
        conditions.push(`EXTRACT(YEAR FROM c.birth_date) <= $${paramIndex}`);
        params.push(parseInt(birthDate.toYear));
        paramIndex++;
      }
    }

    // Death date filters
    if (deathDate) {
      if (deathDate.from) {
        conditions.push(`c.death_date >= $${paramIndex}`);
        params.push(deathDate.from);
        paramIndex++;
      }
      if (deathDate.to) {
        conditions.push(`c.death_date <= $${paramIndex}`);
        params.push(deathDate.to);
        paramIndex++;
      }
      if (deathDate.fromYear && !deathDate.from) {
        conditions.push(`EXTRACT(YEAR FROM c.death_date) >= $${paramIndex}`);
        params.push(parseInt(deathDate.fromYear));
        paramIndex++;
      }
      if (deathDate.toYear && !deathDate.to) {
        conditions.push(`EXTRACT(YEAR FROM c.death_date) <= $${paramIndex}`);
        params.push(parseInt(deathDate.toYear));
        paramIndex++;
      }
    }

    // Birthday filter (MM-DD format)
    if (birthday && birthday.trim()) {
      const [month, day] = birthday.trim().split('-');
      if (month && day) {
        conditions.push(`EXTRACT(MONTH FROM c.birth_date) = $${paramIndex} AND EXTRACT(DAY FROM c.birth_date) = $${paramIndex + 1}`);
        params.push(parseInt(month));
        params.push(parseInt(day));
        paramIndex += 2;
      }
    }

    // Gender filter
    if (gender && gender.trim()) {
      conditions.push(`c.gender = $${paramIndex}`);
      params.push(gender.trim());
      paramIndex++;
    }

    // Add WHERE conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Group by celebrity fields
    query += ` GROUP BY c.celebrity_id, c.name, c.bio, c.birth_date, c.death_date, c.place_of_birth, c.gender, c.photo_url`;

    // Add sorting
    let orderBy = 'c.name ASC';
    if (sortBy) {
      switch (sortBy) {
        case 'name':
        case 'alphabetical':
          orderBy = `c.name ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        case 'birth_date':
          orderBy = `c.birth_date ${sortDirection === 'desc' ? 'DESC' : 'ASC'} NULLS LAST`;
          break;
        case 'movie_count':
          orderBy = `movie_count ${sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
          break;
        default:
          orderBy = 'c.name ASC';
      }
    }

    query += ` ORDER BY ${orderBy}`;
    query += ` LIMIT 50`; // Limit results

    console.log('Generated celebrity query:', query);
    console.log('Parameters:', params);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      results: result.rows,
      count: result.rows.length,
      message: 'Celebrity search completed successfully'
    });

  } catch (err) {
    console.error('Celebrity search error:', err.message);
    res.status(500).json({ 
      success: false,
      results: [],
      count: 0,
      message: "Server error",
      error: err.message
    });
  }
});

// ==================== ADVANCED SEARCH ENDPOINTS END ====================




app.listen(5000, () => {
  console.log("Server has started on port 5000");
});