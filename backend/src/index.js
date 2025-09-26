import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));

app.get("/health", (_req,res)=>res.json({ ok:true, service:"usan-api" }));

const MONGO_URI = process.env.MONGO_URI || "";
if (MONGO_URI) {
  mongoose.connect(MONGO_URI).then(()=>console.log("✅ MongoDB connected"))
    .catch(err=>console.error("❌ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️  MONGO_URI not set. Running without DB.");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 API on http://localhost:${PORT}`));
