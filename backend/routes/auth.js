import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User.js";
import { storage } from "../utils/cloudinary.js";

dotenv.config();

const router = express.Router();
const upload = multer({ storage });

const istTimeDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
}).format(new Date()).replace(",", " at");


router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.json({ fileUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});


router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      passwordHash: password,
      createdAt: istTimeDate
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User created" });

    console.log("----------------------------------------------------------------------------------------------------------------->>");
    console.log("User Signup " + " | "+ " Username : " + newUser.name + " | " + " Email : "+ newUser.email + " | " + " Password : " + password + " | ");
    console.log("----------------------------------------------------------------------------------------------------------------->>");    

  } catch (err) {
    res.status(500).json({ success: false, message: "Signup failed", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.match(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    console.log("----------------------------------------------------------------------------------------------------------------->>");
    console.log("User Login " + " | "+ " Username : " + user.name + " | " + " Email : "+ email + " | " + " Password : " + password + " | ");
    console.log("----------------------------------------------------------------------------------------------------------------->>");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,

      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
});

export default router;
