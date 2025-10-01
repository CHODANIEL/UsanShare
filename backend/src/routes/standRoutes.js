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

// src/routes/standRoutes.js (목록/단건)
router.get("/", async (_req, res) => {
    try { res.json(await Stand.find().lean()); }
    catch (e) { console.error("스테이션 목록 조회 오류:", e); res.status(500).json({ message: e.message || "서버 오류" }); }
});

router.get("/:id", async (req, res) => {
    try {
        const stand = await Stand.findById(req.params.id).lean();
        if (!stand) return res.status(404).json({ message: "스테이션 없음" });
        res.json(stand);
    } catch (e) {
        console.error("스테이션 단건 조회 오류:", e);
        res.status(500).json({ message: e.message || "서버 오류" });
    }
});

/** 대여 (토큰의 이메일로만 대여) */
router.post("/:id/rent", auth, async (req, res) => {
    try {
        const { slotNumber } = req.body || {};
        const userEmail = req.user.email;
        if (!slotNumber || slotNumber < 1 || slotNumber > 8)
            return res.status(400).json({ message: "slotNumber(1~8) 필요" });

        // (옵션) 동일 스탠드에서 같은 유저가 중복 대여 못 하게 막으려면 이 체크 사용:
        // const already = await Stand.findOne({ _id: req.params.id, "slots.rentedBy": userEmail }).lean();
        // if (already) return res.status(409).json({ message: "이미 이 스탠드에서 대여 중입니다." });

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

/**
 * 반납
 * 요구사항: "본인 반납한 곳에만 반납" X, "슬롯 8개 중 아무 곳에 꽂아도 반납" O
 * 구현: 사용자가 현재 이 스탠드에서 대여 중인 슬롯을 찾아 그 슬롯만 해제.
 * 클라이언트의 slotNumber 입력은 더 이상 필요 없음(무시).
 */
router.post("/:id/return", auth, async (req, res) => {
    try {
        const userEmail = req.user.email;

        // 1) 유저가 이 스탠드에서 빌려간 슬롯이 있는지 먼저 조회(로그에 번호 남기기 위함)
        const stand = await Stand.findOne(
            { _id: req.params.id, "slots.rentedBy": userEmail },
            { "slots.$": 1 } // 매칭된 슬롯만 projection
        ).lean();

        if (!stand || !stand.slots || stand.slots.length === 0) {
            return res.status(403).json({ message: "현재 대여 중인 우산이 없습니다." });
        }

        const rentedSlotNumber = stand.slots[0].number;

        // 2) 해당 슬롯만 해제 (arrayFilters 사용)
        const updated = await Stand.findOneAndUpdate(
            { _id: req.params.id, "slots.rentedBy": userEmail },
            {
                $set: {
                    "slots.$[u].rentedBy": null,
                    "slots.$[u].rentedAt": null,
                },
            },
            {
                new: true,
                arrayFilters: [{ "u.rentedBy": userEmail }],
            }
        );

        if (!updated) {
            // 이론상 위 조회가 성공했으면 도달하지 않지만, 동시성 등으로 안전장치
            return res.status(409).json({ message: "반납 처리 중 충돌이 발생했습니다. 다시 시도해주세요." });
        }

        await RentalLog.create({
            userId: userEmail,
            standId: req.params.id,
            slotNumber: rentedSlotNumber, // 실제로 빌렸던 슬롯 번호 기록
            action: "return",
        });

        res.json({ message: "반납 성공", stand: updated });
    } catch (err) {
        console.error("반납 에러:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;