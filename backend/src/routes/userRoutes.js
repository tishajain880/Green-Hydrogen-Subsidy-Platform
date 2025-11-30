const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users?role=PRODUCER
// Returns users filtered by role. Allowed for admin and GOV roles.
router.get('/', protect, async (req, res, next) => {
  try {
    const role = req.query.role;
    // authorize: only admin or GOV may list users
    if (req.user.role !== 'admin' && req.user.role !== 'GOV') return res.status(403).json({ message: 'Forbidden' });

    const q = {};
    if (role) q.role = role;

    const users = await User.find(q).select('name email role organization walletAddress');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
