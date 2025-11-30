require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./utils/db");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const auditRoutes = require("./routes/auditRoutes");
const userRoutes = require("./routes/userRoutes");
const streamRoutes = require("./routes/streamRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect DB
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
// Support comma-separated origins in CORS_ORIGIN env. If set to '*' will allow any origin.
const allowedOriginEnv = process.env.CORS_ORIGIN || "*";
let corsOptions;
if (allowedOriginEnv === "*") {
  // echo back request origin (more flexible than fixed '*')
  corsOptions = {
    origin: true,
    credentials: true,
  };
} else {
  const allowedOrigins = allowedOriginEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      // allow requests like curl/postman with no origin
      if (!origin) return callback(null, true);

      // Normalize origin (remove trailing slash etc.) and compare by URL.origin
      let incoming;
      try {
        incoming = new URL(origin).origin;
      } catch (e) {
        incoming = origin;
      }

      // Exact match
      if (allowedOrigins.indexOf(incoming) !== -1) return callback(null, true);

      // Allow localhost/127.0.0.1 variants when any allowed origin contains localhost or 127.0.0.1
      const isLocalIncoming = /localhost|127\.0\.0\.1/.test(incoming);
      const allowedHasLocal = allowedOrigins.some((a) =>
        /localhost|127\.0\.0\.1/.test(a)
      );
      if (isLocalIncoming && allowedHasLocal) return callback(null, true);

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("CORS policy: This origin is not allowed"));
    },
    credentials: true,
  };
}

app.use(cors(corsOptions));
// Ensure preflight requests are handled for all routes
app.options("*", cors(corsOptions));

// Serve uploaded files (attachments)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/stats", statsRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date() }));

// error handler (always last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
