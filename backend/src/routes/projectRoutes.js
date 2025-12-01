const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const emitter = require("../events");
const { protect, authorize } = require("../middleware/auth");
const Notification = require("../models/Notification");
const User = require("../models/User");
const MilestoneSubmission = require("../models/MilestoneSubmission");
const {
  createProjectOnChain,
  markMilestoneComplete,
  loadDeployments,
} = require("../eth/contract");

// Multer storage to /uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${basename}${ext}`);
  },
});
const upload = multer({ storage });

// Create project (owner default is auth user)
router.post(
  "/",
  protect,
  upload.array("attachments", 6),
  async (req, res, next) => {
    try {
      const { title, description } = req.body;
      // Basic validation
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Title is required" });
      }
      if (title.length > 200)
        return res
          .status(400)
          .json({ message: "Title too long (max 200 chars)" });
      if (description && description.length > 2000)
        return res
          .status(400)
          .json({ message: "Description too long (max 2000 chars)" });
      // optional fields: milestones (JSON string or object), totalSubsidy
      let milestones = [];
      if (req.body.milestones) {
        try {
          milestones =
            typeof req.body.milestones === "string"
              ? JSON.parse(req.body.milestones)
              : req.body.milestones;
          // validate milestones array
          if (!Array.isArray(milestones))
            return res
              .status(400)
              .json({ message: "Milestones must be an array" });
          for (const m of milestones) {
            if (typeof m.title !== "string" || m.title.trim().length === 0)
              return res
                .status(400)
                .json({ message: "Each milestone must have a title" });
            if (
              m.requiredProduction !== undefined &&
              isNaN(Number(m.requiredProduction))
            )
              return res.status(400).json({
                message: "Milestone requiredProduction must be a number",
              });
          }
        } catch (e) {
          // ignore parse error, fallback to empty
          milestones = [];
        }
      }
      const totalSubsidy = req.body.totalSubsidy
        ? Number(req.body.totalSubsidy)
        : undefined;
      const files = req.files || [];
      const filePaths = files.map((f) => `/uploads/${f.filename}`);

      const project = await Project.create({
        title,
        description,
        owner: req.user._id,
        attachments: filePaths,
        status: "submitted",
        milestones,
        totalSubsidy,
      });

      // If milestones exist, normalize to ensure each milestone has an id/index
      if (project.milestones && Array.isArray(project.milestones)) {
        project.milestones = project.milestones.map((m, i) => ({
          ...(m || {}),
          index: i,
        }));
        await project.save();
      }

      // create notification for admins (simplified: all admins)
      try {
        const admins = await User.find({ role: "admin" });
        for (const a of admins) {
          await Notification.create({
            user: a._id,
            type: "project_submitted",
            title: "Project submitted",
            message: `${req.user.name} submitted project ${project.title}`,
            data: { projectId: project._id },
          });
        }
      } catch (e) {
        // ignore notification failures
      }
      // Emit project created event for SSE subscribers
      try {
        emitter.emit("project_created", project);
      } catch (e) {
        // ignore emitter errors
      }

      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  }
);

// Enroll in project (producer submits enrollment with optional attachments)
router.post(
  "/:id/enroll",
  protect,
  upload.array("attachments", 6),
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Not found" });

      // only producers can enroll
      if (req.user.role !== "PRODUCER")
        return res.status(403).json({ message: "Only producers can enroll" });

      // project must be approved to enroll
      if (project.status !== "approved")
        return res
          .status(400)
          .json({ message: "Project not open for enrollment" });

      const files = req.files || [];
      const filePaths = files.map((f) => `/uploads/${f.filename}`);

      const Enrollment = require("../models/Enrollment");
      const enrollment = await Enrollment.create({
        project: project._id,
        producer: req.user._id,
        title: req.body.title || undefined,
        description: req.body.description || undefined,
        attachments: filePaths,
        status: "pending",
      });

      // add producer to project's enrolledProducers if not present
      project.enrolledProducers = project.enrolledProducers || [];
      const exists = project.enrolledProducers.find(
        (e) => String(e) === String(req.user._id)
      );
      if (!exists) {
        project.enrolledProducers.push(req.user._id);
        await project.save();
      }

      // notify admins
      try {
        const admins = await User.find({ role: "admin" });
        for (const a of admins) {
          await Notification.create({
            user: a._id,
            type: "enrollment_submitted",
            title: "Enrollment submitted",
            message: `${req.user.name} submitted enrollment for ${project.title}`,
            data: { projectId: project._id, enrollmentId: enrollment._id },
          });
        }
      } catch (e) {}

      res.status(201).json({ enrollment });
    } catch (err) {
      next(err);
    }
  }
);

// List enrollments for a project (admin, GOV, or project owner)
router.get("/:id/enrollments", protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });

    const isOwner =
      project.owner && project.owner.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && req.user.role !== "GOV" && !isOwner)
      return res.status(403).json({ message: "Forbidden" });

    const Enrollment = require("../models/Enrollment");
    const list = await Enrollment.find({ project: project._id }).populate(
      "producer",
      "name email"
    );
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Approve/Reject an enrollment (admin or GOV or project owner)
router.put(
  "/enrollments/:enrollmentId/decision",
  protect,
  async (req, res, next) => {
    try {
      const { decision } = req.body; // 'accepted' | 'rejected'
      if (!["accepted", "rejected"].includes(decision))
        return res.status(400).json({ message: "Invalid decision" });

      const Enrollment = require("../models/Enrollment");
      const enrollment = await Enrollment.findById(
        req.params.enrollmentId
      ).populate("project");
      if (!enrollment)
        return res.status(404).json({ message: "Enrollment not found" });

      const project = enrollment.project;
      const isOwner =
        project.owner && project.owner.toString() === req.user._id.toString();
      if (req.user.role !== "admin" && req.user.role !== "GOV" && !isOwner)
        return res.status(403).json({ message: "Forbidden" });

      enrollment.status = decision;
      await enrollment.save();

      // ensure producer recorded on project enrolledProducers
      project.enrolledProducers = project.enrolledProducers || [];
      if (
        !project.enrolledProducers.find(
          (e) => String(e) === String(enrollment.producer)
        )
      ) {
        project.enrolledProducers.push(enrollment.producer);
        await project.save();
      }

      // notify producer
      try {
        await Notification.create({
          user: enrollment.producer,
          type: "enrollment_" + decision,
          title: `Enrollment ${decision}`,
          message: `Your enrollment for ${project.title} was ${decision}.`,
          data: { projectId: project._id, enrollmentId: enrollment._id },
        });
      } catch (e) {}

      res.json(enrollment);
    } catch (err) {
      next(err);
    }
  }
);

// Public approved projects endpoint (no auth required)
// GET /api/projects/public
router.get("/public", async (req, res, next) => {
  try {
    const list = await Project.find({ status: "approved" }).populate(
      "owner",
      "name email role"
    );
    return res.json(list);
  } catch (err) {
    next(err);
  }
});

// Get projects: if admin => all, else => user's
// GET /api/projects?status=approved
router.get("/", protect, async (req, res, next) => {
  try {
    const { status } = req.query;
    // Admin, GOV, or Milestone Editor: return all projects (optionally filtered by status)
    if (
      req.user.role === "admin" ||
      req.user.role === "GOV" ||
      req.user.role === "MILESTONE_EDITOR" ||
      req.user.role === "milestone_editor"
    ) {
      const q = {};
      if (status) q.status = status;
      const list = await Project.find(q).populate("owner", "name email role");
      return res.json(list);
    }

    // Non-admins
    if (status && status === "approved") {
      // Return approved/public projects so producers can browse and enroll
      const list = await Project.find({ status: "approved" }).populate(
        "owner",
        "name email role"
      );
      return res.json(list);
    }

    // Default: return projects owned by the authenticated user
    const list = await Project.find({ owner: req.user._id }).populate(
      "owner",
      "name email role"
    );
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Get one
router.get("/:id", protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "owner",
      "name email role"
    );
    if (!project) return res.status(404).json({ message: "Not found" });

    // allow owner or admin; additionally allow PRODUCERs to view approved projects
    const isOwner = project.owner && project.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isProducerViewingApproved = req.user.role === "PRODUCER" && project.status === "approved";
    if (!isOwner && !isAdmin && !isProducerViewingApproved) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// Update (owner or admin)
router.put(
  "/:id",
  protect,
  upload.array("attachments", 6),
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Not found" });

      if (
        req.user.role !== "admin" &&
        project.owner.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { title, description, status } = req.body;
      if (title) project.title = title;
      if (description) project.description = description;
      if (status && req.user.role === "admin") project.status = status;

      // add new attachments if present
      const files = req.files || [];
      if (files.length) {
        const newFiles = files.map((f) => `/uploads/${f.filename}`);
        project.attachments = project.attachments.concat(newFiles);
      }

      await project.save();
      // Emit project updated event for SSE subscribers
      try {
        emitter.emit("project_updated", project);
      } catch (e) {
        // ignore
      }

      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// Milestone management: add a milestone (GOV, admin, milestone editor)
router.post("/:id/milestones", protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    const isEditor =
      role === "MILESTONE_EDITOR" ||
      role === "AUDITOR" ||
      role === "milestone_editor";
    if (!(role === "admin" || isEditor || role === "GOV"))
      return res.status(403).json({ message: "Forbidden" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    // require ownership or admin/GOV/editor
    if (
      req.user.role !== "admin" &&
      req.user.role !== "GOV" &&
      !isEditor &&
      project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, requiredProduction, percent, manualVerification } = req.body;
    if (!name)
      return res.status(400).json({ message: "Milestone name required" });
    const newMilestone = {
      name,
      requiredProduction: Number(requiredProduction || 0),
      percent: Number(percent || 0),
      manualVerification: !!manualVerification,
      completed: false,
    };
    project.milestones.push(newMilestone);
    // reindex
    project.milestones = project.milestones.map((m, i) => ({
      ...(m.toObject ? m.toObject() : m),
      index: i,
    }));
    await project.save();
    res.status(201).json(project.milestones);
  } catch (err) {
    next(err);
  }
});

// Edit a milestone by index
router.put("/:id/milestones/:index", protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    const isEditor =
      role === "MILESTONE_EDITOR" ||
      role === "AUDITOR" ||
      role === "milestone_editor";
    if (!(role === "admin" || isEditor || role === "GOV"))
      return res.status(403).json({ message: "Forbidden" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    const idx = Number(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= (project.milestones || []).length)
      return res.status(400).json({ message: "Invalid milestone index" });
    const m = project.milestones[idx];
    const { name, requiredProduction, percent, manualVerification, completed } =
      req.body;
    if (name !== undefined) m.name = name;
    if (requiredProduction !== undefined)
      m.requiredProduction = Number(requiredProduction);
    if (percent !== undefined) m.percent = Number(percent);
    if (manualVerification !== undefined)
      m.manualVerification = !!manualVerification;
    if (completed !== undefined) m.completed = !!completed;
    await project.save();
    res.json(project.milestones);
  } catch (err) {
    next(err);
  }
});

// Reorder milestones: accept array of indices mapping
router.put("/:id/milestones/reorder", protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    const isEditor =
      role === "MILESTONE_EDITOR" ||
      role === "AUDITOR" ||
      role === "milestone_editor";
    if (!(role === "admin" || isEditor || role === "GOV"))
      return res.status(403).json({ message: "Forbidden" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    const { order } = req.body; // expected array of indices or milestone titles
    if (!Array.isArray(order))
      return res.status(400).json({ message: "Order must be array" });
    const current = project.milestones || [];
    const newOrder = [];
    for (const key of order) {
      let item;
      if (typeof key === "number") item = current[key];
      else item = current.find((c) => c.name === key || c.index == key);
      if (item) newOrder.push(item);
    }
    if (newOrder.length !== current.length)
      return res
        .status(400)
        .json({ message: "Order does not include all milestones" });
    project.milestones = newOrder.map((m, i) => ({
      ...(m.toObject ? m.toObject() : m),
      index: i,
    }));
    await project.save();
    res.json(project.milestones);
  } catch (err) {
    next(err);
  }
});

// Admin only: approve/reject
router.post(
  "/:id/decision",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { decision } = req.body; // 'approved' | 'rejected'
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Not found" });
      if (!["approved", "rejected"].includes(decision)) {
        return res.status(400).json({ message: "Invalid decision" });
      }
      project.status = decision;
      await project.save();

      // notify owner
      try {
        await Notification.create({
          user: project.owner,
          type: "project_decision",
          title: `Project ${decision}`,
          message: `Your project ${project.title} was ${decision}`,
          data: { projectId: project._id },
        });
      } catch (e) {}
      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// Register project on-chain (call createProject)
router.post("/:id/onchain", protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner");
    if (!project) return res.status(404).json({ message: "Not found" });

    // allow GOV or admin to register on-chain (GOV often creates schemes)
    if (!(req.user.role === "admin" || req.user.role === "GOV")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const producerAddress =
      project.owner.walletAddress || req.body.producerAddress;
    if (!producerAddress)
      return res
        .status(400)
        .json({ message: "Producer wallet address required" });

    const deployments = loadDeployments();
    const tokenAddress = deployments.TestToken;

    // pass totalSubsidy so the on-chain record reflects the intended amount
    const receipt = await createProjectOnChain(
      project._id.toString(),
      producerAddress,
      tokenAddress,
      project.totalSubsidy || 0
    );
    project.chainProjectId = project._id.toString();
    project.tokenAddress = tokenAddress;
    // mark as approved on successful on-chain registration
    project.status = "approved";
    await project.save();

    // notify owner
    try {
      await Notification.create({
        user: project.owner._id,
        type: "project_onchain",
        title: "Project registered on-chain",
        message: `Your project ${project.title} was registered on-chain.`,
        data: { txHash: receipt.transactionHash, projectId: project._id },
      });
    } catch (e) {}

    res.json({ project, txHash: receipt.transactionHash });
  } catch (err) {
    next(err);
  }
});

// Submit milestone evidence
router.post(
  "/:id/milestones/:index/submit",
  protect,
  upload.array("attachments", 6),
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Not found" });
      if (project.owner.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Forbidden" });

      const index = Number(req.params.index);
      if (
        isNaN(index) ||
        index < 0 ||
        index >= (project.milestones || []).length
      )
        return res.status(400).json({ message: "Invalid milestone index" });

      const files = req.files || [];
      const filePaths = files.map((f) => `/uploads/${f.filename}`);
      const productionValue = req.body.productionValue
        ? Number(req.body.productionValue)
        : undefined;
      const productionDate = req.body.productionDate
        ? new Date(req.body.productionDate)
        : undefined;

      const submission = await MilestoneSubmission.create({
        project: project._id,
        milestoneIndex: index,
        producer: req.user._id,
        attachments: filePaths,
        productionValue,
        productionDate,
        status: "pending",
      });

      // notify admins/auditors
      try {
        const auditors = await User.find({
          role: { $in: ["admin", "AUDITOR"] },
        });
        for (const a of auditors) {
          await Notification.create({
            user: a._id,
            type: "milestone_submitted",
            title: "Milestone submitted",
            message: `Milestone #${index} for project ${project.title} was submitted.`,
            data: { projectId: project._id, submissionId: submission._id },
          });
        }
      } catch (e) {}

      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }
);

// Verify milestone (admin/auditor) - accept submissionId and decision
router.post(
  "/:id/milestones/:index/verify",
  protect,
  async (req, res, next) => {
    try {
      const { submissionId, decision } = req.body; // decision: 'verified' | 'rejected'
      if (!submissionId || !["verified", "rejected"].includes(decision))
        return res.status(400).json({ message: "Missing params" });

      // Only admin may verify submissions (approval/rejection)
      if (req.user.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const submission = await MilestoneSubmission.findById(
        submissionId
      ).populate("project");
      if (!submission)
        return res.status(404).json({ message: "Submission not found" });

      if (submission.status !== "pending")
        return res
          .status(400)
          .json({ message: "Submission already processed" });

      submission.status = decision === "verified" ? "verified" : "rejected";
      submission.verifier = req.user._id;

      if (decision === "verified") {
        // mark milestone completed on project
        const project = await Project.findById(submission.project._id);
        const idx = submission.milestoneIndex;
        if (project && project.milestones && project.milestones[idx]) {
          project.milestones[idx].completed = true;
          project.milestones[idx].completedAt = new Date();
          await project.save();
        }

        // trigger on-chain release if chainProjectId exists
        try {
          if (project && project.chainProjectId) {
            const receipt = await markMilestoneComplete(
              project._id.toString(),
              idx
            );
            submission.txHash =
              receipt.transactionHash ||
              (receipt && receipt.transactionHash) ||
              null;
          }
        } catch (e) {
          // attach error info to submission (not failing whole flow)
          console.warn("On-chain call failed:", e.message || e);
        }

        // set settlement required if project has chainProjectId (on-chain flows)
        if (project && project.chainProjectId) {
          submission.settlementRequired = true;
        }

        // notify owner
        try {
          await Notification.create({
            user: submission.project.owner,
            type: "milestone_verified",
            title: "Milestone verified",
            message: `Milestone #${submission.milestoneIndex} for ${submission.project.title} verified.`,
            data: {
              projectId: submission.project._id,
              submissionId: submission._id,
              txHash: submission.txHash,
            },
          });
        } catch (e) {}

        // create audit log for verification
        try {
          const AuditLog = require("../models/AuditLog");
          const al = await AuditLog.create({
            action: "milestone_verified",
            performedBy: req.user._id,
            role: req.user.role,
            project: project._id,
            submission: submission._id,
            tx: submission.txHash,
          });
          try {
            const emitter = require("../events");
            emitter.emit("audit_log_created", al);
          } catch (e) {}
        } catch (e) {
          console.error("AuditLog create failed", e);
        }
      } else {
        // rejected
        try {
          await Notification.create({
            user: submission.project.owner,
            type: "milestone_rejected",
            title: "Milestone rejected",
            message: `Milestone #${submission.milestoneIndex} for ${submission.project.title} was rejected.`,
            data: {
              projectId: submission.project._id,
              submissionId: submission._id,
            },
          });
        } catch (e) {}
      }

      await submission.save();
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
