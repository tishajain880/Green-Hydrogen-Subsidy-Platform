const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const MilestoneSubmission = require("../models/MilestoneSubmission");
const AuditLog = require("../models/AuditLog");
const emitter = require("../events");

const Notification = require("../models/Notification");

// Settlement endpoint - only Settlement Bank or admin can perform
router.post("/:id/settle", protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!(role === "BANK" || role === "bank" || role === "admin"))
      return res.status(403).json({ message: "Forbidden" });

    const submission = await MilestoneSubmission.findById(
      req.params.id
    ).populate("project producer");
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    if (submission.status !== "verified")
      return res.status(400).json({ message: "Submission not verified" });
    if (submission.settled)
      return res.status(400).json({ message: "Already settled" });

    // Accept optional settlementTx (on-chain) or notes
    const { settlementTx } = req.body;
    submission.settled = true;
    submission.settlementTx = settlementTx || null;
    submission.settledBy = req.user._id;
    submission.settlementAt = new Date();
    await submission.save();

    // notify producer
    try {
      await Notification.create({
        user: submission.producer._id,
        type: "disbursement",
        title: "Funds released",
        message: `Funds released for milestone ${submission.milestoneIndex} of project ${submission.project.title}.`,
        data: {
          submissionId: submission._id,
          settlementTx: submission.settlementTx,
        },
      });
    } catch (e) {}

    // create audit log for settlement
    try {
      const al = await AuditLog.create({
        action: "settlement_released",
        performedBy: req.user._id,
        role: req.user.role,
        project: submission.project._id,
        submission: submission._id,
        tx: submission.settlementTx,
        notes: req.body.notes || null,
      });
      // emit audit log created
      try {
        emitter.emit("audit_log_created", al);
      } catch (e) {}
    } catch (e) {
      console.error("AuditLog create failed", e);
    }

    // emit submission update
    try {
      emitter.emit("submission_updated", {
        action: "settled",
        submission: submission,
      });
    } catch (e) {}

    res.json({ submission });
  } catch (err) {
    next(err);
  }
});

// Get submissions - admin sees all, producer sees own
router.get("/", protect, async (req, res, next) => {
  try {
    if (
      req.user.role === "admin" ||
      req.user.role === "MILESTONE_EDITOR" ||
      req.user.role === "AUDITOR" ||
      req.user.role === "GOV"
    ) {
      const list = await MilestoneSubmission.find().populate(
        "project producer verifier"
      );
      return res.json(list);
    }
    const list = await MilestoneSubmission.find({
      producer: req.user._id,
    }).populate("project producer verifier");
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Get submissions for a project
router.get("/project/:projectId", protect, async (req, res, next) => {
  try {
    const list = await MilestoneSubmission.find({
      project: req.params.projectId,
    }).populate("project producer verifier");
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Get single submission
router.get("/:id", protect, async (req, res, next) => {
  try {
    const s = await MilestoneSubmission.findById(req.params.id).populate(
      "project producer verifier"
    );
    if (!s) return res.status(404).json({ message: "Not found" });
    // allow owner, admin, milestone editor, or verifier
    if (
      req.user.role !== "admin" &&
      req.user.role !== "MILESTONE_EDITOR" &&
      req.user.role !== "AUDITOR" &&
      s.producer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(s);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
