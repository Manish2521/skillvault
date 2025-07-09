import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import auth from "../middleware/auth.js";
import Resume from "../models/Resume.js";
import { Types } from "mongoose";
import User from '../models/User.js';

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
  
  
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      const quotaLimit = 20;         // 20 MB total
      if (user.totalSizeMB + sizeMB > quotaLimit) {
        return res.status(413).json({ success: false, message: "Quota exceeded (20 MB)" });
      }

      

      // const sizeMB = +(req.file.size / (1024 * 1024)).toFixed(2);
      
      const newResume = await Resume.create({
        user: req.user.id,
        filename: resumeName.trim(),
        url: req.file.path,
        sizeMB,
      });

      // increment the user’s running total
      user.totalSizeMB += sizeMB;
      await user.save();
      
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
    const resume = await Resume.findOneAndDelete({
      _id: new Types.ObjectId(req.params.id),
      user: req.user.id,
    });

    if (resume) {
      const resumeSizeMB = resume.sizeMB || 0;
      const user = await User.findById(req.user.id);

      if (user) {
        const currentSize = user.totalSizeMB || 0;

        const newSize = Math.max(0, +(currentSize - resumeSizeMB).toFixed(2));
        user.totalSizeMB = newSize;

        await user.save();
      }

      return res.json({ success: true, message: "Document deleted" });
    } else {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});



export default router;
