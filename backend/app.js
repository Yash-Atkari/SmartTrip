// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

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

// // app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/geofences", geofenceRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
