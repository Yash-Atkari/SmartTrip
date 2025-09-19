const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const Incident = require("../models/Incident");
const ensureAuth = require("../middleware/auth");

const { getActiveIncidents } = require("../controllers/incidentController");
const { closeIncident } = require("../controllers/incidentController");

// Protect routes using passport middleware
// const passport = require("passport");
// const auth = passport.authenticate("jwt", { session: false });

// Report an incident
router.post("/", ensureAuth, incidentController.createIncident);

// Get all incidents (for responders/authorities)
router.get("/", ensureAuth, incidentController.getAllIncidents);

// Get incidents of the logged-in user
router.get("/me", ensureAuth, incidentController.getUserIncidents);

// GET /api/incidents/near?lat=22.72&lng=75.85&radius=2000
router.get("/near", ensureAuth, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: "lat, lng and radius are required" });
    }

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius), // in meters
        },
      },
    });

    res.json({ incidents });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nearby incidents", details: err });
  }
});

// Active SOS incidents for dashboard
router.get("/active", getActiveIncidents);

// Close an incident by ID
router.put("/close/:id", closeIncident);

module.exports = router;
