const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db'); // PostgreSQL connection from db.js

const app = express();
app.use(express.json());

// ✅ Test DB connection on startup
(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL at:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  }
})();

// ✅ Home route
app.get('/', (req, res) => {
  res.send('LinkedIn Clone Backend is running!');
});

// ✅ Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userCheck.rows.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.send('User registered successfully!');
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Registration failed');
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).send('Invalid username');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid password');
    }

    res.send('Login successful!');
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Login failed');
  }
});

// ✅ Optional: View all users (for testing only — remove in production)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT username FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Failed to fetch users');
  }
});

// ✅ Start server
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
