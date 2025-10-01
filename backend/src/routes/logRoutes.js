// src/routes/logRoutes.js
const express = require("express");
const RentalLog = require("../models/RentalLog");
const router = express.Router();

router.get("/:userEmail", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.userEmail).toLowerCase().trim();
        const logs = await RentalLog.find({ userId: email }).sort({ at: -1 }).lean();
        res.json(logs);
    } catch (e) {
        console.error("로그 조회 오류:", e);
        res.status(500).json({ message: e.message || "서버 오류" });
    }
});

module.exports = router;