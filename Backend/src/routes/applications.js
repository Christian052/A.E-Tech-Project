const express = require("express");
const { body, validationResult } = require("express-validator");

const Application = require("../models/Application");
const TrainingProgram = require("../models/TrainingProgram");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");
const { notifyAdmin } = require("../config/mailer");
const { publicSubmissionLimiter } = require("../middleware/rateLimiters");
const { enforceRowDeletionSecurity } = require("../middleware/rls");

const router = express.Router();

// ============================================================
// POST /api/applications
// Public - Submit application
// ============================================================

router.post(
  "/",
  dbGuard,
  publicSubmissionLimiter,
  [
    body("programId")
      .notEmpty()
      .withMessage("Program is required"),

    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),

    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Email must be valid"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => ({
            field: e.path,
            message: e.msg,
          })),
        });
      }

      // Check if training program exists
      const program = await TrainingProgram.findById(req.body.programId);

      if (!program) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              field: "programId",
              message: "Selected program does not exist",
            },
          ],
        });
      }

      // Create application
      const application = await Application.create(req.body);

      // Notify administrator
      notifyAdmin(
        "New training/internship application",
        `New application from ${req.body.fullName} (${req.body.phone}) for "${program.title}"\n\n${
          req.body.message || ""
        }`
      );

      return res.status(201).json({
        success: true,
        message: "Application received! We'll be in touch soon.",
        applicationId: application._id,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// GET /api/applications
// Admin / Editor - Get applications
// ============================================================

router.get(
  "/",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res, next) => {
    try {
      const { status } = req.query;

      const filter = status ? { status } : {};

      const applications = await Application.find(filter)
        .populate("programId", "title")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        applications,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// PATCH /api/applications/:id
// Admin / Editor - Update application status
// ============================================================

router.patch(
  "/:id",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "new",
        "reviewed",
        "accepted",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Application status updated successfully",
        application,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// DELETE /api/applications/:id
// Admin only - Delete application (Row-Level Security protected)
// ============================================================

router.delete(
  "/:id",
  dbGuard,
  requireAuth,
  enforceRowDeletionSecurity,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const application = await Application.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      await Application.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Application deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;