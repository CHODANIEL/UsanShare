// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "인증 필요" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // payload: { id, email, role, iat, exp }
        req.user = { id: payload.id, email: payload.email, role: payload.role };
        next();
    } catch (e) {
        return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
};