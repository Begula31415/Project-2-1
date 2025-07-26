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
  const { username, bio, profile_picture_url, phone, official_mail } = req.body;  
  
  try {  
    // Get user role first  
    const userResult = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);    
        
    if (userResult.rows.length === 0) {    
      return res.status(404).json({ error: "User not found" });    
    }    
    
    const userRole = userResult.rows[0].role;    
    
    // Update users table with basic info  
    await pool.query(    
      "UPDATE users SET username = $1, bio = $2 WHERE user_id = $3",    
      [username, bio, userId]    
    );    
    
    // Update role-specific table    
    if (userRole === "admin") {    
      // For admin, update admin table if phone/official_mail provided  
      if (phone !== undefined || official_mail !== undefined) {    
        await pool.query(    
          "UPDATE admin SET phone = COALESCE($1, phone), official_mail = COALESCE($2, official_mail) WHERE user_id = $3",    
          [phone, official_mail, userId]    
        );    
      }  
        
      // For admin profile picture, you might want to add it to users table or create admin_profile table  
      // For now, let's add profile_picture_url to users table  
      if (profile_picture_url !== undefined) {  
        await pool.query(  
          "UPDATE users SET profile_picture_url = $1 WHERE user_id = $2",  
          [profile_picture_url, userId]  
        );  
      }  
    } else {    
      // For regular users, update registered_user table    
      if (profile_picture_url !== undefined) {  
        await pool.query(    
          "UPDATE registered_user SET profile_picture_url = $1 WHERE user_id = $2",    
          [profile_picture_url, userId]    
        );    
      }  
    }  
  
    res.status(200).json({ message: "Profile updated successfully" });  
  } catch (err) {  
    console.error("Database error:", err.message);  
    res.status(500).json({ error: "Server error", details: err.message });  
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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


////new things start herrrrrrreeeeeeeeeeeeeeeeeeeeeeeeeeee

// Route to get all content (movies, series, docs)
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
      content_id AS id,
      title,
      release_date,
      poster_url,
      views
    FROM content ORDER BY content_id DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Route to get all celebrities
app.get('/api/celebrities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.celebrity_id AS id,
        c.name,
        c.photo_url,
        c.gender,
        c.bio,
        ARRAY_AGG(r.name) AS roles
      FROM celebrity c
      LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      LEFT JOIN role r ON cr.role_id = r.role_id
      GROUP BY c.celebrity_id
      ORDER BY c.celebrity_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching celebrities with roles:', err);
    res.status(500).json({ error: 'Failed to fetch celebrities' });
  }
});


// Route to get all awards
app.get('/api/awards', async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
      award_id AS id,
      name,
      year,
      type
    FROM award ORDER BY award_id DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching awards:', err);
    res.status(500).json({ error: 'Failed to fetch awards' });
  }
});


app.get('/api/check-content-exists', async (req, res) => {
  const { title, release_date, type } = req.query;

  if (!title || !release_date || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await pool.query(
      `SELECT 1 FROM content WHERE title = $1 AND release_date = $2 AND type = $3 LIMIT 1`,
      [title, release_date, type]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('❌ Error checking content existence:', err);
    res.status(500).json({ error: 'Database error during content existence check' });
  }
});


app.post('/api/content', async (req, res) => {
  const {
    title, description, release_date, language, type, duration,
    poster_url, trailer_url, budget, box_office_collection,
    currency_code, min_age, views, country, genres,
    top_cast, producer, writer, directors, awards
  } = req.body;

  const client = await pool.connect();

  try {
    // ✅ Step 1: Pre-check that all celebrities exist
    const allCelebrities = [...(top_cast || []), ...(directors || [])];
    console.log('All celebrities to check:', allCelebrities);
    if (producer) allCelebrities.push(producer);
    if (writer) allCelebrities.push(writer);

    for (const name of allCelebrities) {
      const celebCheck = await pool.query('SELECT celebrity_id FROM celebrity WHERE name = $1', [name]);
      if (celebCheck.rows.length === 0) {
        return res.status(400).json({
          error: `Celebrity "${name}" not found in the database. Please add them before creating the content.`,
        });
      }
    }

    // ✅ Step 2: Begin transaction
    await client.query('BEGIN');

    // Insert into content
    const insertContentQuery = `
      INSERT INTO content (title, description, release_date, type, duration, poster_url,
        trailer_url, budget, box_office_collection, currency_code, min_age, views)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING content_id;
    `;

    const contentResult = await client.query(insertContentQuery, [
      title, description, release_date, type, duration, poster_url, trailer_url,
      budget, box_office_collection, currency_code, min_age, views
    ]);
    const contentId = contentResult.rows[0].content_id;
    console.log('✅ Inserted into content');

    // Language => content_language
    let langResult = await client.query('SELECT language_id FROM language WHERE name = $1', [language]);
    if (langResult.rows.length === 0) {
      langResult = await client.query('INSERT INTO language(name) VALUES ($1) RETURNING language_id', [language]);
    }
    const languageId = langResult.rows[0].language_id;
    await client.query('INSERT INTO content_language(content_id, language_id, is_primary) VALUES ($1, $2, true)', [contentId, languageId]);
    console.log('✅ Inserted into content_language');

    // Country => content_country
    let countryResult = await client.query('SELECT country_id FROM country WHERE name = $1', [country]);
    if (countryResult.rows.length === 0) {
      countryResult = await client.query('INSERT INTO country(name) VALUES ($1) RETURNING country_id', [country]);
    }
    const countryId = countryResult.rows[0].country_id;
    await client.query('INSERT INTO content_country(content_id, country_id, role) VALUES ($1, $2, $3)', [contentId, countryId, 'production']);
    console.log('✅ Inserted into content_country');

    // Genre => content_genre
    for (const g of genres) {
      let genreResult = await client.query('SELECT genre_id FROM genre WHERE name = $1', [g]);
      if (genreResult.rows.length === 0) {
        genreResult = await client.query('INSERT INTO genre(name) VALUES ($1) RETURNING genre_id', [g]);
      }
      await client.query('INSERT INTO content_genre(content_id, genre_id) VALUES ($1, $2)', [contentId, genreResult.rows[0].genre_id]);
    }
    console.log('✅ Inserted into content_genre');

    // Awards => content_award
    for (const awardName of awards) {
      const awardResult = await client.query('SELECT award_id FROM award WHERE name = $1', [awardName]);
      if (awardResult.rows.length > 0) {
        await client.query('INSERT INTO content_award(content_id, award_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contentId, awardResult.rows[0].award_id]);
      }
    }
    console.log('✅ Inserted into content_award');

    // ✅ Step 3: Define addRoleLink (now inserts missing roles if needed)
    const addRoleLink = async (name, roleName) => {
      // Celebrity already exists — checked earlier
      const celebRes = await client.query('SELECT celebrity_id FROM celebrity WHERE name = $1', [name]);
      const celebrityId = celebRes.rows[0].celebrity_id;

      // Get or create role
      let roleRes = await client.query('SELECT role_id FROM role WHERE name = $1', [roleName]);
      if (roleRes.rows.length === 0) {
        roleRes = await client.query('INSERT INTO role(name) VALUES ($1) RETURNING role_id', [roleName]);
        console.log(`✅ Created role "${roleName}"`);
      }
      const roleId = roleRes.rows[0].role_id;

      // Get or create celebrity_role
      let celebRoleRes = await client.query(
        'SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = $1 AND role_id = $2',
        [celebrityId, roleId]
      );
      if (celebRoleRes.rows.length === 0) {
        celebRoleRes = await client.query(
          'INSERT INTO celebrity_role(celebrity_id, role_id) VALUES ($1, $2) RETURNING celebrity_role_id',
          [celebrityId, roleId]
        );
        console.log(`✅ Assigned role "${roleName}" to "${name}"`);
      }
      const celebRoleId = celebRoleRes.rows[0].celebrity_role_id;

      // Link to content
      await client.query(
        'INSERT INTO celebrity_role_content(celebrity_role_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [celebRoleId, contentId]
      );
      console.log(`✅ Linked "${name}" as "${roleName}" to content`);
    };

    // ✅ Step 4: Apply roles
    for (const d of directors) await addRoleLink(d, 'Director');
    for (const a of top_cast) await addRoleLink(a, 'Actor');
    if (producer) await addRoleLink(producer, 'Producer');
    if (writer) await addRoleLink(writer, 'Writer');

    console.log('✅ All roles processed');

    // ✅ Step 5: Commit transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed');
    res.status(201).json({ message: 'Content added successfully', content_id: contentId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting content:', err);
    res.status(500).json({ error: 'Failed to insert content' });
  } finally {
    client.release();
  }
});


app.delete('/api/celebrities/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete from celebrity_role_content
    await client.query(`
      DELETE FROM celebrity_role_content
      WHERE celebrity_role_id IN (
        SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = $1
      )
    `, [id]);
    console.log(`✅ Deleted from celebrity_role_content for celebrity_id = ${id}`);

    // 2. Delete from celebrity_role
    await client.query(`
      DELETE FROM celebrity_role WHERE celebrity_id = $1
    `, [id]);
    console.log(`✅ Deleted from celebrity_role for celebrity_id = ${id}`);

    // 3. Delete from celebrity_award (if applicable)
    await client.query(`
      DELETE FROM celebrity_award WHERE celebrity_id = $1
    `, [id]);
    console.log(`✅ Deleted from celebrity_award for celebrity_id = ${id}`);

    // 4. 🔥 Delete from image table before celebrity
    await client.query(`
      DELETE FROM image WHERE celebrity_id = $1
    `, [id]);
    console.log(`✅ Deleted from image for celebrity_id = ${id}`);

    // 5. Delete from celebrity
    await client.query(`
      DELETE FROM celebrity WHERE celebrity_id = $1
    `, [id]);
    console.log(`✅ Deleted from celebrity for celebrity_id = ${id}`);

    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully');

    res.status(200).json({ message: 'Celebrity and all related data removed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting celebrity, transaction rolled back:', err);
    res.status(500).json({ error: 'Failed to delete celebrity' });
  } finally {
    client.release();
    console.log('🔚 Database connection released');
  }
});





app.get('/api/celebrities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        c.celebrity_id AS id,
        c.name,
        c.bio,
        c.birth_date,
        c.death_date,
        c.place_of_birth,
        c.gender,
        c.photo_url,
        ARRAY_AGG(r.name) AS roles
      FROM celebrity c
      LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      LEFT JOIN role r ON cr.role_id = r.role_id
      WHERE c.celebrity_id = $1
      GROUP BY c.celebrity_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Celebrity not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching celebrity by ID:", err);
    res.status(500).json({ error: "Failed to fetch celebrity" });
  }
});


// In routes/celebrityRoutes.js or similar
app.get('/check-celebrity-exists', async (req, res) => {
  const { name, birth_date } = req.query;

  try {
    const result = await pool.query(
      'SELECT 1 FROM celebrity WHERE name = $1 AND birth_date = $2 LIMIT 1',
      [name, birth_date]
    );

    res.json({ exists: result.rowCount > 0 });
  } catch (err) {
    console.error('Error checking celebrity existence:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Add new celebrity and assign profession (role)
app.post('/api/celebrities', async (req, res) => {
  const {
    name,
    bio,
    birth_date,
    death_date,
    place_of_birth,
    gender,
    photo_url,
    profession
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Insert celebrity
    const insertCelebrityQuery = `
      INSERT INTO celebrity 
      (name, bio, birth_date, death_date, place_of_birth, gender, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING celebrity_id;
    `;



    const result = await client.query(insertCelebrityQuery, [
      name,
      bio,
      birth_date,
      death_date || null,
      place_of_birth,
      gender,
      photo_url
    ]);
    console.log('1st query done');

    const celebrityId = result.rows[0].celebrity_id;

    // Step 2: Check if role exists; insert if not
    let roleResult = await client.query(`SELECT role_id FROM role WHERE name = $1`, [profession]);

    //if (roleResult.rows.length === 0) {
      console.log('2nd query done');
    
    let roleId;

    if (roleResult.rows.length > 0) {
      roleId = roleResult.rows[0].role_id;
    } else {
      const insertRole = await client.query(
        `INSERT INTO role (name) VALUES ($1) RETURNING role_id`,
        [profession]
        
      );
      console.log('3rd query done');
      roleId = insertRole.rows[0].role_id;
    }

    // Step 3: Link celebrity to role
    await client.query(
      `INSERT INTO celebrity_role (celebrity_id, role_id) VALUES ($1, $2)`,
      [celebrityId, roleId]
    );
    console.log('4th query done');

    await client.query('COMMIT');

    res.status(201).json({ message: 'Celebrity added successfully', celebrity_id: celebrityId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding celebrity:', err);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to add celebrity' });
  } finally {
    client.release();
  }
});



app.get('/api/check-celebrity-exists', async (req, res) => {
  const { name, birth_date } = req.query;

  try {
    const result = await pool.query(
      'SELECT 1 FROM celebrity WHERE name = $1 AND birth_date = $2 LIMIT 1',
      [name, birth_date]
    );

    res.json({ exists: result.rowCount > 0 });
  } catch (err) {
    console.error('Error checking celebrity existence:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.delete('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete from dependent tables (if applicable)
    await client.query(`DELETE FROM content_genre WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content_genre for content_id = ${id}`);

    await client.query(`DELETE FROM content_country WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content_country for content_id = ${id}`);

    await client.query(`DELETE FROM content_language WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content_language for content_id = ${id}`);

    await client.query(`DELETE FROM content_award WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content_award for content_id = ${id}`);

    await client.query(`DELETE FROM content_views WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content_views for content_id = ${id}`);

    await client.query(`DELETE FROM rating WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from rating for content_id = ${id}`);

    await client.query(`DELETE FROM review WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from review for content_id = ${id}`);

    await client.query(`DELETE FROM image WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from image for content_id = ${id}`);

    await client.query(`DELETE FROM wishlist WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from wishlist for content_id = ${id}`);

    await client.query('DELETE FROM season WHERE series_id = $1', [id]);
console.log(`✅ Deleted from season for content_id = ${id}`);


    // 2. Delete the content itself
    await client.query(`DELETE FROM content WHERE content_id = $1`, [id]);
    console.log(`✅ Deleted from content for content_id = ${id}`);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Content and related records deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting content, transaction rolled back:', err);
    res.status(500).json({ error: 'Failed to delete content' });
  } finally {
    client.release();
    console.log('🔚 Database connection released');
  }
});


// app.get('/user/:id', async (req, res) => {
//   const userId = req.params.id;
//   try {
//     const result = await pool.query(
//       'SELECT username, bio, role,email, profile_picture_url, favorite_genre, birth_date, location,created_at FROM users WHERE user_id = $1',
//       [userId]
//     );
//     if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error fetching user:', err.message);
//     res.status(500).json({ error: 'Failed to fetch user details' });
//   }
// });


// app.put('/user/:id', async (req, res) => {
//   const userId = req.params.id;
//   const { username, bio } = req.body;

//   try {
//     await pool.query(
//       'UPDATE users SET username = $1, bio = $2 WHERE user_id = $3',
//       [username, bio, userId]
//     );
//     res.json({ message: 'Profile updated successfully' });
//   } catch (err) {
//     console.error('Error updating profile:', err.message);
//     res.status(500).json({ error: 'Failed to update profile' });
//   }
// });



app.delete('/watchlist/:userId/:contentId', async (req, res) => {
  const { userId, contentId } = req.params;
  try {
    await pool.query(
      'DELETE FROM watchlist WHERE user_id = $1 AND content_id = $2',
      [userId, contentId]
    );
    res.json({ message: 'Content removed from watchlist' });
  } catch (err) {
    console.error('Error removing from watchlist:', err.message);
    res.status(500).json({ error: 'Failed to remove content' });
  }
});



// Add new series with seasons  
app.post('/api/series', async (req, res) => {  
  const {  
    title, description, release_date, language, type, duration,  
    poster_url, trailer_url, budget, box_office_collection,  
    currency_code, min_age, views, country, genres, top_cast,  
    directors, awards, seasons  
  } = req.body;  
  
  const client = await pool.connect();  
  
  try {  
    await client.query('BEGIN');  
  
    // 1. Insert into content (same as movie)  
    const insertContentQuery = `  
      INSERT INTO content (title, description, release_date, type, duration, poster_url,  
        trailer_url, budget, box_office_collection, currency_code, min_age, views)  
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)  
      RETURNING content_id;  
    `;  
  
    const contentResult = await client.query(insertContentQuery, [  
      title, description, release_date, type, duration, poster_url,  
      trailer_url, budget, box_office_collection, currency_code, min_age, views  
    ]);  
    const contentId = contentResult.rows[0].content_id;  
  
    // 2-5. Same as movie (language, country, genres, awards, roles)  
    let langResult = await client.query('SELECT language_id FROM language WHERE name = $1', [language]);  
    if (langResult.rows.length === 0) {  
      langResult = await client.query('INSERT INTO language(name) VALUES ($1) RETURNING language_id', [language]);  
    }  
    const languageId = langResult.rows[0].language_id;  
    await client.query('INSERT INTO content_language(content_id, language_id, is_primary) VALUES ($1, $2, true)', [contentId, languageId]);  
  
    let countryResult = await client.query('SELECT country_id FROM country WHERE name = $1', [country]);  
    if (countryResult.rows.length === 0) {  
      countryResult = await client.query('INSERT INTO country(name) VALUES ($1) RETURNING country_id', [country]);  
    }  
    const countryId = countryResult.rows[0].country_id;  
    await client.query('INSERT INTO content_country(content_id, country_id, role) VALUES ($1, $2, $3)', [contentId, countryId, 'production']);  
  
    for (const g of genres) {  
      let genreResult = await client.query('SELECT genre_id FROM genre WHERE name = $1', [g]);  
      if (genreResult.rows.length === 0) {  
        genreResult = await client.query('INSERT INTO genre(name) VALUES ($1) RETURNING genre_id', [g]);  
      }  
      await client.query('INSERT INTO content_genre(content_id, genre_id) VALUES ($1, $2)', [contentId, genreResult.rows[0].genre_id]);  
    }  
  
    for (const awardName of awards) {  
      const awardResult = await client.query('SELECT award_id FROM award WHERE name = $1', [awardName]);  
      if (awardResult.rows.length > 0) {  
        await client.query('INSERT INTO content_award(content_id, award_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contentId, awardResult.rows[0].award_id]);  
      }  
    }  
  
    const addRoleLink = async (name, roleName) => {  
      // Check if celebrity exists (this should always pass now due to validation)  
      const celebRes = await client.query('SELECT celebrity_id FROM celebrity WHERE name = $1', [name]);  
      if (celebRes.rows.length === 0) {  
        console.log(`⚠️ Celebrity "${name}" not found in database. This should not happen after validation.`);  
        return;  
      }  
      const celebrityId = celebRes.rows[0].celebrity_id;  
      
      // Get or create role  
      let roleRes = await client.query('SELECT role_id FROM role WHERE name = $1', [roleName]);  
      if (roleRes.rows.length === 0) {  
        roleRes = await client.query('INSERT INTO role(name) VALUES ($1) RETURNING role_id', [roleName]);  
      }  
      const roleId = roleRes.rows[0].role_id;  
      
      // Get celebrity_role (should exist now due to validation, but check anyway)  
      let celebRoleRes = await client.query('SELECT celebrity_role_id FROM celebrity_role WHERE celebrity_id = $1 AND role_id = $2', [celebrityId, roleId]);  
      if (celebRoleRes.rows.length === 0) {  
        // This should rarely happen now, but create it as backup  
        celebRoleRes = await client.query('INSERT INTO celebrity_role(celebrity_id, role_id) VALUES ($1, $2) RETURNING celebrity_role_id', [celebrityId, roleId]);  
        console.log(`✅ Created missing role "${roleName}" for celebrity "${name}"`);  
      }  
      const celebRoleId = celebRoleRes.rows[0].celebrity_role_id;  
      
      // Link celebrity role to content  
      await client.query('INSERT INTO celebrity_role_content(celebrity_role_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [celebRoleId, contentId]);  
      console.log(`✅ Linked "${name}" as "${roleName}" to content`);  
    };    
  
    for (const d of directors) await addRoleLink(d, 'Director');  
    for (const a of top_cast) await addRoleLink(a, 'Actor');  
  
    // 6. Insert seasons  
    for (const season of seasons) {  
      await client.query(  
        `INSERT INTO season (series_id, season_number, season_name, description, episode_count, release_date, trailer_url)  
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,  
        [contentId, season.season_number, season.season_name, season.description,   
         season.episode_count, season.release_date, season.trailer_url]  
      );  
    }  
  
    await client.query('COMMIT');  
    res.status(201).json({ message: 'Series added successfully', content_id: contentId });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('❌ Error inserting series:', err);  
    res.status(500).json({ error: 'Failed to insert series' });  
  } finally {  
    client.release();  
  }  
});  



// Search content  
app.get('/api/search/content', async (req, res) => {  
  const { q } = req.query;  
  try {  
    const result = await pool.query(`  
      SELECT content_id AS id, title, release_date, poster_url as poster, views, type  
      FROM content   
      WHERE title ILIKE $1   
      ORDER BY content_id DESC  
    `, [`%${q}%`]);  
    res.json(result.rows);  
  } catch (err) {  
    console.error('Error searching content:', err);  
    res.status(500).json({ error: 'Failed to search content' });  
  }  
});  
  
// Search celebrities  
app.get('/api/search/celebrities', async (req, res) => {  
  const { q } = req.query;  
  try {  
    const result = await pool.query(`  
      SELECT celebrity_id AS id, name, photo_url, gender, bio  
      FROM celebrity   
      WHERE name ILIKE $1   
      ORDER BY celebrity_id DESC  
    `, [`%${q}%`]);  
    res.json(result.rows);  
  } catch (err) {  
    console.error('Error searching celebrities:', err);  
    res.status(500).json({ error: 'Failed to search celebrities' });  
  }  
});  
  
// Search awards  
app.get('/api/search/awards', async (req, res) => {  
  const { q } = req.query;  
  try {  
    const result = await pool.query(`  
      SELECT award_id AS id, name, year, type  
      FROM award   
      WHERE name ILIKE $1   
      ORDER BY award_id DESC  
    `, [`%${q}%`]);  
    res.json(result.rows);  
  } catch (err) {  
    console.error('Error searching awards:', err);  
    res.status(500).json({ error: 'Failed to search awards' });  
  }  
});  


// Validate celebrities and their roles before adding content  
app.post('/api/validate-celebrities', async (req, res) => {  
  const { directors, top_cast } = req.body;  
    
  const client = await pool.connect();  
    
  try {  
    await client.query('BEGIN');  
      
    const missingCelebrities = [];  
    const rolesCreated = [];  
      
    // Check directors  
    for (const directorName of directors) {  
      const celebRes = await client.query('SELECT celebrity_id FROM celebrity WHERE name = $1', [directorName]);  
      if (celebRes.rows.length === 0) {  
        missingCelebrities.push({ name: directorName, role: 'Director' });  
      } else {  
        const celebrityId = celebRes.rows[0].celebrity_id;  
          
        // Check if celebrity has Director role  
        const roleCheck = await client.query(`  
          SELECT cr.celebrity_role_id   
          FROM celebrity_role cr   
          JOIN role r ON cr.role_id = r.role_id   
          WHERE cr.celebrity_id = $1 AND r.name = 'Director'  
        `, [celebrityId]);  
          
        if (roleCheck.rows.length === 0) {  
          // Get or create Director role  
          let roleRes = await client.query('SELECT role_id FROM role WHERE name = $1', ['Director']);  
          if (roleRes.rows.length === 0) {  
            roleRes = await client.query('INSERT INTO role(name) VALUES ($1) RETURNING role_id', ['Director']);  
          }  
          const roleId = roleRes.rows[0].role_id;  
            
          // Create celebrity_role entry  
          await client.query('INSERT INTO celebrity_role(celebrity_id, role_id) VALUES ($1, $2)', [celebrityId, roleId]);  
          rolesCreated.push({ name: directorName, role: 'Director' });  
        }  
      }  
    }  
      
    // Check actors  
    for (const actorName of top_cast) {  
      const celebRes = await client.query('SELECT celebrity_id FROM celebrity WHERE name = $1', [actorName]);  
      if (celebRes.rows.length === 0) {  
        missingCelebrities.push({ name: actorName, role: 'Actor' });  
      } else {  
        const celebrityId = celebRes.rows[0].celebrity_id;  
          
        // Check if celebrity has Actor role  
        const roleCheck = await client.query(`  
          SELECT cr.celebrity_role_id   
          FROM celebrity_role cr   
          JOIN role r ON cr.role_id = r.role_id   
          WHERE cr.celebrity_id = $1 AND r.name = 'Actor'  
        `, [celebrityId]);  
          
        if (roleCheck.rows.length === 0) {  
          // Get or create Actor role  
          let roleRes = await client.query('SELECT role_id FROM role WHERE name = $1', ['Actor']);  
          if (roleRes.rows.length === 0) {  
            roleRes = await client.query('INSERT INTO role(name) VALUES ($1) RETURNING role_id', ['Actor']);  
          }  
          const roleId = roleRes.rows[0].role_id;  
            
          // Create celebrity_role entry  
          await client.query('INSERT INTO celebrity_role(celebrity_id, role_id) VALUES ($1, $2)', [celebrityId, roleId]);  
          rolesCreated.push({ name: actorName, role: 'Actor' });  
        }  
      }  
    }  
      
    await client.query('COMMIT');  
    res.json({ missingCelebrities, rolesCreated });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('Error validating celebrities:', err);  
    res.status(500).json({ error: 'Failed to validate celebrities' });  
  } finally {  
    client.release();  
  }  
});  

// Get celebrity movies  
// Get celebrity movies  
app.get('/api/celebrities/:id/movies', async (req, res) => {  
  const { id } = req.params;  
  try {  
    console.log(`Fetching movies for celebrity ID: ${id}`);  
      
    const result = await pool.query(`  
      SELECT DISTINCT  
        c.content_id AS id,  
        c.title,  
        c.poster_url,  
        EXTRACT(YEAR FROM c.release_date) as year,  
        c.type,  
        c.release_date  
      FROM content c  
      INNER JOIN celebrity_role_content crc ON c.content_id = crc.content_id  
      INNER JOIN celebrity_role cr ON crc.celebrity_role_id = cr.celebrity_role_id  
      WHERE cr.celebrity_id = $1  
      ORDER BY c.release_date DESC NULLS LAST  
    `, [id]);  
  
    console.log(`Found ${result.rows.length} movies for celebrity ${id}`);  
    res.json(result.rows);  
  } catch (err) {  
    console.error("Error fetching celebrity movies:", err);  
    res.status(500).json({ error: "Server error", details: err.message });  
  }  
});  
  
// Get celebrity awards  
app.get('/api/celebrities/:id/awards', async (req, res) => {  
  const { id } = req.params;  
  try {  
    console.log(`Fetching awards for celebrity ID: ${id}`);  
      
    const result = await pool.query(`  
      SELECT   
        a.award_id AS id,  
        a.name,  
        a.year,  
        a.type  
      FROM award a  
      INNER JOIN celebrity_award ca ON a.award_id = ca.award_id  
      WHERE ca.celebrity_id = $1  
      ORDER BY a.year DESC NULLS LAST  
    `, [id]);  
  
    console.log(`Found ${result.rows.length} awards for celebrity ${id}`);  
    res.json(result.rows);  
  } catch (err) {  
    console.error("Error fetching celebrity awards:", err);  
    res.status(500).json({ error: "Server error", details: err.message });  
  }  
});  


// Add celebrity to user favourites  
app.post("/user-fav-celeb", async (req, res) => {  
  const { registered_user_id, celebrity_id } = req.body;  
  
  try {  
    // If registered_user_id is actually user_id, convert it  
    let actualRegisteredUserId = registered_user_id;  
      
    // Check if the passed ID is user_id instead of registered_user_id  
    if (registered_user_id) {  
      const userCheck = await pool.query(  
        "SELECT registered_user_id FROM registered_user WHERE user_id = $1",  
        [registered_user_id]  
      );  
        
      if (userCheck.rows.length > 0) {  
        actualRegisteredUserId = userCheck.rows[0].registered_user_id;  
      } else {  
        // Maybe it's already registered_user_id, check if it exists  
        const regUserCheck = await pool.query(  
          "SELECT registered_user_id FROM registered_user WHERE registered_user_id = $1",  
          [registered_user_id]  
        );  
          
        if (regUserCheck.rows.length === 0) {  
          return res.status(404).json({ error: "User not found" });  
        }  
      }  
    }  
  
    // Check if celebrity exists  
    const celebCheck = await pool.query(  
      "SELECT celebrity_id FROM celebrity WHERE celebrity_id = $1",  
      [celebrity_id]  
    );  
  
    if (celebCheck.rows.length === 0) {  
      return res.status(404).json({ error: "Celebrity not found" });  
    }  
  
    // Check if already in favourites  
    const existingFav = await pool.query(  
      "SELECT * FROM user_fav_celeb WHERE registered_user_id = $1 AND celebrity_id = $2",  
      [actualRegisteredUserId, celebrity_id]  
    );  
  
    if (existingFav.rows.length > 0) {  
      return res.status(400).json({ error: "Celebrity already in favourites" });  
    }  
  
    // Add to favourites  
    await pool.query(  
      "INSERT INTO user_fav_celeb (registered_user_id, celebrity_id) VALUES ($1, $2)",  
      [actualRegisteredUserId, celebrity_id]  
    );  
  
    res.status(201).json({ message: "Celebrity added to favourites successfully" });  
  } catch (err) {  
    console.error("Error adding celebrity to favourites:", err);  
    res.status(500).json({ error: "Server error" });  
  }  
}); 
  
// Get user's favourite celebrities  
app.get("/user-fav-celeb/:userId", async (req, res) => {  
  const { userId } = req.params;  
  
  try {  
    // Get registered_user_id from user_id  
    const userCheck = await pool.query(  
      "SELECT registered_user_id FROM registered_user WHERE user_id = $1",  
      [userId]  
    );  
  
    if (userCheck.rows.length === 0) {  
      return res.status(404).json({ error: "Registered user not found" });  
    }  
  
    const registeredUserId = userCheck.rows[0].registered_user_id;  
  
    const result = await pool.query(`  
      SELECT   
        c.celebrity_id,  
        c.name,  
        c.bio,  
        c.birth_date,  
        c.photo_url,  
        c.place_of_birth,  
        c.gender,  
        ufc.added_at  
      FROM user_fav_celeb ufc  
      INNER JOIN celebrity c ON ufc.celebrity_id = c.celebrity_id  
      WHERE ufc.registered_user_id = $1  
      ORDER BY ufc.added_at DESC  
    `, [registeredUserId]);  
  
    res.json(result.rows);  
  } catch (err) {  
    console.error("Error fetching favourite celebrities:", err);  
    res.status(500).json({ error: "Server error" });  
  }  
});  
  
// Remove celebrity from user favourites  
app.delete("/user-fav-celeb/:userId/:celebrityId", async (req, res) => {  
  const { userId, celebrityId } = req.params;  
  
  try {  
    // Get registered_user_id from user_id  
    const userCheck = await pool.query(  
      "SELECT registered_user_id FROM registered_user WHERE user_id = $1",  
      [userId]  
    );  
  
    if (userCheck.rows.length === 0) {  
      return res.status(404).json({ error: "Registered user not found" });  
    }  
  
    const registeredUserId = userCheck.rows[0].registered_user_id;  
  
    // Remove from favourites  
    const result = await pool.query(  
      "DELETE FROM user_fav_celeb WHERE registered_user_id = $1 AND celebrity_id = $2",  
      [registeredUserId, celebrityId]  
    );  
  
    if (result.rowCount === 0) {  
      return res.status(404).json({ error: "Celebrity not found in favourites" });  
    }  
  
    res.json({ message: "Celebrity removed from favourites successfully" });  
  } catch (err) {  
    console.error("Error removing celebrity from favourites:", err);  
    res.status(500).json({ error: "Server error" });  
  }  
}); 


app.get('/api/celebrities/:id/related', async (req, res) => {  
  const { id } = req.params;  
  try {  
    const result = await pool.query(`  
      SELECT DISTINCT   
        c2.celebrity_id,  
        c2.name,  
        c2.photo_url,  
        COUNT(DISTINCT co.content_id) as common_movies  
      FROM celebrity c1  
      INNER JOIN celebrity_role cr1 ON c1.celebrity_id = cr1.celebrity_id  
      INNER JOIN celebrity_role_content crc1 ON cr1.celebrity_role_id = crc1.celebrity_role_id  
      INNER JOIN content co ON crc1.content_id = co.content_id  
      INNER JOIN celebrity_role_content crc2 ON co.content_id = crc2.content_id  
      INNER JOIN celebrity_role cr2 ON crc2.celebrity_role_id = cr2.celebrity_role_id  
      INNER JOIN celebrity c2 ON cr2.celebrity_id = c2.celebrity_id  
      WHERE c1.celebrity_id = $1 AND c2.celebrity_id != $1  
      GROUP BY c2.celebrity_id, c2.name, c2.photo_url  
      HAVING COUNT(DISTINCT co.content_id) > 0  
      ORDER BY common_movies DESC  
      LIMIT 10  
    `, [id]);  
  
    res.json(result.rows);  
  } catch (err) {  
    console.error("Error fetching related celebrities:", err);  
    res.status(500).json({ error: "Server error" });  
  }  
});  














//end hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee



app.listen(5000, () => {
  console.log("Server has started on port 5000");
});