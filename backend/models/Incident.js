const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, required: true },
  description: String,
  photos: [String],
  status: { type: String, default: "open" },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  timestamp: { type: Date, default: Date.now },
  blockchainHash: String,
});

// Tell MongoDB to index location for geospatial queries
IncidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", IncidentSchema);
