// routes/sos.js
const express = require("express");
const router = express.Router();
const { raiseSOS } = require("../controllers/sosController");
const ensureAuth = require("../middleware/auth");

router.post("/raise", /*ensureAuth,*/ raiseSOS);

module.exports = router;
