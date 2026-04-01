const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

const User          = require('../models/User');
const Task          = require('../models/Task');
const DayCompletion = require('../models/DayCompletion');

// ── helpers ──────────────────────────────────────────────────────────────
function uid()         { return Math.random().toString(36).slice(2, 10); }
function dateStr(d)    { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function getMonday(d) {
  const dt  = new Date(d);
  const day = dt.getDay() || 7;
  if (day !== 1) dt.setDate(dt.getDate() - day + 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}


// ── POST /api/auth/signup ─────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ error: 'This email is already registered. Please log in.' });

    const user  = await User.create({ email, password });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found.' });
    res.json({ user: { id: user._id, email: user.email } });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
