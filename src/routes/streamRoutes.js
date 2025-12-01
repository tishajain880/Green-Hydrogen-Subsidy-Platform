const express = require("express");
const router = express.Router();
const emitter = require("../events");
const Project = require("../models/Project");
const User = require("../models/User");
const MilestoneSubmission = require("../models/MilestoneSubmission");

// Helper to send SSE formatted message
function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Submissions stream
router.get("/submissions", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  // Send a ping comment to keep connection alive
  res.write(": connected\n\n");

  const onUpdate = (payload) => {
    sendSSE(res, "submission", payload);
  };

  emitter.on("submission_updated", onUpdate);

  // periodic keepalive
  const keepAlive = setInterval(() => res.write(": keepalive\n\n"), 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    emitter.removeListener("submission_updated", onUpdate);
    res.end();
  });
});

// Audit logs stream
router.get("/audit-logs", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  res.write(": connected\n\n");

  const onCreate = (payload) => {
    sendSSE(res, "audit_log", payload);
  };

  emitter.on("audit_log_created", onCreate);

  const keepAlive = setInterval(() => res.write(": keepalive\n\n"), 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    emitter.removeListener("audit_log_created", onCreate);
    res.end();
  });
});

// Projects stream
router.get("/projects", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  res.write(": connected\n\n");

  const onProjectCreated = (payload) => {
    sendSSE(res, "project", payload);
  };

  const onProjectUpdated = (payload) => {
    sendSSE(res, "project", payload);
  };

  emitter.on("project_created", onProjectCreated);
  emitter.on("project_updated", onProjectUpdated);

  const keepAlive = setInterval(() => res.write(": keepalive\n\n"), 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    emitter.removeListener("project_created", onProjectCreated);
    emitter.removeListener("project_updated", onProjectUpdated);
    res.end();
  });
});

// Stats stream - compute aggregated stats and push on relevant events
router.get("/stats", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  res.write(": connected\n\n");

  async function computeAndSend() {
    try {
      const totalProjects = await Project.countDocuments();
      const approvedProjects = await Project.countDocuments({
        status: "approved",
      });
      const producersCount = await User.countDocuments({ role: "PRODUCER" });
      const settledSubmissions = await MilestoneSubmission.countDocuments({
        settled: true,
      });
      sendSSE(res, "stats", {
        totalProjects,
        approvedProjects,
        producersCount,
        settledSubmissions,
        time: new Date(),
      });
    } catch (e) {
      // don't crash stream on errors
      try {
        sendSSE(res, "stats_error", {
          message: e && e.message ? e.message : String(e),
        });
      } catch (__) {}
    }
  }

  const onProject = () => computeAndSend();
  const onSubmission = () => computeAndSend();
  const onAudit = () => computeAndSend();
  const onUser = () => computeAndSend();

  emitter.on("project_created", onProject);
  emitter.on("project_updated", onProject);
  emitter.on("submission_updated", onSubmission);
  emitter.on("audit_log_created", onAudit);
  emitter.on("user_created", onUser);

  // send initial snapshot
  computeAndSend();

  const keepAlive = setInterval(() => res.write(": keepalive\n\n"), 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    emitter.removeListener("project_created", onProject);
    emitter.removeListener("project_updated", onProject);
    emitter.removeListener("submission_updated", onSubmission);
    emitter.removeListener("audit_log_created", onAudit);
    emitter.removeListener("user_created", onUser);
    res.end();
  });
});

module.exports = router;
