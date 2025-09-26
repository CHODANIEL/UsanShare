// src/routes/standRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const Stand = require("../models/Stand");
const RentalLog = require("../models/RentalLog");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

/** 유틸: 1~8 슬롯 생성 */
function makeEightSlots() {
    return Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        rentedBy: null,
        rentedAt: null,
    }));
}

/** 스테이션 생성 (관리자만) — 중복 라우트 제거 */
router.post("/", auth, adminOnly, async (req, res) => {
    try {
        const { placeId, name = "", lat, lng } = req.body || {};
        if (!placeId) return res.status(400).json({ message: "placeId 필요" });

        const exists = await Stand.findOne({ placeId });
        if (exists) return res.status(409).json({ message: "이미 존재하는 placeId" });

        const stand = await Stand.create({ placeId, name, lat, lng, slots: makeEightSlots() });
        res.status(201).json(stand);
    } catch (err) {
        console.error("스테이션 생성 에러:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

/** 스테이션 목록/단건 조회 */
router.get("/", async (_req, res) => {
    const list = await Stand.find().lean();
    res.json(list);
});

router.get("/:id", async (req, res) => {
    const stand = await Stand.findById(req.params.id).lean();
    if (!stand) return res.status(404).json({ message: "스테이션 없음" });
    res.json(stand);
});

/** 대여 (토큰의 이메일로만 대여) — 없던 라우트 추가 */
router.post("/:id/rent", auth, async (req, res) => {
    try {
        const { slotNumber } = req.body || {};
        const userEmail = req.user.email;
        if (!slotNumber || slotNumber < 1 || slotNumber > 8)
            return res.status(400).json({ message: "slotNumber(1~8) 필요" });

        // 빈 슬롯일 때만 점유
        const updated = await Stand.findOneAndUpdate(
            { _id: req.params.id, "slots.number": slotNumber, "slots.rentedBy": null },
            { $set: { "slots.$.rentedBy": userEmail, "slots.$.rentedAt": new Date() } },
            { new: true }
        );
        if (!updated) return res.status(409).json({ message: "이미 대여 중이거나 스테이션/슬롯이 없음" });

        await RentalLog.create({ userId: userEmail, standId: req.params.id, slotNumber, action: "rent" });
        res.json({ message: "대여 성공", stand: updated });
    } catch (err) {
        console.error("대여 에러:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

/** 반납 (내가 빌린 슬롯만 반납 가능) — 중복 라우트 제거하고 하나만 유지 */
router.post("/:id/return", auth, async (req, res) => {
    try {
        const { slotNumber } = req.body || {};
        const userEmail = req.user.email;
        if (!slotNumber || slotNumber < 1 || slotNumber > 8)
            return res.status(400).json({ message: "slotNumber(1~8) 필요" });

        const updated = await Stand.findOneAndUpdate(
            { _id: req.params.id, "slots.number": slotNumber, "slots.rentedBy": userEmail },
            { $set: { "slots.$.rentedBy": null, "slots.$.rentedAt": null } },
            { new: true }
        );
        if (!updated) return res.status(403).json({ message: "본인이 대여한 슬롯만 반납할 수 있습니다." });

        await RentalLog.create({ userId: userEmail, standId: req.params.id, slotNumber, action: "return" });
        res.json({ message: "반납 성공", stand: updated });
    } catch (err) {
        console.error("반납 에러:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;