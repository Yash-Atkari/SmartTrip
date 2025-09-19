const GeoFence = require("../models/GeoFence");
const turf = require("@turf/turf");

// Check if tourist location is inside any active geofence
exports.checkLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng)
      return res.status(400).json({ message: "Latitude and longitude required" });

    const point = turf.point([lng, lat]);

    const geofences = await GeoFence.find({ active: true });

    let outsideZones = [];

    geofences.forEach((zone) => {
      if (zone.type === "circle") {
        const center = turf.point([zone.center.lng, zone.center.lat]);
        const distance = turf.distance(center, point, { units: "meters" });
        if (distance > zone.radius) {
          outsideZones.push(zone.name);
        }
      } else if (zone.type === "polygon") {
        const coordinates = zone.polygon.map((p) => [p.lng, p.lat]);
        const polygon = turf.polygon([coordinates]);
        if (!turf.booleanPointInPolygon(point, polygon)) {
          outsideZones.push(zone.name);
        }
      }
    });

    if (outsideZones.length > 0) {
      return res.json({
        alert: true,
        message: `You are outside safe zones: ${outsideZones.join(", ")}`,
      });
    } else {
      return res.json({
        alert: false,
        message: "You are inside all safe zones",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
