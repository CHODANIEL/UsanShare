const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");




dotenv.config();
const app = express();

// 미들웨어
app.use(cors({
  origin: process.env.FRONT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

//유저 라우트
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

//스텐드 라우트
const standRoutes = require("./routes/standRoutes");
app.use("/api/stands", standRoutes);
app.use(express.json());

//기록 라우트
const logRoutes = require("./routes/logRoutes");
app.use("/api/logs", logRoutes);

mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 8000,
})
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch(err => console.error("❌ MongoDB 연결 실패:", err.message));

// 기본 라우트
app.get("/", (_req, res) => res.send("PhotoMemo API OK"));

// 에러 처리
app.use((err, req, res, next) => {
  console.error("서버 오류:", err);
  res.status(500).json({ message: "서버 오류" });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});