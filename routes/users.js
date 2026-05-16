const express = require("express");
const User    = require("../models/User");

const router = express.Router();

// ─── POST /api/users/register ──────────────────────────────────────────────────
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password are required",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user, // password excluded via toJSON()
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/users/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Return user without password (via toJSON)
    res.json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/users/:email ─────────────────────────────────────────────────────
router.get("/:email", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
