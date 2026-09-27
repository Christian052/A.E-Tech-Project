const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth } = require("../middleware/auth");
const { authLoginLimiter, authRefreshLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_ACCESS_SECRET || "augu-smart-access-secret-2026",
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_REFRESH_SECRET || "augu-smart-refresh-secret-2026",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    }
  );
}

function setRefreshCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("refreshToken", token, {
    httpOnly: true,
    // Cross-domain cookies (Vercel -> Render) REQUIRE sameSite: "none" and secure: true
    secure: isProduction || true, 
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

// POST /api/auth/login
router.post(
  "/login",
  dbGuard,
  authLoginLimiter,
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty().withMessage("Password is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);
      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh
router.post("/refresh", dbGuard, authRefreshLimiter, async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "augu-smart-refresh-secret-2026");
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const accessToken = signAccessToken(user);
    res.status(200).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
});

// GET /api/auth/me - restore active session
router.get("/me", dbGuard, requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    path: "/api/auth",
    secure: isProduction || true,
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

module.exports = router;