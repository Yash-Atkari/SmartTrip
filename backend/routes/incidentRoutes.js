const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const Incident = require("../models/Incident");

// Protect routes using passport middleware
// const passport = require("passport");
// const auth = passport.authenticate("jwt", { session: false });

// Report an incident
router.post("/", /*auth,*/ incidentController.createIncident);

// Get all incidents (for responders/authorities)
router.get("/", /*auth,*/ incidentController.getAllIncidents);

// Get incidents of the logged-in user
router.get("/me", /*auth,*/ incidentController.getUserIncidents);

// GET /api/incidents/near?lat=22.72&lng=75.85&radius=2000
router.get("/near", async (req, res) => {
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

module.exports = router;
