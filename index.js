require("dotenv").config();
const express = require("express");
const path = require("path");
const pool = require("./db"); // PostgreSQL connection
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Confirm DB connection on server start
(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", result.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
})();

// Routes
app.get("/", (req, res) => {
  res.send("LinkedIn Clone Backend is running!");
});

app.use("/", authRoutes);

app.get("/protected", authenticateToken, (req, res) => {
  res.send(`Hello, ${req.user.username}. This is a protected route!`);
});

app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT username FROM users WHERE username = $1",
      [username],
    );

    if (rows.length === 0) return res.status(404).send("User not found");

    res.json(rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).send("Failed to fetch profile");
  }
});

app.put("/profile/:username", async (req, res) => {
  const { username } = req.params;
  const { bio, title } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE users SET bio = $1, title = $2 WHERE username = $3 RETURNING username, bio, title",
      [bio, title, username],
    );

    if (rows.length === 0) return res.status(404).send("User not found");

    res.json(rows[0]);
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).send("Failed to update profile");
  }
});

// Test route for user list
app.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT username FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).send("Failed to fetch users");
  }
});

// Server start
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
