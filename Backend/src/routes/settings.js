const express = require("express");
const SiteSettings = require("../models/SiteSettings");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/settings - public
router.get("/", dbGuard, async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSingleton();
    res.status(200).json({ settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/settings - admin
router.patch("/", dbGuard, requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSingleton();
    Object.assign(settings, req.body);
    await settings.save();
    res.status(200).json({ settings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
