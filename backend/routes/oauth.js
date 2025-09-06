import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

// Start Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=UserNotFound`,
  }),
  (req, res) => {
    // ✅ Redirect to frontend dashboard after success
    res.redirect(`${process.env.FRONTEND_URL}/resumes`);
  }
);

// Logout user
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

export default router;
