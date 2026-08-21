const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const Inquiry = require("../models/Inquiry");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");
const { notifyAdmin } = require("../config/mailer");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| POST /api/contact
|--------------------------------------------------------------------------
| Public contact form
*/
router.post(
  "/",
  dbGuard,
  contactLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),

    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Email must be valid"),

    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required"),

    body("website").optional(),
  ],
  async (req, res, next) => {
    try {
      // Honeypot spam protection
      if (req.body.website) {
        return res.status(201).json({
          success: true,
          message: "Thanks! We'll contact you within 24 hours.",
        });
      }

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

      const {
        name,
        phone,
        email,
        serviceInterest,
        message,
      } = req.body;

      const inquiry = await Inquiry.create({
        name,
        phone,
        email,
        serviceInterest,
        message,
      });

      notifyAdmin(
        "New website inquiry - AUGU SMART ELECTRONIC SERVICE",
        `New inquiry from ${name} (${phone}${
          email ? ", " + email : ""
        })
Service interest: ${serviceInterest || "n/a"}

${message}`
      );

      return res.status(201).json({
        success: true,
        message: "Thanks! We'll contact you within 24 hours.",
        inquiryId: inquiry._id,
      });
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/contact/inquiries
|--------------------------------------------------------------------------
| Admin/editor only
*/
router.get(
  "/inquiries",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res, next) => {
    try {
      const { status } = req.query;

      const filter = status && status !== "all"
        ? { status }
        : {};

      const inquiries = await Inquiry.find(filter)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        inquiries,
      });
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| PATCH /api/contact/inquiries/:id
|--------------------------------------------------------------------------
| Update inquiry status
*/
router.patch(
  "/inquiries/:id",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["unread", "read", "responded"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const inquiry = await Inquiry.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Inquiry status updated successfully",
        inquiry,
      });
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/contact/inquiries/:id
|--------------------------------------------------------------------------
| Delete inquiry
*/
router.delete(
  "/inquiries/:id",
  dbGuard,
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Inquiry deleted successfully",
        inquiryId: inquiry._id,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
