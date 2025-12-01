const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const emitter = require("../events");

// helper to generate token
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // Basic validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    const passwordRegex = /^(?=.{8,}$)(?=.*[A-Za-z])(?=.*\d).*/; // min 8, letters + digits
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });
    if (!passwordRegex.test(password))
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 8 characters and include letters and numbers",
        });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });
    try {
      emitter.emit("user_created", user);
    } catch (e) {}
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: genToken(user._id),
    });
  } catch (err) {
    next(err);
  }
});

// login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    // basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: genToken(user._id),
    });
  } catch (err) {
    next(err);
  }
});

// helpful message for accidental GET (e.g., user used GET in Postman)
router.get("/login", (req, res) => {
  res.status(405).json({ message: "Use POST /api/auth/login with JSON body { email, password }" });
});

const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");
const { ethers } = require("ethers");

// get current user
router.get("/me", protect, async (req, res, next) => {
  try {
    const u = req.user;
    // also include recent notifications count
    const unread = await Notification.countDocuments({
      user: u._id,
      read: false,
    });
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        notifications: u.notifications,
        walletAddress: u.walletAddress,
        unreadNotifications: unread,
      },
    });
  } catch (err) {
    next(err);
  }
});

// update current user profile / preferences
router.put("/me", protect, async (req, res, next) => {
  try {
    const u = req.user;
    const { name, email, organization, walletAddress, notifications } =
      req.body;
    if (name) u.name = name;
    if (email) u.email = email;
    if (organization) u.organization = organization;
    if (walletAddress) u.walletAddress = walletAddress;
    if (notifications && typeof notifications === "object") {
      u.notifications = { ...u.notifications, ...notifications };
    }
    await u.save();
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        notifications: u.notifications,
        walletAddress: u.walletAddress,
      },
    });
  } catch (err) {
    next(err);
  }
});

// generate a nonce for wallet signature (protected)
router.get("/nonce", protect, async (req, res, next) => {
  try {
    const u = req.user;
    const nonce = `Link wallet at ${new Date().toISOString()} - ${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    u.walletNonce = nonce;
    await u.save();
    res.json({ nonce });
  } catch (err) {
    next(err);
  }
});

// verify wallet signature and bind address to profile
router.post("/verify-wallet", protect, async (req, res, next) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature)
      return res.status(400).json({ message: "Missing params" });
    // Nonce-based verification: require a stored nonce on the user and verify the signature of that nonce
    const u = req.user;
    if (!u.walletNonce)
      return res
        .status(400)
        .json({ message: "Nonce not found, request /auth/nonce first" });
    const nonce = u.walletNonce;
    let recovered;
    try {
      if (ethers.verifyMessage) {
        recovered = ethers.verifyMessage(nonce, signature);
      } else if (ethers.utils && ethers.utils.verifyMessage) {
        recovered = ethers.utils.verifyMessage(nonce, signature);
      } else {
        return res
          .status(500)
          .json({ message: "Ethers verification not available" });
      }
    } catch (e) {
      console.warn(
        "Signature verification error",
        e && e.message ? e.message : e,
        { expectedMessage: nonce }
      );
      return res.status(400).json({ message: "Invalid signature" });
    }

    if (recovered.toLowerCase() !== address.toLowerCase())
      return res
        .status(401)
        .json({ message: "Signature does not match address" });

    // success: bind wallet and clear nonce
    u.walletAddress = address;
    u.walletNonce = null;
    await u.save();
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        walletAddress: u.walletAddress,
      },
    });
  } catch (err) {
    next(err);
  }
});

// change password
router.post("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Missing params" });
    const u = req.user;
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(currentPassword, u.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    u.password = newPassword; // User model should hash on save
    await u.save();
    res.json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
