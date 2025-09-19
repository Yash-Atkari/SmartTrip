const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // <-- use built-in

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  emergencyContacts: [{ name: String, phone: String }],
  digitalId: { type: String, unique: true, default: () => crypto.randomUUID() }, // <--- changed
  digitalIdHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
