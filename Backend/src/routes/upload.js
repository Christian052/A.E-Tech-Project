const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const router = express.Router();

// 1. Configure Cloudinary credentials from process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "aetech_uploads", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `img-${uniqueSuffix}`;
    },
  },
});

// 3. Keep your original File Filter and Size Limits
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

// 4. POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided" });
  }

  // req.file.path contains the secure Cloudinary HTTPS URL
  const cloudinaryUrl = req.file.path;

  res.status(200).json({
    success: true,
    url: cloudinaryUrl,
    imageUrl: cloudinaryUrl,
    relativePath: cloudinaryUrl, // Preserving your original response structure
  });
});

module.exports = router;