const Incident = require("../models/Incident");
const crypto = require("crypto");

// Report a new incident
exports.createIncident = async (req, res) => {
  try {
    const { type, lat, lng, description, photos } = req.body;

    const incident = new Incident({
      userId: req.user ? req.user._id : "68cca3442d9feae0c20d11a8", // optional: depends on auth
      type,
      description,
      photos,
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON format
      },
      blockchainHash: crypto.randomBytes(32).toString("hex"), // mock hash
    });

    await incident.save();

    res.json({
      message: "✅ Incident reported successfully",
      incident,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to report incident", details: err });
  }
};

// Get all incidents (for responders)
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().populate("userId", "email phone");
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch incidents" });
  }
};

// Get incidents of logged-in user
exports.getUserIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ userId: req.user._id });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch your incidents" });
  }
};
