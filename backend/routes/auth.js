const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    // Check if user already exists
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedName = email.split('@')[0]; // Generate a name based on the email

    // Insert new user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [generatedName, email, hashedPassword]
    );

    res.status(211).json({ message: 'User registered successfully!', user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// LOGIN ROUTE (UPDATED FOR DUAL-TOKEN CONFIGURATION)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    // Check for user existence
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Track last login timestamp
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // -------------------------------------------------------------
    // INDUSTRY SOLUTION: Generate BOTH Tokens (Phase 6)
    // -------------------------------------------------------------
    // 1. Include the 'role' column inside your short-lived access token signature payload
    const accessToken = jwt.sign(
      { id: user.id, role: user.role || 'user' }, // Added user.role here
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 2. Include it inside your backup long-lived refresh token signature payload
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role || 'user' }, // Added user.role here
      process.env.JWT_SECRET + "_REFRESH",
      { expiresIn: '30d' }
    );

    // 3. Commit Refresh Token row entry to your PostgreSQL tracking table
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    );
    // -------------------------------------------------------------

    // Send the dual-token keys to your React local storage handler
    res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
      message: 'Login successful!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// REFRESH TOKEN GATEWAY (NEW ENDPOINT FOR PHASE 6)
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Session recovery key missing.' });
  }

  try {
    // Check if token exists in the database
    const tokenCheck = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
    if (tokenCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Session key unrecognized or revoked.' });
    }

    // Verify token validity
    jwt.verify(refreshToken, process.env.JWT_SECRET + "_REFRESH", (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Session signature validation failed.' });
      }

      // Generate a new 15-minute Access Token
      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error parsing recovery tokens.' });
  }
});

// LOGOUT ROUTE (NEW ENDPOINT FOR PHASE 6)
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    res.json({ message: 'Session successfully revoked.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error dropping user session tokens.' });
  }
});

// FORGOT PASSWORD ROUTE
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please enter your email.' });

  try {
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Email not found.' });
    const user = userResult.rows[0];

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    console.log(`\n🔑 --- iSOFTZONE RESET TOKEN GENERATED ---`);
    console.log(`URL: http://localhost:3000/reset-password?token=${token}`);
    console.log(`-------------------------------------------\n`);

    res.json({ message: 'Reset instructions dispatched to terminal node console.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error generating token.' });
  }
});

// RESET PASSWORD ROUTE
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Missing parameter data.' });

  try {
    const resetResult = await db.query('SELECT * FROM password_reset WHERE token = $1', [token]);
    if (resetResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or missing token.' });
    const record = resetResult.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: 'Token expired. 15-minute window is closed.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, record.user_id]);
    await db.query('DELETE FROM password_reset WHERE token = $1', [token]);

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating password.' });
  }
});

module.exports = router;