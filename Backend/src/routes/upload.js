const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const supabase = require("../config/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uploadLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Setup Cloudinary if credentials exist
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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

/**
 * Resilient multi-tier upload dispatcher:
 * 1. Cloudinary (if configured)
 * 2. Supabase Storage (if configured)
 * 3. Local disk fallback (always available)
 */
async function uploadFileStream(file) {
  const ext = path.extname(file.originalname) || ".jpg";
  const cleanBase = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${Date.now()}_${cleanBase}${ext}`;

  // 1. Try Cloudinary if configured
  if (hasCloudinary) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "augu_smart_uploads",
            public_id: `${Date.now()}_${cleanBase}`,
            resource_type: "image",
          },
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );
        stream.end(file.buffer);
      });

      if (result && (result.secure_url || result.url)) {
        return result.secure_url || result.url;
      }
    } catch (cErr) {
      console.warn("[upload] Cloudinary upload failed, falling back:", cErr.message);
    }
  }

  // 2. Try Supabase Storage if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
      const bucket = "gallery";
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (sErr) {
      console.warn("[upload] Supabase upload failed, falling back to disk:", sErr.message);
    }
  }

  // 3. Fallback: Save directly to server disk storage
  const primaryUploadsDir = path.join(__dirname, "..", "uploads");
  const publicUploadsDir = path.join(__dirname, "..", "..", "Frontend", "public", "uploads");

  const targetDirs = [primaryUploadsDir, publicUploadsDir];

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, fileName), file.buffer);
    } catch (err) {
      // Ignore individual write issues if at least one dir succeeds
    }
  }

  return `/uploads/${fileName}`;
}

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

      const fileUrl = await uploadFileStream(req.file);

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