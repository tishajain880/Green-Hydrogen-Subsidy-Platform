const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// Get audit logs - only admin or GOV
router.get('/', protect, async (req, res, next) => {
  try {
    if (!(req.user.role === 'admin' || req.user.role === 'GOV')) return res.status(403).json({ message: 'Forbidden' });
    const logs = await AuditLog.find().populate('performedBy project submission').sort({ createdAt: -1 }).limit(500);
    res.json(logs);
  } catch (err) { next(err); }
});

module.exports = router;
