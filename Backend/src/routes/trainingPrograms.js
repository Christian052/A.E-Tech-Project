const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const TrainingProgram = require("../models/TrainingProgram");

// Safely import auth middleware (use requireRole or optional chaining)
const authMiddleware = require("../middleware/auth");
const requireAuth = authMiddleware.requireAuth;
const requireRole = authMiddleware.requireRole;
const dbGuard = require("../middleware/dbGuard");

const router = express.Router();

// Middleware to catch express-validator errors cleanly
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      message: errors.array().map((e) => e.msg).join(", "),
    });
  }
  next();
};

// Reusable custom validation rule for imageUrl
const imageUrlRule = body("imageUrl")
  .optional({ checkFalsy: true })
  .custom((value) => {
    if (!value) return true;
    
    const isFullUrl = /^https?:\/\//i.test(value);
    // Flexible regex supporting optional leading slash and various asset folders
    const isRelativePath = /^\/?(uploads|images|static|assets)\//i.test(value);

    if (!isFullUrl && !isRelativePath) {
      throw new Error("Image URL must be a valid HTTP(S) URL or local upload path");
    }
    return true;
  });

// Validation rules for POST (creation)
const createTrainingProgramValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("durationWeeks")
    .isInt({ min: 1 })
    .withMessage("Duration (weeks) must be a positive integer"),
  body("seatsAvailable")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Seats available must be 0 or greater"),
  imageUrlRule,
];

// Validation rules for PATCH (updates)
const updateTrainingProgramValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("durationWeeks")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("seatsAvailable")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Seats available must be 0 or greater"),
  imageUrlRule,
];

// GET /api/training-programs - public (?all=true returns inactive programs)
router.get("/", async (req, res, next) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const programs = await TrainingProgram.find(filter).sort({ startDate: 1 });
    res.status(200).json({ programs });
  } catch (err) {
    next(err);
  }
});

// GET /api/training-programs/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const program = await TrainingProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });
    res.status(200).json({ program });
  } catch (err) {
    next(err);
  }
});

// POST /api/training-programs - admin/editor
router.post(
  "/",
  ...(requireAuth ? [requireAuth] : []),
  ...(requireRole ? [requireRole("admin", "editor")] : []),
  createTrainingProgramValidation,
  validate,
  async (req, res, next) => {
    try {
      const program = await TrainingProgram.create(req.body);
      res.status(201).json({ program });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/training-programs/:id - admin/editor
router.patch(
  "/:id",
  ...(requireAuth ? [requireAuth] : []),
  ...(requireRole ? [requireRole("admin", "editor")] : []),
  updateTrainingProgramValidation,
  validate,
  async (req, res, next) => {
    try {
      const program = await TrainingProgram.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!program) return res.status(404).json({ success: false, message: "Program not found" });
      res.status(200).json({ program });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/training-programs/:id - admin
router.delete(
  "/:id",
  ...(requireAuth ? [requireAuth] : []),
  ...(requireRole ? [requireRole("admin")] : []),
  async (req, res, next) => {
    try {
      const program = await TrainingProgram.findByIdAndDelete(req.params.id);
      if (!program) return res.status(404).json({ success: false, message: "Program not found" });
      res.status(200).json({ success: true, message: "Program deleted" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;