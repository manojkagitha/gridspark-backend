const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Our promise-based pool
const router = express.Router();

// Signup route updated with new fields
router.post('/register', async (req, res) => {
  // Destructure all fields from the request body
  const { firstName, lastName, email, password, phone } = req.body;

  // --- Updated Validation ---
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    // --- Updated SQL Query ---
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // The 'phone' field will be null if not provided, which is allowed by the database
    await db.query(sql, [firstName, lastName, email, hashed, phone || null]);

    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error(error); // Log the actual error on the server
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login route (no changes needed here)
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
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

module.exports = router;
