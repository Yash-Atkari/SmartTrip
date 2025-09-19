// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Smart Tourist Safety Monitoring API is running...");
});

// // Import routes (we’ll create them later)
// const userRoutes = require("./routes/userRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const geofenceRoutes = require("./routes/geofenceRoutes");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");

const ensureAuth = require("./middleware/auth");

// Session middleware (use env var for secret in production)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_this_in_prod",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set secure:true in prod with HTTPS
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/incidents", ensureAuth, incidentRoutes);
app.use("/api/geofences", ensureAuth, geofenceRoutes);

app.use("/api/location", locationRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
