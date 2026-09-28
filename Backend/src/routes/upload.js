const express = require("express");
const multer = require("multer");
const { uploadFileStream } = require("../utils/fileUploader");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uploadLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Memory storage keeps file in buffer so we can stream to providers or disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/svg+xml",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, and SVG images are allowed"), false);
    }
  },
});

// Middleware to capture multer-specific errors (file size, format, etc.) cleanly
const handleMulterUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds the 10MB limit.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file uploaded.",
      });
    }
    next();
  });
};

// POST /api/upload - Staff accounts with rate limiting
router.post(
  "/",
  uploadLimiter,
  requireAuth,
  requireRole("admin", "editor"),
  handleMulterUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided for upload.",
        });
      }

      const fileUrl = await uploadFileStream(req.file, "uploads");

      return res.status(200).json({
        success: true,
        url: fileUrl,
        imageUrl: fileUrl,
      });
    } catch (err) {
      console.error("[upload] Fatal upload failure:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to process image upload.",
      });
    }
  }
);

module.exports = router;