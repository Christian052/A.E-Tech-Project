const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

// File filter (Images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided" });
  }

  // Construct full URL using host header
  const protocol = req.protocol;
  const host = req.get("host");
  const relativePath = `/uploads/${req.file.filename}`;
  const fullUrl = `${protocol}://${host}${relativePath}`;

  res.status(200).json({
    success: true,
    url: fullUrl,
    imageUrl: fullUrl,
    relativePath: relativePath,
  });
});

module.exports = router;