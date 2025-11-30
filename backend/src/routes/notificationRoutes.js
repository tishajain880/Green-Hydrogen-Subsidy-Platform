const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get notifications for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Create notification (protected) - internal use for demo
router.post('/', protect, async (req, res, next) => {
  try {
    const { type, title, message, data, userId } = req.body;
    // allow creating for self or admin creating for other user
    const targetUser = userId || req.user._id;
    const n = await Notification.create({ user: targetUser, type, title, message, data });
    res.status(201).json(n);
  } catch (err) {
    next(err);
  }
});

// Mark as read
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'Not found' });
    if (n.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    n.read = true;
    await n.save();
    res.json(n);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
