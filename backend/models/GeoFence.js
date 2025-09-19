const mongoose = require("mongoose");

const GeoFenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["circle", "polygon"], default: "circle" },
  center: {
    lat: Number,
    lng: Number,
  }, // for circle geofence
  radius: Number, // meters
  polygon: [
    {
      lat: Number,
      lng: Number,
    },
  ], // for polygon geofence
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GeoFence", GeoFenceSchema);
