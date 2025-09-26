const mongoose = require("mongoose");

const rentalLogSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // 지금은 이메일, 나중엔 ObjectId
    standId: { type: mongoose.Schema.Types.ObjectId, ref: "Stand", required: true },
    slotNumber: { type: Number, required: true },
    action: { type: String, enum: ["rent", "return"], required: true },
    at: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ 반드시 이렇게 "단일 default export"로!
module.exports = mongoose.model("RentalLog", rentalLogSchema);