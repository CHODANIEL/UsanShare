const express = require("express");
const RentalLog = require("../models/RentalLog");   // ✅ 구조분해 금지!

const router = express.Router();

// GET /api/logs/:userId
router.get("/:userId", async (req, res) => {
    try {
        const logs = await RentalLog.find({ userId: req.params.userId })
            .sort({ at: -1 })
            .lean();

        res.json(logs);
    } catch (err) {
        console.error("로그 조회 에러:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;