const express = require("express");
const { body, validationResult } = require("express-validator");
const Testimonial = require("../models/Testimonial");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/testimonials - public
router.get("/", dbGuard, async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json({ testimonials });
  } catch (err) {
    next(err);
  }
});

// POST /api/testimonials - admin
router.post(
  "/",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  [body("name").trim().notEmpty(), body("quote").trim().notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }
      const testimonial = await Testimonial.create(req.body);
      res.status(201).json({ testimonial });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/testimonials/:id - admin
router.delete("/:id", dbGuard, requireAuth, requireRole("admin", "editor"), async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
