const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Load environment variables (JWT_SECRET)
require("dotenv").config();

// Use the JWT secret key from .env
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Confirm the route file is loaded
console.log("✅ auth.js has been loaded!");

// ✅ Dummy test route to confirm file is working
router.get("/test-auth", (req, res) => {
  res.send("auth.js is working!");
});

// ✅ Register route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (userCheck.rows.length > 0)
      return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);

    res.send("User registered successfully!");
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).send("Registration failed");
  }
});

// ✅ Login route (now issues JWT token)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(401).send("Invalid username");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid password");

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful!",
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Login failed");
  }
});

module.exports = router;
