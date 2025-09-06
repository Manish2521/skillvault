import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User.js";
import { storage } from "../utils/cloudinary.js";
import passport from "../config/passport.js";

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
})
  .format(new Date())
  .replace(",", " at");

// -------------------- Google OAuth --------------------

// Step 1: Google login/signup start
router.get("/google", (req, res, next) => {
  const action = req.query.action || "login"; 
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: action,   
  })(req, res, next);
});


// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=UserNotFound`,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=UserNotFound`);
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Redirect with token + name
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&name=${encodeURIComponent(
          user.name
        )}`
      );
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

// -------------------- File Upload --------------------
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.json({ fileUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// -------------------- Signup --------------------
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
      password: password, 
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "Account created successfully" });

    console.log("-----------------------------------------------------------");
    console.log(
      `User Signup | Name: ${newUser.name} | Email: ${newUser.email} | Password: ${password}`
    );
    console.log("-----------------------------------------------------------");
  } catch (err) {
    console.log("error hi broooooo")
    console.log(err)
    res.status(500).json({ success: false, message: "Signup failed", error: err.message });
  }
});

// -------------------- Login --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.match(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    console.log("-----------------------------------------------------------");
    console.log(`User Login | Name: ${user.name} | Email: ${email} | Password: ${password}`);
    console.log("-----------------------------------------------------------");

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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

// check if user exists by email
router.get("/checkUser", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ exists: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
