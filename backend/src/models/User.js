// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ 추가
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);