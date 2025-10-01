// src/routes/authroutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

function sign(user) {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
    return jwt.sign(
        { id: user._id.toString(), email: user.email, displayName: user.displayName || "" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, displayName = "" } = req.body || {};
        if (!email || !password) return res.status(400).json({ message: "이메일/비밀번호 필요" });

        const em = String(email).toLowerCase().trim();
        const exists = await User.findOne({ email: em });
        if (exists) return res.status(400).json({ message: "이미 가입된 이메일입니다." });

        const passwordHash = await bcrypt.hash(password, 10);     // ✅
        const user = await User.create({ email: em, passwordHash, displayName }); // ✅

        const token = sign(user);
        res.json({ token, user: { _id: user._id, email: user.email, displayName: user.displayName || "" } });
    } catch (e) {
        if (e?.code === 11000) return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        console.error("회원가입 오류:", e);
        res.status(500).json({ message: e.message || "서버 오류" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ message: "이메일/비밀번호 필요" });

        const em = String(email).toLowerCase().trim();
        const user = await User.findOne({ email: em });
        if (!user) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

        const ok = await bcrypt.compare(password, user.passwordHash || ""); // ✅
        if (!ok) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

        const token = sign(user);
        res.json({ token, user: { _id: user._id, email: user.email, displayName: user.displayName || "" } });
    } catch (e) {
        console.error("로그인 오류:", e);
        res.status(500).json({ message: e.message || "서버 오류" });
    }
});

router.get("/:userEmail", async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.params.userEmail).toLowerCase();
        const logs = await RentalLog.find({ userId: userEmail }).sort({ at: -1 }).lean();
        res.json(logs);
    } catch (e) {
        console.error("로그 조회 오류:", e);
        res.status(500).json({ message: e.message || "서버 오류" });
    }
});

router.post("/logout", (_req, res) => res.json({ message: "ok" }));


/** 내 정보 */
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ message: "사용자 없음" });
        return res.json({
            _id: user._id,
            email: user.email,
            displayName: user.displayName || "",
        });
    } catch (e) {
        console.error("me 오류:", e);
        return res.status(500).json({ message: "서버 오류" });
    }
});

/** 로그아웃 (토큰 클라이언트에서 폐기) */
router.post("/logout", (_req, res) => {
    return res.json({ message: "ok" });
});

module.exports = router;