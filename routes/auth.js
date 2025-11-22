const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const pool = require('../config/db');
const { generateCaptcha, verifyCaptcha } = require('../utils/captchaStore');

const router = express.Router();

router.get('/captcha', (req, res) => {
  const captcha = generateCaptcha();
  res.json({
    token: captcha.token,
    text: captcha.text,
    expiresAt: captcha.expiresAt
  });
});

router.post('/register', async (req, res) => {
  const { fullName, username, email, phone, password, captchaToken, captchaText } = req.body;

  if (!verifyCaptcha(captchaToken, captchaText)) {
    return res.status(400).json({ message: 'Invalid CAPTCHA' });
  }

  if (!fullName || !username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!validator.isMobilePhone(phone + '', 'any')) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // PostgreSQL version
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    await pool.query(
      `INSERT INTO users (full_name, username, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fullName, username, email, phone, hashedPassword, 'customer']
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, username, email, password_hash, role, full_name 
       FROM users 
       WHERE email = $1 OR username = $1 
       LIMIT 1`,
      [usernameOrEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.full_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to log in' });
  }
});

module.exports = router;
