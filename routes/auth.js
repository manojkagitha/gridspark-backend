const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Our promise-based pool
const router = express.Router();

// Signup route using full async/await
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // 2. Insert the new user into the database
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    await db.query(sql, [email, hashed]);

    // 3. Send a success response
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    // This will catch errors from both bcrypt and the database query
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    // For any other errors
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login route (also refactored for consistency)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    res.json({ message: 'Login successful!' });

  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

module.exports = router;
