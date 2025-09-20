const mongoose = require("mongoose");
const crypto = require("crypto");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  emergencyContacts: [{ name: String, phone: String }],
  role: { type: String, enum: ["tourist", "responder"], default: "tourist" }, // 👈 new field
  digitalId: { type: String, unique: true, default: () => crypto.randomUUID() },
  digitalIdHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Use email as the username field
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
