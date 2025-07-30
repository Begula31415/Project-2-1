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
        COALESCE(
          (SELECT url FROM image WHERE celebrity_id = c.celebrity_id ORDER BY created_at DESC LIMIT 1),
          c.photo_url
        ) as photo,
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


// app.delete("/watchlist", async (req, res) => {
//   const { userId, movieId } = req.body;

//   try {
//     await pool.query(
//       "DELETE FROM wishlist WHERE user_id = $1 AND movie_id = $2",
//       [userId, movieId]
//     );

//     res.status(200).json({ message: "Movie removed from watchlist" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error" );
//   }
// });


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
        COALESCE(
          (SELECT url FROM image WHERE celebrity_id = c.celebrity_id ORDER BY created_at DESC LIMIT 1),
          c.photo_url
        ) as photo_url,
        c.gender,
        c.bio,
        ARRAY_AGG(r.name) AS roles
      FROM celebrity c
      LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      LEFT JOIN role r ON cr.role_id = r.role_id
      GROUP BY c.celebrity_id, c.name, c.photo_url, c.gender, c.bio
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

   await client.query('COMMIT');  
console.log('✅ Transaction committed');  
res.status(201).json({   
  message: 'Content added successfully',   
  content_id: contentId,  
  success: true   
}); 
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
        COALESCE(
          (SELECT url FROM image WHERE celebrity_id = c.celebrity_id ORDER BY created_at DESC LIMIT 1),
          c.photo_url
        ) as photo_url,
        ARRAY_AGG(r.name) AS roles
      FROM celebrity c
      LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      LEFT JOIN role r ON cr.role_id = r.role_id
      WHERE c.celebrity_id = $1
      GROUP BY c.celebrity_id, c.name, c.bio, c.birth_date, c.death_date, c.place_of_birth, c.gender, c.photo_url
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
  
res.status(201).json({   
  message: 'Celebrity added successfully',   
  celebrity_id: celebrityId,  
  success: true   
}); 
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



// app.delete('/watchlist/:userId/:contentId', async (req, res) => {
//   const { userId, contentId } = req.params;
//   try {
//     await pool.query(
//       'DELETE FROM wishlist WHERE user_id = $1 AND content_id = $2',
//       [userId, contentId]
//     );
//     res.json({ message: 'Content removed from watchlist' });
//   } catch (err) {
//     console.error('Error removing from watchlist:', err.message);
//     res.status(500).json({ error: 'Failed to remove content' });
//     console.log('Error nnnnnnnn nnnn details:', err);
//   }
// });



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
  
   for (const season of seasons) {  
      const seasonResult = await client.query(`  
        INSERT INTO season (series_id, season_number, season_name, description, episode_count, release_date, trailer_url, poster_url)  
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)  
        RETURNING season_id  
      `, [contentId, season.season_number, season.season_name, season.description,  
          season.episode_count, season.release_date, season.trailer_url, season.poster_url]);  
  
      const seasonId = seasonResult.rows[0].season_id;  
  
      // Insert episodes if they exist  
      if (season.episodes && season.episodes.length > 0) {  
        for (const episode of season.episodes) {  
          await client.query(`  
            INSERT INTO episode (season_id, episode_number, title, duration, release_date)  
            VALUES ($1, $2, $3, $4, $5)  
          `, [seasonId, episode.episode_number, episode.title, episode.duration, episode.release_date]);  
        }  
      }  
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
      SELECT 
        celebrity_id AS id, 
        name, 
        COALESCE(
          (SELECT url FROM image WHERE celebrity_id = celebrity.celebrity_id ORDER BY created_at DESC LIMIT 1),
          photo_url
        ) as photo_url, 
        gender, 
        bio  
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
        created_at as uploaded_at
      FROM image 
      WHERE content_id = $1
      ORDER BY created_at DESC
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
        COALESCE(
          (SELECT url FROM image WHERE celebrity_id = c.celebrity_id ORDER BY created_at DESC LIMIT 1),
          c.photo_url
        ) as photo_url,
        c.bio,
        STRING_AGG(r.name, ', ' ORDER BY r.name) as roles
      FROM celebrity c
      JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
      JOIN role r ON cr.role_id = r.role_id
      JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
      WHERE crc.content_id = $1
      GROUP BY c.celebrity_id, c.name, c.photo_url, c.bio
      ORDER BY c.name
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

// In-memory store for guest view tracking (use Redis in production)
const guestViewStore = new Map();

// Clean up old guest view entries (older than 12 hours)
const cleanupGuestViews = () => {
  const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
  for (const [key, timestamp] of guestViewStore.entries()) {
    if (timestamp < twelveHoursAgo) {
      guestViewStore.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupGuestViews, 60 * 60 * 1000);

// ==================== VIEW TRACKING ENDPOINTS START ====================

// Track content view (for page visits)
app.post("/content/:id/view", async (req, res) => {
  const contentId = req.params.id;
  const { user_id } = req.body;
  const sessionId = req.headers['x-session-id'] || req.ip; // Use session ID or IP as fallback

  console.log('=== VIEW TRACKING DEBUG ===');
  console.log('Content ID:', contentId);
  console.log('User ID:', user_id);
  console.log('Session ID:', sessionId);
  console.log('Request body:', req.body);
  console.log('Request headers x-session-id:', req.headers['x-session-id']);

  try {
    // Check if this is a valid content
    const contentCheck = await pool.query(
      "SELECT content_id FROM content WHERE content_id = $1",
      [contentId]
    );

    if (contentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    if (user_id) {
      // For authenticated users, we need to get the registered_user_id from user_id
      const registeredUserResult = await pool.query(`
        SELECT registered_user_id FROM registered_user WHERE user_id = $1
      `, [user_id]);

      if (registeredUserResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User not found in registered users"
        });
      }

      const registered_user_id = registeredUserResult.rows[0].registered_user_id;
      console.log('Found registered_user_id:', registered_user_id, 'for user_id:', user_id);

      // Check if user has viewed this content in the last 12 hours
      const recentView = await pool.query(`
        SELECT view_id FROM content_views 
        WHERE registered_user_id = $1 AND content_id = $2 AND when_viewed > $3
        ORDER BY when_viewed DESC
        LIMIT 1
      `, [registered_user_id, contentId, twelveHoursAgo]);

      console.log('Recent view check result:', recentView.rows.length);

      if (recentView.rows.length === 0) {
        // Insert new view record (or update existing one)
        const insertResult = await pool.query(`
          INSERT INTO content_views (registered_user_id, content_id, when_viewed)
          VALUES ($1, $2, $3)
          ON CONFLICT (registered_user_id, content_id) 
          DO UPDATE SET when_viewed = $3
          RETURNING view_id
        `, [registered_user_id, contentId, now]);

        console.log('Insert/Update result:', insertResult.rows);

        // Increment view count in content table
        const updateResult = await pool.query(`
          UPDATE content SET views = views + 1 WHERE content_id = $1
          RETURNING views
        `, [contentId]);

        console.log('View count updated:', updateResult.rows[0]?.views);

        res.json({
          success: true,
          message: "View tracked successfully",
          counted: true
        });
      } else {
        res.json({
          success: true,
          message: "View already counted recently",
          counted: false
        });
      }
    } else {
      // For guest users (using session/IP tracking)
      const guestViewKey = `${sessionId}_${contentId}`;
      const now = Date.now();
      const lastViewTime = guestViewStore.get(guestViewKey);
      const twelveHoursAgo = now - (12 * 60 * 60 * 1000);
      
      // Check if this guest has viewed this content in the last 12 hours
      if (!lastViewTime || lastViewTime < twelveHoursAgo) {
        // Record this view
        guestViewStore.set(guestViewKey, now);
        
        // Increment view count in content table
        await pool.query(`
          UPDATE content SET views = views + 1 WHERE content_id = $1
        `, [contentId]);

        res.json({
          success: true,
          message: "Guest view tracked successfully",
          counted: true
        });
      } else {
        res.json({
          success: true,
          message: "Guest view already counted recently",
          counted: false
        });
      }
    }

  } catch (err) {
    console.error('View tracking error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to track view",
      error: err.message
    });
  }
});

// Mark content as watched (for registered users)
app.post("/content/:id/watched", async (req, res) => {
  const contentId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User authentication required"
    });
  }

  try {
    // Check if this is a valid content
    const contentCheck = await pool.query(
      "SELECT content_id FROM content WHERE content_id = $1",
      [contentId]
    );

    if (contentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    // Check if user has already marked this as watched in the last 12 hours
    const recentView = await pool.query(`
      SELECT view_id FROM content_views 
      WHERE registered_user_id = $1 AND content_id = $2 AND when_viewed > $3
      ORDER BY when_viewed DESC
      LIMIT 1
    `, [user_id, contentId, twelveHoursAgo]);

    if (recentView.rows.length === 0) {
      // Insert new view record
      await pool.query(`
        INSERT INTO content_views (registered_user_id, content_id, when_viewed)
        VALUES ($1, $2, $3)
        ON CONFLICT (registered_user_id, content_id) 
        DO UPDATE SET when_viewed = $3
      `, [user_id, contentId, now]);

      // Increment view count in content table
      await pool.query(`
        UPDATE content SET views = views + 1 WHERE content_id = $1
      `, [contentId]);

      res.json({
        success: true,
        message: "Marked as watched successfully",
        counted: true
      });
    } else {
      res.json({
        success: true,
        message: "Already marked as watched recently",
        counted: false
      });
    }

  } catch (err) {
    console.error('Mark as watched error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to mark as watched",
      error: err.message
    });
  }
});

// ==================== VIEW TRACKING ENDPOINTS END ====================

// Basic search endpoint for all categories
app.get("/search", async (req, res) => {
  const { q, category = 'all' } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ 
      success: false,
      message: "Search query is required" 
    });
  }

  try {
    let results = { movies: [], series: [], celebrities: [] };
    const searchTerm = `%${q.trim()}%`;

    if (category === 'all' || category === 'titles') {
      // Search movies
      const movieResult = await pool.query(`
        SELECT 
          c.content_id as id,
          c.title,
          c.poster_url,
          c.release_date,
          c.type,
          c.duration,
          c.views,
          EXTRACT(YEAR FROM c.release_date) as year,
          COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating,
          COUNT(r.rating_id) as rating_count
        FROM content c
        LEFT JOIN rating r ON c.content_id = r.content_id
        WHERE c.title ILIKE $1 AND c.type = 'Movie'
        GROUP BY c.content_id, c.title, c.poster_url, c.release_date, c.type, c.duration, c.views
        ORDER BY c.views DESC, average_rating DESC
        LIMIT 20
      `, [searchTerm]);

      // Search TV Series
      const seriesResult = await pool.query(`
        SELECT 
          c.content_id as id,
          c.title,
          c.poster_url,
          c.release_date,
          c.type,
          c.duration,
          c.views,
          EXTRACT(YEAR FROM c.release_date) as year,
          COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating,
          COUNT(r.rating_id) as rating_count
        FROM content c
        LEFT JOIN rating r ON c.content_id = r.content_id
        WHERE c.title ILIKE $1 AND c.type = 'Series'
        GROUP BY c.content_id, c.title, c.poster_url, c.release_date, c.type, c.duration, c.views
        ORDER BY c.views DESC, average_rating DESC
        LIMIT 20
      `, [searchTerm]);

      results.movies = movieResult.rows;
      results.series = seriesResult.rows;
    }

    if (category === 'all' || category === 'celebs') {
      // Search celebrities
      const celebrityResult = await pool.query(`
        SELECT 
          c.celebrity_id as id,
          c.name,
          c.photo_url,
          c.bio,
          c.birth_date,
          c.place_of_birth,
          COUNT(DISTINCT crc.content_id) as movie_count
        FROM celebrity c
        LEFT JOIN celebrity_role cr ON c.celebrity_id = cr.celebrity_id
        LEFT JOIN celebrity_role_content crc ON cr.celebrity_role_id = crc.celebrity_role_id
        WHERE c.name ILIKE $1
        GROUP BY c.celebrity_id, c.name, c.photo_url, c.bio, c.birth_date, c.place_of_birth
        ORDER BY movie_count DESC, c.name ASC
        LIMIT 20
      `, [searchTerm]);

      results.celebrities = celebrityResult.rows;
    }

    // Get total counts for statistics
    const totalMoviesResult = await pool.query("SELECT COUNT(*) as count FROM content WHERE type = 'Movie'");
    const totalSeriesResult = await pool.query("SELECT COUNT(*) as count FROM content WHERE type = 'Series'");
    const totalCelebritiesResult = await pool.query("SELECT COUNT(*) as count FROM celebrity");

    res.json({
      success: true,
      query: q,
      category: category,
      results: results,
      totalCounts: {
        movies: parseInt(totalMoviesResult.rows[0].count),
        series: parseInt(totalSeriesResult.rows[0].count),
        celebrities: parseInt(totalCelebritiesResult.rows[0].count)
      },
      message: 'Search completed successfully'
    });

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

// Get series details by ID
app.get('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        content_id,
        title,
        description,
        release_date,
        type,
        poster_url,
        views,
        duration
      FROM content 
      WHERE content_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get seasons for a series
app.get('/api/series/:id/seasons', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        season_id,
        season_number,
        season_name,
        description,
        episode_count,
        poster_url,
        release_date,
        trailer_url
      FROM season 
      WHERE series_id = $1
      ORDER BY season_number ASC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching seasons:', err);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Get episodes for a specific season
app.get('/api/series/:seriesId/seasons/:seasonNumber/episodes', async (req, res) => {
  const { seriesId, seasonNumber } = req.params;
  
  try {
    // First get the season_id from series_id and season_number
    const seasonResult = await pool.query(`
      SELECT season_id 
      FROM season 
      WHERE series_id = $1 AND season_number = $2
    `, [seriesId, seasonNumber]);

    if (seasonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const seasonId = seasonResult.rows[0].season_id;

    // Get episodes for this season
    const result = await pool.query(`
      SELECT 
        episode_id,
        episode_number,
        title,
        description,
        duration,
        air_date
      FROM episode 
      WHERE season_id = $1
      ORDER BY episode_number ASC
    `, [seasonId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching episodes:', err);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});



// Check if award exists  
app.get('/api/check-award-exists', async (req, res) => {  
  const { name, year } = req.query;  
  
  if (!name || !year) {  
    return res.status(400).json({ error: 'Missing required parameters' });  
  }  
  
  try {  
    const result = await pool.query(  
      'SELECT 1 FROM award WHERE name = $1 AND year = $2 LIMIT 1',  
      [name, year]  
    );  
  
    res.json({ exists: result.rows.length > 0 });  
  } catch (err) {  
    console.error('Error checking award existence:', err);  
    res.status(500).json({ error: 'Database error during award existence check' });  
  }  
});  
  
// Add Award  
app.post('/api/awards', async (req, res) => {  
  const { name, year, type } = req.body;  
  
  try {  
    const result = await pool.query(  
      'INSERT INTO award (name, year, type) VALUES ($1, $2, $3) RETURNING award_id',  
      [name, year, type]  
    );  
  
    res.status(201).json({   
      message: 'Award added successfully',   
      award_id: result.rows[0].award_id   
    });  
  } catch (err) {  
    console.error('Error adding award:', err);  
    res.status(500).json({ error: 'Failed to add award' });  
  }  
});  
  
// Update Content  
// app.put('/api/content/:id', async (req, res) => {  
//   const { id } = req.params;  
//   const {  
//     title, description, release_date, language, type, duration,  
//     poster_url, trailer_url, budget, box_office_collection,  
//     currency_code, min_age, views, country, genres,  
//     top_cast, directors, awards  
//   } = req.body;  
  
//   const client = await pool.connect();  
  
//   try {  
//     await client.query('BEGIN');  
  
//     // Update content table  
//     await client.query(`  
//       UPDATE content SET   
//         title = $1, description = $2, release_date = $3, type = $4,   
//         duration = $5, poster_url = $6, trailer_url = $7, budget = $8,   
//         box_office_collection = $9, currency_code = $10, min_age = $11, views = $12  
//       WHERE content_id = $13  
//     `, [title, description, release_date, type, duration, poster_url,   
//         trailer_url, budget, box_office_collection, currency_code, min_age, views, id]);  
  
//     await client.query('COMMIT');  
//     res.json({ message: 'Content updated successfully' });  
//   } catch (err) {  
//     await client.query('ROLLBACK');  
//     console.error('Error updating content:', err);  
//     res.status(500).json({ error: 'Failed to update content' });  
//   } finally {  
//     client.release();  
//   }  
// });  


// Update Content    
app.put('/api/content/:id', async (req, res) => {    
  const { id } = req.params;    
  const {    
    title, description, release_date, language, type, duration,    
    poster_url, trailer_url, budget, box_office_collection,    
    currency_code, min_age, views, country, genres,    
    top_cast, directors, awards    
  } = req.body;    
    
  const client = await pool.connect();    
    
  try {    
    await client.query('BEGIN');    
    
    // Update content table    
    await client.query(`    
      UPDATE content SET     
        title = $1, description = $2, release_date = $3, type = $4,     
        duration = $5, poster_url = $6, trailer_url = $7, budget = $8,     
        box_office_collection = $9, currency_code = $10, min_age = $11, views = $12    
      WHERE content_id = $13    
    `, [title, description, release_date, type, duration, poster_url,     
        trailer_url, budget, box_office_collection, currency_code, min_age, views, id]);    
  
    // Delete existing related data to prevent duplicates  
    await client.query('DELETE FROM content_country WHERE content_id = $1', [id]);  
    await client.query('DELETE FROM content_genre WHERE content_id = $1', [id]);  
    await client.query('DELETE FROM content_award WHERE content_id = $1', [id]);  
    await client.query('DELETE FROM content_language WHERE content_id = $1', [id]);  
    await client.query('DELETE FROM content_views WHERE content_id = $1', [id]);  
  
    // Handle countries  
    if (country && Array.isArray(country)) {  
      for (const countryData of country) {  
        // Get or create country  
        let countryResult = await client.query(  
          'SELECT country_id FROM country WHERE name = $1',   
          [countryData.name]  
        );  
          
        let countryId;  
        if (countryResult.rows.length === 0) {  
          const newCountry = await client.query(  
            'INSERT INTO country (name) VALUES ($1) RETURNING country_id',  
            [countryData.name]  
          );  
          countryId = newCountry.rows[0].country_id;  
        } else {  
          countryId = countryResult.rows[0].country_id;  
        }  
  
        // Insert into content_country  
        await client.query(  
          'INSERT INTO content_country (content_id, country_id, role) VALUES ($1, $2, $3)',  
          [id, countryId, countryData.role || 'production']  
        );  
      }  
    }  
  
    // Handle genres  
    if (genres && Array.isArray(genres)) {  
      for (const genreName of genres) {  
        // Get or create genre  
        let genreResult = await client.query(  
          'SELECT genre_id FROM genre WHERE name = $1',   
          [genreName]  
        );  
          
        let genreId;  
        if (genreResult.rows.length === 0) {  
          const newGenre = await client.query(  
            'INSERT INTO genre (name) VALUES ($1) RETURNING genre_id',  
            [genreName]  
          );  
          genreId = newGenre.rows[0].genre_id;  
        } else {  
          genreId = genreResult.rows[0].genre_id;  
        }  
  
        // Insert into content_genre  
        await client.query(  
          'INSERT INTO content_genre (content_id, genre_id) VALUES ($1, $2)',  
          [id, genreId]  
        );  
      }  
    }  
  
    // Handle awards  
    if (awards && Array.isArray(awards)) {  
      for (const awardData of awards) {  
        // Get or create award  
        let awardResult = await client.query(  
          'SELECT award_id FROM award WHERE name = $1 AND year = $2',   
          [awardData.name, awardData.year]  
        );  
          
        let awardId;  
        if (awardResult.rows.length === 0) {  
          const newAward = await client.query(  
            'INSERT INTO award (name, year, type) VALUES ($1, $2, $3) RETURNING award_id',  
            [awardData.name, awardData.year, awardData.type || 'General']  
          );  
          awardId = newAward.rows[0].award_id;  
        } else {  
          awardId = awardResult.rows[0].award_id;  
        }  
  
        // Insert into content_award  
        await client.query(  
          'INSERT INTO content_award (content_id, award_id) VALUES ($1, $2)',  
          [id, awardId]  
        );  
      }  
    }  
  
    // Handle languages  
    if (language && Array.isArray(language)) {  
      for (const languageData of language) {  
        // Get or create language  
        let languageResult = await client.query(  
          'SELECT language_id FROM language WHERE name = $1',   
          [languageData.name]  
        );  
          
        let languageId;  
        if (languageResult.rows.length === 0) {  
          const newLanguage = await client.query(  
            'INSERT INTO language (name) VALUES ($1) RETURNING language_id',  
            [languageData.name]  
          );  
          languageId = newLanguage.rows[0].language_id;  
        } else {  
          languageId = languageResult.rows[0].language_id;  
        }  
  
        // Insert into content_language  
        await client.query(  
          'INSERT INTO content_language (content_id, language_id, is_primary) VALUES ($1, $2, $3)',  
          [id, languageId, languageData.is_primary || false]  
        );  
      }  
    }  
  
    // Handle views (if you want to track individual user views)  
    // Note: This assumes you have user information available  
    // You might want to modify this based on your actual requirements  
    if (views && Array.isArray(views)) {  
      for (const viewData of views) {  
        await client.query(  
          'INSERT INTO content_views (registered_user_id, content_id, when_viewed) VALUES ($1, $2, $3)',  
          [viewData.registered_user_id, id, viewData.when_viewed || new Date()]  
        );  
      }  
    }  
  
    await client.query('COMMIT');  
    res.json({ message: 'Content updated successfully' });  
  } catch (err) {    
    await client.query('ROLLBACK');    
    console.error('Error updating content:', err);    
    res.status(500).json({ error: 'Failed to update content', details: err.message });    
  } finally {    
    client.release();    
  }    
});  
  
// Update Celebrity  
app.put('/api/celebrities/:id', async (req, res) => {  
  const { id } = req.params;  
  const { name, bio, birth_date, death_date, place_of_birth, gender, photo_url, profession } = req.body;  
  
  const client = await pool.connect();  
  
  try {  
    await client.query('BEGIN');  
  
    // Update celebrity  
    await client.query(`  
      UPDATE celebrity SET   
        name = $1, bio = $2, birth_date = $3, death_date = $4,   
        place_of_birth = $5, gender = $6, photo_url = $7  
      WHERE celebrity_id = $8  
    `, [name, bio, birth_date, death_date || null, place_of_birth, gender, photo_url, id]);  
  
    await client.query('COMMIT');  
    res.json({ message: 'Celebrity updated successfully' });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('Error updating celebrity:', err);  
    res.status(500).json({ error: 'Failed to update celebrity' });  
  } finally {  
    client.release();  
  }  
});  
  
// Update Award  
app.put('/api/awards/:id', async (req, res) => {  
  const { id } = req.params;  
  const { name, year, type } = req.body;  
  
  try {  
    await pool.query(  
      'UPDATE award SET name = $1, year = $2, type = $3 WHERE award_id = $4',  
      [name, year, type, id]  
    );  
  
    res.json({ message: 'Award updated successfully' });  
  } catch (err) {  
    console.error('Error updating award:', err);  
    res.status(500).json({ error: 'Failed to update award' });  
  }  
});  
  
// Delete Award (this will replace your existing deleteAwardById function)  
app.delete('/api/awards/:id', async (req, res) => {  
  const { id } = req.params;  
  
  try {  
    await pool.query('DELETE FROM award WHERE award_id = $1', [id]);  
    res.json({ message: 'Award deleted successfully' });  
  } catch (err) {  
    console.error('Error deleting award:', err);  
    res.status(500).json({ error: 'Failed to delete award' });  
  }  
});



// Add content images  
app.post('/api/content/:id/images', async (req, res) => {  
  const { id } = req.params;  
  const { imageUrls } = req.body;  
    
  const client = await pool.connect();  
    
  try {  
    await client.query('BEGIN');  
      
    // Parse comma-separated URLs  
    const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);  
      
    for (const url of urls) {  
      await client.query(  
        'INSERT INTO image (content_id, url, caption) VALUES ($1, $2, $3)',  
        [id, url, 'Additional content image']  
      );  
    }  
      
    await client.query('COMMIT');  
    res.json({ message: 'Content images added successfully' });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('Error adding content images:', err);  
    res.status(500).json({ error: 'Failed to add content images' });  
  } finally {  
    client.release();  
  }  
});  
  
// Add celebrity images  
app.post('/api/celebrities/:id/images', async (req, res) => {  
  const { id } = req.params;  
  const { imageUrls } = req.body;  
    
  const client = await pool.connect();  
    
  try {  
    await client.query('BEGIN');  
      
    // Parse comma-separated URLs  
    const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);  
      
    for (const url of urls) {  
      await client.query(  
        'INSERT INTO image (celebrity_id, url, caption) VALUES ($1, $2, $3)',  
        [id, url, 'Additional celebrity image']  
      );  
    }  
      
    await client.query('COMMIT');  
    res.json({ message: 'Celebrity images added successfully' });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('Error adding celebrity images:', err);  
    res.status(500).json({ error: 'Failed to add celebrity images' });  
  } finally {  
    client.release();  
  }  
});  
  
// Update series with seasons and episodes  
app.put('/api/series/:id', async (req, res) => {  
  const { id } = req.params;  
  const {  
    title, description, release_date, language, type, duration,  
    poster_url, trailer_url, budget, box_office_collection,  
    currency_code, min_age, views, country, genres, top_cast,  
    directors, awards, seasons, series_image_urls  
  } = req.body;  
  
  const client = await pool.connect();  
  
  try {  
    await client.query('BEGIN');  
  
    // Update content table  
    await client.query(`  
      UPDATE content SET   
        title = $1, description = $2, release_date = $3, type = $4,  
        duration = $5, poster_url = $6, trailer_url = $7, budget = $8,  
        box_office_collection = $9, currency_code = $10, min_age = $11, views = $12  
      WHERE content_id = $13  
    `, [title, description, release_date, type, duration, poster_url,  
        trailer_url, budget, box_office_collection, currency_code, min_age, views, id]);  
  
    // Delete existing seasons and episodes (cascade will handle episodes)  
    await client.query('DELETE FROM season WHERE series_id = $1', [id]);  
  
     // Insert updated seasons with episodes and poster_url  
    for (const season of seasons) {  
      const seasonResult = await client.query(`  
        INSERT INTO season (series_id, season_number, season_name, description, episode_count, release_date, trailer_url, poster_url)  
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)  
        RETURNING season_id  
      `, [id, season.season_number, season.season_name, season.description,  
          season.episode_count, season.release_date, season.trailer_url, season.poster_url]);  
  
      const seasonId = seasonResult.rows[0].season_id;  
  
      // Insert episodes if they exist  
      if (season.episodes && season.episodes.length > 0) {  
        for (const episode of season.episodes) {  
          await client.query(`  
            INSERT INTO episode (season_id, episode_number, title, duration, release_date)  
            VALUES ($1, $2, $3, $4, $5)  
          `, [seasonId, episode.episode_number, episode.title, episode.duration, episode.release_date]);  
        }  
      }  
    }
  
    // Handle additional series images  
    if (series_image_urls && series_image_urls.trim()) {  
      const urls = series_image_urls.split(',').map(url => url.trim()).filter(url => url);  
      for (const url of urls) {  
        await client.query(  
          'INSERT INTO image (content_id, url, caption) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',  
          [id, url, 'Series additional image']  
        );  
      }  
    }  
  
    await client.query('COMMIT');  
    res.json({ message: 'Series updated successfully' });  
  } catch (err) {  
    await client.query('ROLLBACK');  
    console.error('Error updating series:', err);  
    res.status(500).json({ error: 'Failed to update series' });  
  } finally {  
    client.release();  
  }  
});  


app.get('/api/series/:id', async (req, res) => {  
  const { id } = req.params;  
    
  try {  
    // Get series basic info  
    const seriesResult = await pool.query(`  
      SELECT * FROM content WHERE content_id = $1 AND type = 'Series'  
    `, [id]);  
  
    if (seriesResult.rows.length === 0) {  
      return res.status(404).json({ error: 'Series not found' });  
    }  
  
    const series = seriesResult.rows[0];  
  
    // Get seasons with poster_url  
    const seasonsResult = await pool.query(`  
      SELECT season_id, season_number, season_name, description, episode_count,   
             release_date, trailer_url, poster_url  
      FROM season   
      WHERE series_id = $1   
      ORDER BY season_number  
    `, [id]);  
  
    // Get episodes for each season  
    for (let season of seasonsResult.rows) {  
      const episodesResult = await pool.query(`  
        SELECT episode_number, title, duration, release_date  
        FROM episode   
        WHERE season_id = $1   
        ORDER BY episode_number  
      `, [season.season_id]);  
        
      season.episodes = episodesResult.rows;  
    }  
  
    series.seasons = seasonsResult.rows;  
  
    res.json(series);  
  } catch (err) {  
    console.error('Error fetching series details:', err);  
    res.status(500).json({ error: 'Failed to fetch series details' });  
  }  
}); 
  

// Get user's average rating  
app.get('/user/:userId/average-rating', async (req, res) => {  
  const { userId } = req.params;  
    
  try {  
    // First get the registered_user_id  
    const userQuery = 'SELECT registered_user_id FROM registered_user WHERE user_id = $1';  
    const userResult = await pool.query(userQuery, [userId]);  
      
    if (userResult.rows.length === 0) {  
      return res.status(404).json({ success: false, message: 'User not found' });  
    }  
      
    const registered_user_id = userResult.rows[0].registered_user_id;  
      
    // Calculate average rating for this user  
    const avgQuery = `  
      SELECT   
        ROUND(AVG(score)::numeric, 2) as average_rating,  
        COUNT(*) as total_ratings  
      FROM rating   
      WHERE registered_user_id = $1  
    `;  
      
    const avgResult = await pool.query(avgQuery, [registered_user_id]);  
      
    const averageRating = avgResult.rows[0].average_rating || 0;  
    const totalRatings = avgResult.rows[0].total_ratings || 0;  
      
    res.json({   
      success: true,   
      averageRating: parseFloat(averageRating),  
      totalRatings: parseInt(totalRatings)  
    });  
  } catch (error) {  
    console.error('Error fetching user average rating:', error);  
    res.status(500).json({ success: false, message: 'Internal server error' });  
  }  
}); 




// Add to watchlist   
app.post("/watchlist", async (req, res) => {      
  const { user_id, content_id } = req.body;      
        
  try {      
    console.log('Adding to watchlist:', { user_id, content_id });    
        
    // Validate required fields    
    if (!user_id || !content_id) {    
      return res.status(400).json({     
        success: false,     
        message: 'User ID and Content ID are required'     
      });    
    }    
    
    // Get registered_user_id      
    const userQuery = 'SELECT registered_user_id FROM registered_user WHERE user_id = $1';      
    const userResult = await pool.query(userQuery, [user_id]);      
          
    if (userResult.rows.length === 0) {      
      return res.status(404).json({     
        success: false,     
        message: 'User not found'     
      });      
    }      
          
    const registered_user_id = userResult.rows[0].registered_user_id;      
        
    // Check if content exists    
    const contentQuery = 'SELECT content_id, title FROM content WHERE content_id = $1';    
    const contentResult = await pool.query(contentQuery, [content_id]);    
        
    if (contentResult.rows.length === 0) {    
      return res.status(404).json({    
        success: false,    
        message: 'Content not found'    
      });    
    }    
          
    // Check if already in watchlist      
    const checkQuery = 'SELECT * FROM wishlist WHERE registered_user_id = $1 AND content_id = $2';      
    const checkResult = await pool.query(checkQuery, [registered_user_id, content_id]);      
          
    if (checkResult.rows.length > 0) {      
      return res.status(400).json({     
        success: false,     
        message: 'Content already in watchlist'     
      });      
    }      
          
    // Add to watchlist      
    const insertResult = await pool.query(    
      'INSERT INTO wishlist (registered_user_id, content_id) VALUES ($1, $2) RETURNING wishlist_id',     
      [registered_user_id, content_id]    
    );      
          
    res.status(201).json({     
      success: true,     
      message: 'Added to watchlist successfully',    
      wishlist_id: insertResult.rows[0].wishlist_id    
    });      
  } catch (error) {      
    console.error('Error adding to watchlist:', error);      
    res.status(500).json({     
      success: false,     
      message: 'Internal server error',    
      error: error.message     
    });      
  }      
});  
  
// Remove from watchlist - FIXED VERSION  
app.delete("/watchlist", async (req, res) => {        
  const { user_id, content_id } = req.body;        
          
  try {     
    console.log('Received request to remove from watchlist:', { user_id, content_id });      
        
    // Validate required fields    
    if (!user_id || !content_id) {    
      return res.status(400).json({     
        success: false,     
        message: 'User ID and Content ID are required'     
      });    
    }    
          
    const userQuery = 'SELECT registered_user_id FROM registered_user WHERE user_id = $1';        
    const userResult = await pool.query(userQuery, [user_id]);        
            
    if (userResult.rows.length === 0) {        
      return res.status(404).json({     
        success: false,     
        message: 'User not found'     
      });        
    }        
            
    const registered_user_id = userResult.rows[0].registered_user_id;        
    console.log('Found registered_user_id:', registered_user_id);      
            
    const result = await pool.query(    
      'DELETE FROM wishlist WHERE registered_user_id = $1 AND content_id = $2 RETURNING wishlist_id',     
      [registered_user_id, content_id]    
    );        
    console.log('Delete result:', result.rowCount);      
            
    if (result.rowCount === 0) {        
      return res.status(404).json({     
        success: false,     
        message: 'Content not found in watchlist'     
      });        
    }        
            
    res.json({     
      success: true,     
      message: 'Removed from watchlist successfully',    
      removed_wishlist_id: result.rows[0].wishlist_id    
    });        
  } catch (error) {        
    console.error('Error removing from watchlist:', error);        
    res.status(500).json({     
      success: false,     
      message: 'Internal server error',     
      error: error.message     
    });        
  }        
});  
  
// Get user's watchlist - FIXED VERSION  
app.get('/watchlist/:userId', async (req, res) => {      
  const { userId } = req.params;      
        
  try {      
    console.log('Fetching watchlist for user:', userId);    
        
    // Validate userId    
    if (!userId) {    
      return res.status(400).json({     
        success: false,     
        message: 'User ID is required',  
        watchlist: []     
      });    
    }    
    
    const userQuery = 'SELECT registered_user_id FROM registered_user WHERE user_id = $1';      
    const userResult = await pool.query(userQuery, [userId]);      
          
    if (userResult.rows.length === 0) {      
      return res.status(404).json({     
        success: false,     
        message: 'User not found',    
        watchlist: []    
      });      
    }      
          
    const registered_user_id = userResult.rows[0].registered_user_id;      
          
    const watchlistQuery = `      
      SELECT       
        w.wishlist_id,      
        c.content_id,      
        c.title,      
        c.poster_url,      
        c.release_date,      
        EXTRACT(YEAR FROM c.release_date) as release_year,      
        c.type,    
        c.description,    
        c.duration,    
        COALESCE(ROUND(AVG(r.score), 1), 0) as average_rating,    
        COUNT(r.rating_id) as rating_count    
      FROM wishlist w      
      JOIN content c ON w.content_id = c.content_id      
      LEFT JOIN rating r ON c.content_id = r.content_id    
      WHERE w.registered_user_id = $1      
      GROUP BY w.wishlist_id, c.content_id, c.title, c.poster_url, c.release_date, c.type, c.description, c.duration    
            
    `;      
          
    const result = await pool.query(watchlistQuery, [registered_user_id]);      
        
    res.json({    
      success: true,    
      message: 'Watchlist fetched successfully',    
      count: result.rows.length,    
      watchlist: result.rows    
    });    
  } catch (error) {      
    console.error('Error fetching watchlist:', error);      
    res.status(500).json({    
      success: false,    
      message: 'Internal server error',    
      error: error.message,    
      watchlist: []    
    });      
  }      
});  
  
// Check if content is in watchlist  
app.get('/watchlist/check/:userId/:contentId', async (req, res) => {    
  const { userId, contentId } = req.params;    
      
  try {    
    console.log('Checking watchlist status for:', { userId, contentId });    
        
    const userQuery = 'SELECT registered_user_id FROM registered_user WHERE user_id = $1';    
    const userResult = await pool.query(userQuery, [userId]);    
        
    if (userResult.rows.length === 0) {    
      return res.json({    
        success: false,    
        isInWatchlist: false,    
        message: 'User not found'    
      });    
    }    
        
    const registered_user_id = userResult.rows[0].registered_user_id;    
        
    const result = await pool.query(    
      'SELECT wishlist_id FROM wishlist WHERE registered_user_id = $1 AND content_id = $2',     
      [registered_user_id, contentId]    
    );    
        
    res.json({    
      success: true,    
      isInWatchlist: result.rows.length > 0,    
      message: result.rows.length > 0 ? 'Content is in watchlist' : 'Content not in watchlist'    
    });    
  } catch (error) {    
    console.error('Error checking watchlist status:', error);    
    res.json({    
      success: false,    
      isInWatchlist: false,    
      message: 'Internal server error',    
      error: error.message    
    });    
  }    
});  


app.listen(5000, () => {
  console.log("Server has started on port 5000");
});