const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();


function sign(user) {
    return jwt.sign(
        { id: user._id.toString(), email: user.email, displayName: user.displayName || "" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// 회원가입
router.post("/register", async (req, res) => {
    const { email, password, displayName = "", role = "user" } = req.body;
    try {
        const { email, password, displayName = "" } = req.body || {};
        if (!email || !password) return res.status(400).json({ message: "이메일/비밀번호 필요" });

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ message: "이미 가입된 이메일입니다." });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email: email.toLowerCase(), password: hash, displayName });

        const token = sign(user);
        res.json({
            token,
            user: { _id: user._id, email: user.email, displayName: user.displayName },
        });
    } catch (e) {
        console.error("회원가입 오류:", e);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 로그인
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ message: "이메일/비밀번호 필요" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

        const token = sign(user);
        res.json({
            token,
            user: { _id: user._id, email: user.email, displayName: user.displayName },
        });
    } catch (e) {
        console.error("로그인 오류:", e);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 내 정보
router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    res.json({ _id: user._id, email: user.email, displayName: user.displayName });
});

// (선택) 로그아웃 — 클라이언트에서 토큰만 삭제하면 끝. 서버는 형태만 제공
router.post("/logout", (_req, res) => {
    res.json({ message: "ok" });
});

module.exports = router;