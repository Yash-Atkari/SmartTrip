const express = require("express");
const router = express.Router();
const { checkLocation } = require("../controllers/geofenceController");
const ensureAuth = require("../middleware/auth");

// POST tourist location to check safe zones
router.post("/check-location", ensureAuth, checkLocation);

module.exports = router;
