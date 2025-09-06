import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import session from "express-session";
import passport from "./config/passport.js";

dotenv.config();
connectDB();

const app = express();


app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, 
  })
);

app.use(express.json());


app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboardcat",
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "keyboardcat",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 2 * 60 * 1000, // ⏳ 2 minutes
//     },
//     rolling: true, // refresh session expiry on every request
//   })
// );



app.use(passport.initialize());
app.use(passport.session());


app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Ping.." });
});


mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
