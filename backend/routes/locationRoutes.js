const express = require("express");
const router = express.Router();
const ensureAuth = require("../middleware/auth");
const { updateLocation } = require("../controllers/locationController");

router.post("/update", ensureAuth, updateLocation);

module.exports = router;
