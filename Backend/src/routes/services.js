const express = require("express");
const { body, validationResult } = require("express-validator");
const Service = require("../models/Service");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole, requireIfAll } = require("../middleware/auth");

const router = express.Router();

// GET /api/services - public (?all=true + admin auth returns inactive services too)
router.get("/", dbGuard, requireIfAll("admin", "editor"), async (req, res, next) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ order: 1 });
    res.status(200).json({ services });
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:slug - public
router.get("/:slug", dbGuard, async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.status(200).json({ service });
  } catch (err) {
    next(err);
  }
});

// POST /api/services - admin
router.post(
  "/",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  [
    body("slug").trim().notEmpty().withMessage("Slug is required"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("shortDescription").trim().notEmpty().withMessage("Short description is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }
      const service = await Service.create(req.body);
      res.status(201).json({ service });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/services/:id - admin
router.patch("/:id", dbGuard, requireAuth, requireRole("admin", "editor"), async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.status(200).json({ service });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/services/:id - admin
router.delete("/:id", dbGuard, requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.status(200).json({ success: true, message: "Service deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
