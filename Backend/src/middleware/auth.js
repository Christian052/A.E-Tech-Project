const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { sub, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Fixed case-insensitivity and standard role inheritance
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    // Allow explicit matching OR allow super-admin everywhere
    if (!normalizedRoles.includes(userRole) && userRole !== "super-admin") {
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