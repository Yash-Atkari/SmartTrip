const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  emergencyContacts: [
    {
      name: String,
      phone: String,
    },
  ],
  digitalIdHash: { type: String }, // hash stored on blockchain later
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
