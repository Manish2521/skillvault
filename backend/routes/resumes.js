import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import auth from "../middleware/auth.js";
import Resume from "../models/Resume.js";
import { Types } from "mongoose";

const upload = multer({ storage });
const router = express.Router();


router.post(
  "/upload",
  auth,
  upload.single("resume"), 
  async (req, res) => {
    try {
      const { resumeName } = req.body;
      if (!resumeName || !req.file) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }

      // console.log("File uploaded:");
      // console.log(" - Original name:", file.originalname);
      // console.log(" - MIME type:", file.mimetype);

      // // Check if it's a PDF
      // if (file.mimetype === "application/pdf") {
      //   console.log("✅ This is a PDF file.");
      // } else {
      //   console.log("❌ This is NOT a PDF file.");
      // }


      const sizeMB = +(req.file.size / (1024 * 1024)).toFixed(2);
      
      const newResume = await Resume.create({
        user: req.user.id,
        filename: resumeName.trim(),
        url: req.file.path,
        sizeMB,
      });

      res.status(201).json({ success: true, resume: newResume });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }

  }
);


router.get("/", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    await Resume.deleteOne({ _id: new Types.ObjectId(req.params.id), user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;
