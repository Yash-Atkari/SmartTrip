const Location = require("../models/Location");
const GeoFence = require("../models/GeoFence");
const turf = require("@turf/turf");

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    // Save location
    const location = await Location.create({
      user: req.user ? req.user._id : "68cd619c006909dbb219e4b3",
      lat,
      lng,
    });

    // Check safe zones
    const fences = await GeoFence.find({ active: true });
    const point = turf.point([lng, lat]);
    let alert = false;
    let message = "Inside safe zones";

    for (const fence of fences) {
      if (fence.type === "circle" && fence.center && fence.radius) {
        const center = turf.point([fence.center.lng, fence.center.lat]);
        const circle = turf.circle(center, fence.radius / 1000, { units: "kilometers" });
        if (!turf.booleanPointInPolygon(point, circle)) {
          alert = true;
          message = `Outside safe zone: ${fence.name}`;
          break;
        }
      } else if (fence.type === "polygon" && fence.polygon?.length > 0) {
        const polygon = turf.polygon([[...fence.polygon.map(p => [p.lng, p.lat]), [fence.polygon[0].lng, fence.polygon[0].lat]]]);
        if (!turf.booleanPointInPolygon(point, polygon)) {
          alert = true;
          message = `Outside safe zone: ${fence.name}`;
          break;
        }
      }
    }

    res.json({
      message: "Location updated",
      location,
      alert,
      safeMessage: message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
