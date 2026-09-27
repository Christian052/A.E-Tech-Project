/**
 * Row-Level Security (RLS) & Document Access Control Middleware
 * Enforces granular document-level permissions, role hierarchy,
 * self-modification constraints, and destructive action safeguards.
 */

const RESERVED_SUPERADMIN_EMAIL = (
  process.env.SUPERADMIN_EMAIL || "doctorshavu@gmail.com"
).toLowerCase().trim();

/**
 * Role hierarchy levels for row-level permissions:
 * super-admin (3) > admin (2) > editor (1) > viewer (0)
 */
const ROLE_WEIGHTS = {
  superadmin: 3,
  "super-admin": 3,
  "super_admin": 3,
  admin: 2,
  administrator: 2,
  editor: 1,
  viewer: 0,
};

function normalizeRole(role) {
  if (!role) return "viewer";
  const cleaned = String(role).toLowerCase().trim().replace(/[-_ ]/g, "");
  if (cleaned.startsWith("super")) return "super-admin";
  if (cleaned.startsWith("admin")) return "admin";
  if (cleaned.startsWith("edit")) return "editor";
  return cleaned;
}

function getRoleWeight(role, email = "") {
  if (email && email.toLowerCase().trim() === RESERVED_SUPERADMIN_EMAIL) {
    return 3;
  }
  if (!role) return 0;
  const cleaned = String(role).toLowerCase().trim().replace(/[-_ ]/g, "");
  if (cleaned.startsWith("super")) return 3;
  if (cleaned.startsWith("admin")) return 2;
  if (cleaned.startsWith("edit")) return 1;
  return ROLE_WEIGHTS[cleaned] ?? 0;
}

/**
 * Enforce Row-Level Security on User Documents
 * - Prevents self-deletion (locking oneself out)
 * - Prevents editing/deleting reserved bootstrap super-admin
 * - Prevents horizontal/vertical privilege escalation beyond caller's tier
 */
function enforceUserRLS(action = "update") {
  return (req, res, next) => {
    const callerId = req.user?.sub;
    const callerEmail = (req.user?.email || "").toLowerCase().trim();
    const callerRole = req.user?.role;
    const callerWeight = getRoleWeight(callerRole, callerEmail);
    const targetId = req.params.id;

    // 1. Prevent self-deletion
    if (action === "delete" && callerId && targetId && String(callerId) === String(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Row-Level Security: You cannot delete your own account.",
      });
    }

    // 2. Prevent vertical privilege escalation: caller cannot assign a role higher than their own
    if (req.body && req.body.role) {
      const requestedRole = req.body.role;
      const requestedWeight = getRoleWeight(requestedRole);

      // Caller cannot assign a role higher than their own tier (e.g. admin cannot assign super-admin)
      if (requestedWeight > callerWeight) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You cannot assign a role higher than your own.",
        });
      }
    }

    // 3. Prevent self role/status modification for non-superadmins
    if (action === "update" && callerId && targetId && String(callerId) === String(targetId) && callerWeight < 3) {
      if (req.body.role && normalizeRole(req.body.role) !== normalizeRole(callerRole)) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You cannot change your own role.",
        });
      }
      if (req.body.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "Row-Level Security: You cannot deactivate your own account.",
        });
      }
    }

    next();
  };
}

/**
 * Guard against modifying or deleting the reserved root account
 */
function protectReservedSuperAdmin(targetUser) {
  if (!targetUser) return false;
  const email = (targetUser.email || "").toLowerCase().trim();
  const role = normalizeRole(targetUser.role);
  return (
    email === RESERVED_SUPERADMIN_EMAIL ||
    role === "super-admin"
  );
}

function isReservedSuperAdmin(targetUser) {
  if (!targetUser) return false;
  const email = (targetUser.email || "").toLowerCase().trim();
  return email === RESERVED_SUPERADMIN_EMAIL;
}

/**
 * Enforce Row-Level Deletion Security
 * Restricts hard-deletes of inquiries, applications, and core catalog items
 * strictly to admin and super-admin roles.
 */
function enforceRowDeletionSecurity(req, res, next) {
  const callerWeight = getRoleWeight(req.user?.role, req.user?.email);
  if (callerWeight >= 2) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Row-Level Security: Deleting records requires administrator privileges.",
  });
}

/**
 * Sanitize user document before transmitting over the wire
 * Ensures password hash, salt, tokens, and internal DB flags are never leaked.
 */
function sanitizeUserRow(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : { ...user };
  delete doc.passwordHash;
  delete doc.password;
  delete doc.__v;
  delete doc.tokens;
  delete doc.refreshToken;
  return doc;
}

module.exports = {
  enforceUserRLS,
  protectReservedSuperAdmin,
  isReservedSuperAdmin,
  enforceRowDeletionSecurity,
  sanitizeUserRow,
  getRoleWeight,
  normalizeRole,
  RESERVED_SUPERADMIN_EMAIL,
};
