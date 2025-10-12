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

// Signup route - registration endpoint (UPDATED)
router.post('/register', async (req, res) => {
  // Accepts a single `fullName` from the frontend
  const { fullName, email, password, phone } = req.body;

  // --- FIX 1: Split fullName into firstName and lastName ---
  const nameParts = fullName ? fullName.trim().split(' ') : [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // --- Updated Validation ---
  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }
  if (!email.match(/^[\w.-]+@[\w.-]+\.\w+$/)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  // --- FIX 2: Enforce Strong Password Complexity on the Backend ---
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    // Use the new firstName and lastName variables from the split fullName
    await db.query(sql, [firstName, lastName, email, hashed, phone || null]);
    
    console.log(`New user registered: ${email} (${firstName} ${lastName})`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login route - authentication endpoint (No changes needed)
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
