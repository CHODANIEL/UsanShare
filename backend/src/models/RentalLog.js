// models/RentalLog.js (예시)
const mongoose = require("mongoose");

const rentalLogSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // 이메일을 저장 중이니 String
    standId: { type: mongoose.Schema.Types.ObjectId, ref: "Stand", required: true },
    slotNumber: { type: Number, default: null },
    action: { type: String, enum: ["rent", "return"], required: true },
    at: { type: Date, default: Date.now }
});