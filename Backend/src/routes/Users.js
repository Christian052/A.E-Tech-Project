const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth } = require("../middleware/auth"); // Removed requireSuperAdmin import requirement

const router = express.Router();

// The bootstrap super-admin account is identified by this reserved email.
// It can never be created, edited, demoted, or deleted through the API -
// only ever seeded directly via `npm run seed`.
const RESERVED_SUPERADMIN_EMAIL = (process.env.SUPERADMIN_EMAIL || "doctorshavu@gmail.com").toLowerCase();

// Middleware to ensure the authenticated user is either an 'admin' or 'super-admin'
const requireAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role === "admin" || role === "super-admin" || role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden: Access restricted to administrators" });
};

// Require authentication and admin privileges across all routes in this router
router.use(dbGuard, requireAuth, requireAdminOrSuperAdmin);

function toSafeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

// GET /api/users - list all staff accounts, except the reserved super-admin and any super-admin role
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({
      email: { $ne: RESERVED_SUPERADMIN_EMAIL },
      role: { $nin: ["super-admin", "superadmin"] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ users: users.map(toSafeUser) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users - create a new admin/editor account
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role").isIn(["admin", "editor"]).withMessage("Role must be admin or editor"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }

      const email = req.body.email.toLowerCase();
      if (email === RESERVED_SUPERADMIN_EMAIL) {
        return res.status(400).json({ success: false, message: "This email address is reserved" });
      }

      const passwordHash = await User.hashPassword(req.body.password);
      const user = await User.create({
        name: req.body.name,
        email,
        passwordHash,
        role: req.body.role,
        isActive: true,
      });

      res.status(201).json({ user: toSafeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id - update name/email/role/active status
router.patch(
  "/:id",
  [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("role").optional().isIn(["admin", "editor"]).withMessage("Role must be admin or editor"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }

      const target = await User.findById(req.params.id);
      if (
        !target ||
        target.email === RESERVED_SUPERADMIN_EMAIL ||
        target.role === "super-admin" ||
        target.role === "superadmin"
      ) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const { name, email, role, isActive } = req.body;
      if (email && email.toLowerCase() === RESERVED_SUPERADMIN_EMAIL) {
        return res.status(400).json({ success: false, message: "This email address is reserved" });
      }

      if (name !== undefined) target.name = name;
      if (email !== undefined) target.email = email.toLowerCase();
      if (role !== undefined) target.role = role;
      if (isActive !== undefined) target.isActive = isActive;

      await target.save();
      res.status(200).json({ user: toSafeUser(target) });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id/password - reset a user's password
router.patch(
  "/:id/password",
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }

      const target = await User.findById(req.params.id);
      if (
        !target ||
        target.email === RESERVED_SUPERADMIN_EMAIL ||
        target.role === "super-admin" ||
        target.role === "superadmin"
      ) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      target.passwordHash = await User.hashPassword(req.body.password);
      await target.save();
      res.status(200).json({ success: true, message: "Password updated" });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id - remove a staff account
router.delete("/:id", async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (
      !target ||
      target.email === RESERVED_SUPERADMIN_EMAIL ||
      target.role === "super-admin" ||
      target.role === "superadmin"
    ) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await target.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;