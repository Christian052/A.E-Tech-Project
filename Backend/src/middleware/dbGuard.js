const { isDbConnected } = require("../config/db");

// Guards routes that require an active MongoDB connection.
// Returns 503 instead of hanging/crashing when the DB is briefly unreachable,
// satisfying the "graceful degradation" non-functional requirement.
function dbGuard(req, res, next) {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again shortly.",
    });
  }
  next();
}

module.exports = dbGuard;
