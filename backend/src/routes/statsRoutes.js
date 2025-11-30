const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Project = require("../models/Project");
const User = require("../models/User");
const MilestoneSubmission = require("../models/MilestoneSubmission");

// GET /api/stats
// Returns aggregated counts for dashboards
router.get("/", protect, async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const approvedProjects = await Project.countDocuments({
      status: "approved",
    });
    const producersCount = await User.countDocuments({ role: "PRODUCER" });
    const settledSubmissions = await MilestoneSubmission.countDocuments({
      settled: true,
    });

    res.json({
      totalProjects,
      approvedProjects,
      producersCount,
      settledSubmissions,
      time: new Date(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
