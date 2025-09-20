// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies
// Parse application/x-www-form-urlencoded (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// // Import routes (we’ll create them later)
// const userRoutes = require("./routes/userRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const geofenceRoutes = require("./routes/geofenceRoutes");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const sosRoutes = require("./routes/sos");

const ensureAuth = require("./middleware/auth");
const User = require("./models/User");
const Incident = require("./models/Incident"); // adjust path if needed

const sessionOptions = {
  // store,
  secret: process.env.SECRET || "secret",   // use env variable properly
  resave: false,
  saveUninitialized: false,     // only save when needed
  rolling: true,   // 👈 add this here for sliding session
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Home route
app.get("/", (req, res) => {
  res.render("home"); // render home.ejs
});

app.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    // Fetch incidents of logged-in user
    const incidents = await Incident.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.render("userdashboard", {
      user: req.user,
      incidents,
      messages: {
        success: req.flash("success"),
        error: req.flash("error"),
      },
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    req.flash("error", "Could not load dashboard");
    res.redirect("/login");
  }
});

// Responder dashboard
app.get("/responder-dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    // Fetch open incidents, newest first
    const incidents = await Incident.find({ status: "open" })
      .populate("userId", "email") // fetch user email only
      .sort({ createdAt: -1 });

    res.render("responderDashboard", {
      user: req.user,
      incidents,
    });
  } catch (err) {
    console.error("Error loading responder dashboard:", err);
    req.flash("error", "Could not load incidents");
    res.redirect("/login");
  }
});

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/incidents", incidentRoutes);
app.use("/api/geofences", ensureAuth, geofenceRoutes);

app.use("/api/location", locationRoutes);

app.use("/api/sos", sosRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
