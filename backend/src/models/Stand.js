const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    number: { type: Number, required: true, min: 1, max: 8 },
    rentedBy: { type: String, default: null }, // 개발용: 이메일 저장
    rentedAt: { type: Date, default: null }
}, { _id: false });

const standSchema = new mongoose.Schema({
    placeId: { type: String, required: true, unique: true }, // 예: "station-101"
    name: { type: String, default: "" },                     // 예: "강남역 1번 출구"
    slots: {
        type: [slotSchema],
        validate: {
            validator: (arr) => arr.length === 8 && new Set(arr.map(s => s.number)).size === 8,
            message: "슬롯은 1~8까지 8개가 각각 한 번씩 존재해야 합니다."
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Stand", standSchema);