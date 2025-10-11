const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Our promise-based pool
const router = express.Router();

// Production-ready CORS for frontend on www domain
const cors = require('cors');
router.use(cors({
  origin: 'https://www.gridsparksolutions.com',
  credentials: true,
}));

// Signup route - registration endpoint
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Strong server-side validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
  }
  // Phone optional, but add email format check (basic)
  if (!email.match(/^[\w.-]+@[\w.-]+\.\w+$/)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [firstName, lastName, email, hashed, phone || null]);
    // Log registrations (for audit)
    console.log(`New user registered: ${email} (${firstName} ${lastName})`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error('Registration error:', error); // Improved server logging
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login route - authentication endpoint
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
    console.log(`Login: ${email}`);
    res.json({ message: 'Login successful!' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

module.exports = router;
