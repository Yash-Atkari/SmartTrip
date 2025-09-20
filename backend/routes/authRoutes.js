// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const crypto = require("crypto");

// Render Signup Page
router.get("/signup", (req, res) => {
  res.render("signup", { message: "" }); // message can be used for flash errors
});

// Render Login Page
router.get("/login", (req, res) => {
  res.render("login", { message: "" }); // message can be used for flash errors
});

// POST /signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, phone, password, role, emergencyContacts } = req.body;

    if (!username || !email || !phone || !password || !role) {
      req.flash("error", "Email, phone, password, and role are required");
      console.log("Missing fields:", { username, email, phone, password, role });
      return res.redirect("/api/auth/signup");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      console.log("Attempted signup with existing email:", email);
      return res.redirect("/api/auth/signup");
    }

     // Generate digitalId & digitalIdHash
    const digitalId = crypto.randomUUID(); // random unique ID
    const digitalIdHash = crypto
      .createHash("sha256")
      .update(digitalId)
      .digest("hex");

    // Create new user with selected role
    const newUser = new User({
      email,
      username,   // 👈 make passport happy
      phone,
      role,
      emergencyContacts,
      digitalId,
      digitalIdHash,
    });

    User.register(newUser, password, (err, user) => {
      if (err) {
        req.flash("error", err.message);
        console.error("Error during user registration:", err);
        return res.redirect("/api/auth/signup");
      }

      req.flash("success", "Account created! Please login.");
      return res.redirect("/api/auth/login");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error, try again");
    return res.redirect("/api/auth/signup");
  }
});

// POST /login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/api/auth/login",
    failureFlash: true,
  }),
  async (req, res, next) => {
    try {
      console.log("Login successful for user:", req.user.email, "with role:", req.user.role);

      const Incident = require("../models/Incident");

      if (req.user.role === "responder") {
        // Responders → fetch all open incidents
        const incidents = await Incident.find({ status: "open" })
          .populate("userId", "email") // only include user email
          .sort({ createdAt: -1 });

        return res.render("responderDashboard", {
          user: req.user,
          incidents,
        });
      } else {
        // Tourists → fetch incidents created by this user
        const incidents = await Incident.find({ userId: req.user._id })
          .sort({ createdAt: -1 });

        return res.render("userdashboard", {
          user: req.user,
          incidents,
        });
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
      req.flash("error", "Could not load dashboard");
      res.redirect("/api/auth/login");
    }
  }
);

// POST /logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/api/auth/login");
  });
});

module.exports = router;
