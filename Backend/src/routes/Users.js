const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth } = require("../middleware/auth");
const { userMutationLimiter } = require("../middleware/rateLimiters");
const {
  enforceUserRLS,
  protectReservedSuperAdmin,
  isReservedSuperAdmin,
  sanitizeUserRow,
  getRoleWeight,
  RESERVED_SUPERADMIN_EMAIL,
} = require("../middleware/rls");

const router = express.Router();

// Middleware to ensure caller is authenticated and at least an 'admin' (tier >= 2)
const requireAdminOrSuperAdmin = (req, res, next) => {
  const weight = getRoleWeight(req.user?.role, req.user?.email);
  if (weight >= 2) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Row-Level Security: Access restricted to administrators.",
  });
};

// Require database ready, auth, and admin-level privileges across this router
router.use(dbGuard, requireAuth, requireAdminOrSuperAdmin);

// =========================================================================
// GET /api/users - List staff accounts
// Row-Level Security: Caller only sees accounts at or below their tier.
// The root superadmin bootstrap account is never exposed in general staff lists.
// =========================================================================
router.get("/", async (req, res, next) => {
  try {
    const callerWeight = getRoleWeight(req.user?.role, req.user?.email);

    // Super-admins see all staff; Admins only see accounts at or below their tier
    const query = {
      email: { $ne: RESERVED_SUPERADMIN_EMAIL },
    };

    if (callerWeight < 3) {
      query.role = { $nin: ["super-admin", "superadmin", "super_admin"] };
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ users: users.map(sanitizeUserRow) });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// POST /api/users - Create new staff account
// Row-Level Security & Rate Limiting:
// - Rate limited to prevent mass account generation
// - Enforces role hierarchy (Admins can create admin or editor; Super-admins can create any tier)
// =========================================================================
router.post(
  "/",
  userMutationLimiter,
  enforceUserRLS("create"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role").optional().isIn(["admin", "editor", "super-admin", "superadmin"]).withMessage("Role must be admin or editor"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }

      const email = req.body.email.toLowerCase().trim();
      if (email === RESERVED_SUPERADMIN_EMAIL) {
        return res.status(400).json({
          success: false,
          message: "Row-Level Security: This email address is reserved.",
        });
      }

      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A staff account with this email address already exists.",
        });
      }

      const passwordHash = await User.hashPassword(req.body.password);
      const user = await User.create({
        name: req.body.name.trim(),
        email,
        passwordHash,
        role: req.body.role || "admin",
        isActive: true,
      });

      res.status(201).json({ user: sanitizeUserRow(user) });
    } catch (err) {
      next(err);
    }
  }
);

// =========================================================================
// PATCH /api/users/:id - Update staff account details
// Row-Level Security:
// - Prevents updating protected superadmin accounts by lower tiers
// - Prevents assigning higher role than caller's role
// =========================================================================
router.patch(
  "/:id",
  userMutationLimiter,
  enforceUserRLS("update"),
  [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("role").optional().isIn(["admin", "editor", "super-admin", "superadmin"]).withMessage("Role must be admin or editor"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }

      const target = await User.findById(req.params.id);
      if (!target) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const callerWeight = getRoleWeight(req.user?.role, req.user?.email);
      const targetWeight = getRoleWeight(target.role, target.email);

      // Caller cannot modify a user with a higher role, or a peer superadmin (unless caller is root superadmin)
      if (targetWeight > callerWeight || (protectReservedSuperAdmin(target) && callerWeight < 3)) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You do not have permission to modify this user record.",
        });
      }

      const { name, email, role, isActive } = req.body;
      if (email && email.toLowerCase().trim() === RESERVED_SUPERADMIN_EMAIL) {
        return res.status(400).json({
          success: false,
          message: "Row-Level Security: This email address is reserved.",
        });
      }

      if (name !== undefined) target.name = name.trim();
      if (email !== undefined) target.email = email.toLowerCase().trim();
      if (role !== undefined) target.role = role;
      if (isActive !== undefined) target.isActive = isActive;

      await target.save();
      res.status(200).json({ user: sanitizeUserRow(target) });
    } catch (err) {
      next(err);
    }
  }
);

// =========================================================================
// PATCH /api/users/:id/password - Reset staff password
// Row-Level Security:
// - Enforces target document access hierarchy
// =========================================================================
router.patch(
  "/:id/password",
  userMutationLimiter,
  enforceUserRLS("password"),
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }

      const target = await User.findById(req.params.id);
      if (!target) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const callerWeight = getRoleWeight(req.user?.role, req.user?.email);
      const targetWeight = getRoleWeight(target.role, target.email);

      if (targetWeight > callerWeight || (protectReservedSuperAdmin(target) && callerWeight < 3)) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You do not have permission to reset this user's password.",
        });
      }

      target.passwordHash = await User.hashPassword(req.body.password);
      await target.save();
      res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

// =========================================================================
// DELETE /api/users/:id - Delete staff account
// Row-Level Security:
// - Blocks self-deletion (enforced by enforceUserRLS)
// - Blocks deletion of reserved root superadmin
// - Blocks deletion of higher tier accounts
// =========================================================================
router.delete(
  "/:id",
  userMutationLimiter,
  enforceUserRLS("delete"),
  async (req, res, next) => {
    try {
      const target = await User.findById(req.params.id);
      if (!target) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (isReservedSuperAdmin(target)) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: The root super-admin account cannot be deleted.",
        });
      }

      const callerWeight = getRoleWeight(req.user?.role, req.user?.email);
      const targetWeight = getRoleWeight(target.role, target.email);

      // Caller cannot delete a user with a higher role.
      // If caller is an admin (tier 2), they can delete accounts within their management tier (editors),
      // while deleting other administrators requires super-admin privileges.
      if (targetWeight > callerWeight) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You cannot delete an account of higher privilege.",
        });
      }

      if (callerWeight < 3 && targetWeight >= 2) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: Deleting administrator accounts requires super-admin privileges. You can disable the account instead.",
        });
      }

      await target.deleteOne();
      res.status(200).json({ success: true, message: "User account deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
