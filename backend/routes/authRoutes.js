// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, phone, password, emergencyContacts } = req.body;
    if (!email || !phone || !password) return res.status(400).json({ message: "email, phone and password required" });

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ email, phone, password, emergencyContacts });
    return res.status(201).json({ message: "User created", digitalId: user.digitalId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info?.message || "Login failed" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      // do not send password back
      const safe = { _id: user._id, email: user.email, phone: user.phone, digitalId: user.digitalId };
      return res.json({ message: "Logged in", user: safe });
    });
  })(req, res, next);
});

// Logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
