const rateLimit = require("express-rate-limit");

/**
 * Standard configuration to prevent reverse-proxy validation warnings
 * and provide clean JSON error payloads.
 */
const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
};

/**
 * Global API rate limiter:
 * Applies to all /api routes to prevent brute-force attacks and volumetric abuse.
 * 300 requests per 15-minute window per IP.
 */
const globalApiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP address. Please slow down and try again later.",
  },
});

/**
 * Auth Login Limiter:
 * 10 attempts per 15 minutes to defend against credential stuffing.
 */
const authLoginLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes before trying again.",
  },
});

/**
 * Auth Refresh Limiter:
 * 60 token refresh requests per 15 minutes.
 */
const authRefreshLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many authentication refresh requests. Please re-authenticate.",
  },
});

/**
 * Public Form Submission Limiter (Contact & Course Application):
 * 10 submissions per 15 minutes per IP to prevent spam bots.
 */
const publicSubmissionLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many form submissions. Please wait a few minutes before submitting again.",
  },
});

/**
 * Upload Limiter:
 * 25 file uploads per 15 minutes to prevent Cloudinary/storage exhaustion.
 */
const uploadLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "Upload rate limit exceeded. Please wait before uploading more files.",
  },
});

/**
 * User Management & Password Mutation Limiter:
 * 25 mutation actions per 15 minutes.
 */
const userMutationLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "Account modification rate limit reached. Please try again shortly.",
  },
});

module.exports = {
  globalApiLimiter,
  authLoginLimiter,
  authRefreshLimiter,
  publicSubmissionLimiter,
  uploadLimiter,
  userMutationLimiter,
};
