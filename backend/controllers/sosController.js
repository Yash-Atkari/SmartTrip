// controllers/sosController.js
const Incident = require("../models/Incident");
const User = require("../models/User");
const { sendSMS, sendWhatsApp } = require("../services/notificationService");

exports.raiseSOS = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // Create SOS incident
    const incident = new Incident({
      userId: req.user ? req.user._id : "68cd619c006909dbb219e4b3",
      type: "SOS",
      description: "Emergency SOS triggered",
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });
    await incident.save();

    // Fetch emergency contacts
    const user = await User.findById(incident.userId);
    const contacts = user.emergencyContacts || [];

    // Alert message
    const message = `🚨 SOS Alert!\nUser: ${user.email}\nLocation: https://maps.google.com/?q=${lat},${lng}`;

    // Notify all contacts
    for (const contact of contacts) {
      await sendSMS(contact.phone, message);
      // or sendWhatsApp(contact.phone, message);
    }

    res.json({
      success: true,
      message: "🚨 SOS raised successfully. Contacts notified.",
      incident,
    });
  } catch (err) {
    console.error("Error in raiseSOS:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
