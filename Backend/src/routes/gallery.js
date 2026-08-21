const express = require("express");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");
const GalleryItem = require("../models/GalleryItem");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Local disk storage fallback (swap for a Cloudinary storage engine in production).
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "..", "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPEG, PNG, or WEBP images are allowed"), ok);
  },
});

// GET /api/gallery - public
router.get("/", dbGuard, async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/gallery - admin, with optional file upload
router.post(
  "/",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  upload.single("image"),
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
      if (!imageUrl) {
        return res.status(400).json({ success: false, message: "An image file or imageUrl is required" });
      }
      const item = await GalleryItem.create({ title: req.body.title, category: req.body.category, imageUrl });
      res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/gallery/:id - admin
router.delete("/:id", dbGuard, requireAuth, requireRole("admin", "editor"), async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
