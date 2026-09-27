/**
 * Row-Level Security (RLS) & Document Access Control Middleware
 * Enforces granular document-level permissions, role hierarchy,
 * self-modification constraints, and destructive action safeguards.
 */

const RESERVED_SUPERADMIN_EMAIL = (
  process.env.SUPERADMIN_EMAIL || "doctorshavu@gmail.com"
).toLowerCase();

/**
 * Role hierarchy levels for row-level permissions:
 * super-admin (3) > admin (2) > editor (1) > viewer (0)
 */
const ROLE_WEIGHTS = {
  "super-admin": 3,
  superadmin: 3,
  admin: 2,
  editor: 1,
  viewer: 0,
};

function getRoleWeight(role) {
  if (!role) return 0;
  return ROLE_WEIGHTS[role.toLowerCase()] ?? 0;
}

/**
 * Enforce Row-Level Security on User Documents
 * - Prevents self-deletion (locking oneself out)
 * - Prevents editing/deleting reserved bootstrap super-admin
 * - Prevents horizontal privilege escalation (e.g., standard admin modifying a super-admin)
 * - Prevents vertical privilege escalation (assigning a role higher than one's own)
 */
function enforceUserRLS(action = "update") {
  return (req, res, next) => {
    const callerId = req.user?.sub;
    const callerRole = req.user?.role?.toLowerCase();
    const callerWeight = getRoleWeight(callerRole);
    const targetId = req.params.id;

    // 1. Prevent self-deletion
    if (action === "delete" && callerId && targetId && callerId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Row-Level Security: You cannot delete your own account.",
      });
    }

    // 2. Prevent role escalation if role is being assigned
    if (req.body && req.body.role) {
      const requestedRole = req.body.role.toLowerCase();
      const requestedWeight = getRoleWeight(requestedRole);

      // Only super-admin can create/promote to admin or super-admin
      if (requestedWeight >= callerWeight && callerWeight < 3) {
        return res.status(403).json({
          success: false,
          message: "Row-Level Security: You cannot assign a role equal to or higher than your own.",
        });
      }
    }

    // 3. Prevent self role/status modification for non-superadmins
    if (action === "update" && callerId === targetId && callerWeight < 3) {
      if (req.body.role && req.body.role.toLowerCase() !== callerRole) {
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
  const email = (targetUser.email || "").toLowerCase();
  const role = (targetUser.role || "").toLowerCase();
  return (
    email === RESERVED_SUPERADMIN_EMAIL ||
    role === "super-admin" ||
    role === "superadmin"
  );
}

/**
 * Enforce Row-Level Deletion Security
 * Restricts hard-deletes of inquiries, applications, and core catalog items
 * strictly to admin and super-admin roles.
 */
function enforceRowDeletionSecurity(req, res, next) {
  const role = req.user?.role?.toLowerCase();
  if (role === "admin" || role === "super-admin" || role === "superadmin") {
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
  enforceRowDeletionSecurity,
  sanitizeUserRow,
  getRoleWeight,
  RESERVED_SUPERADMIN_EMAIL,
};
