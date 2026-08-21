const logger = require("../config/logger");

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error-handling middleware.
// Maps Mongoose validation errors -> 400, JWT errors -> 401, everything else -> 500.
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let errors;

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token";
  }

  if (status >= 500) {
    logger.error(err.stack || err.message);
    message = process.env.NODE_ENV === "production" ? "Internal server error" : message;
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { notFound, errorHandler };
