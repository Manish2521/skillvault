import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose'
import connectDB from "./config/db.js"; 
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);        
app.use("/api/resumes", resumeRoutes);   

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});
