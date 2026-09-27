const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "augu-smart-access-secret-2026");
    req.user = payload; // { sub, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

const RESERVED_SUPERADMIN_EMAIL = (
  process.env.SUPERADMIN_EMAIL || "doctorshavu@gmail.com"
).toLowerCase().trim();

// Fixed case-insensitivity and standard role inheritance
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const userRole = String(req.user.role).toLowerCase().trim().replace(/[-_ ]/g, "");
    const userEmail = (req.user.email || "").toLowerCase().trim();
    const isSuper = userRole === "superadmin" || userEmail === RESERVED_SUPERADMIN_EMAIL;

    const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/[-_ ]/g, ""));

    // Allow explicit matching OR allow super-admin everywhere
    if (!normalizedRoles.includes(userRole) && !isSuper) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
}

// Fixed conditional middleware execution for ?all=true
function requireIfAll(...roles) {
  const roleChecker = requireRole(...roles);
  
  return (req, res, next) => {
    if (req.query.all !== "true") return next();

    // Authenticate first, then check roles if authentication succeeds
    requireAuth(req, res, (err) => {
      if (err) return next(err);
      roleChecker(req, res, next);
    });
  };
}

function requireSuperAdmin(req, res, next) {
  return requireRole("super-admin")(req, res, next);
}

module.exports = { requireAuth, requireRole, requireIfAll, requireSuperAdmin };