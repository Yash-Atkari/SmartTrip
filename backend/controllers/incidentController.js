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

exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ type: "SOS", status: "open" })
      .populate("userId", "email phone") // show user info
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.closeIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByIdAndUpdate(
      id,
      { status: "closed" },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    res.redirect("/responder-dashboard");
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
