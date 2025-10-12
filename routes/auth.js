const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Promise-based pool
const router = express.Router();
const cors = require('cors');

// === CORS for frontend ===
router.use(cors({
  origin: 'https://www.gridsparksolutions.com',
  credentials: true,
}));

// ======================================================
// USER REGISTRATION
// ======================================================
router.post('/register', async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  // Split fullName into first/last name
  const nameParts = fullName ? fullName.trim().split(' ') : [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // === Validation ===
  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  // Strong password enforcement
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.',
    });
  }

  try {
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user into DB
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, phone)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [firstName, lastName, email, hashed, phone || null]);

    console.log(`✅ New user registered: ${email} (${firstName} ${lastName})`);
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error('❌ Registration error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
