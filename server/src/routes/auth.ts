import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'forgepilot_super_secret_key_123';

// 1. Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All signup fields are required.' });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email.toLowerCase(), passwordHash]
    );
    const newUser = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { name: newUser.name, email: newUser.email }
    });
  } catch (err: any) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Database transaction failed during signup.' });
  }
});

// 2. Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email credentials.' });
    }

    const user = result.rows[0];

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (err: any) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Database transaction failed during login.' });
  }
});

// 3. Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (checkUser.rows.length === 0) {
      return res.status(400).json({ error: 'No user registered with this email address.' });
    }

    // Generate a temporary password for local testing convenience
    const tempPassword = `temp_${Math.floor(100000 + Math.random() * 900000)}`;
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(tempPassword, salt);

    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, email.toLowerCase()]);

    console.log(`[PASSWORD RESET] Temporary password for ${email}: ${tempPassword}`);

    res.status(200).json({
      message: 'Temporary password generated and logged.',
      tempPassword // Return directly for offline testing convenience
    });
  } catch (err: any) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ error: 'Database transaction failed during password reset.' });
  }
});

export default router;
