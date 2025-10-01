// src/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;

    if (!token) return res.status(401).json({ message: "인증 토큰 없음" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET 미설정" });

    try {
        const p = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: p.id, email: p.email, displayName: p.displayName || "" };
        next();
    } catch {
        return res.status(401).json({ message: "유효하지 않은 토큰" });
    }
};