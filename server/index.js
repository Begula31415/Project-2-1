const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body


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

    // Insert into users
    const newUser = await pool.query(
      `INSERT INTO users 
      (name, created_at, email, username, password_hash, bio, birth_date, location, role)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id`,
      [name, email, username, password_hash, bio, birth_date, location, role]
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
  const { username, password_hash, role } = req.body;

  try {
    // Find user by username and password
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password_hash = $2 AND role = $3",
      [username, password_hash, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }

    const user = userResult.rows[0];

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



app.listen(5000, () => {
  console.log("Server has started on port 5000");
});