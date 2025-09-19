const express = require("express");
const router = express.Router();
const { checkLocation } = require("../controllers/geofenceController");

// POST tourist location to check safe zones
router.post("/check-location", checkLocation);

module.exports = router;
