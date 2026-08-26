const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const path = require("path");

const supabase = require("../config/supabase");
const GalleryItem = require("../models/GalleryItem");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/* =========================================================
   MULTER CONFIGURATION (MEMORY STORAGE FOR SUPABASE)
========================================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, or WEBP images are allowed")
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   GET /api/gallery
   PUBLIC
========================================================= */

router.get("/", dbGuard, async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/* =========================================================
   POST /api/gallery
   ADMIN / EDITOR

   Uploads image directly to Supabase Storage ('gallery' bucket)
   and stores the public URL in MongoDB.
========================================================= */

router.post(
  "/",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),
  upload.single("image"),

  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required"),
  ],

  async (req, res, next) => {
    try {
      /* ---------------------------------------------------
         VALIDATION
      --------------------------------------------------- */
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
          })),
        });
      }

      let imageUrl = req.body.imageUrl;

      /* ---------------------------------------------------
         UPLOAD TO SUPABASE STORAGE
      --------------------------------------------------- */
      if (req.file) {
        // Create a unique filename: timestamp-originalfilename
        const ext = path.extname(req.file.originalname);
        const fileBaseName = path.basename(req.file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `${Date.now()}_${fileBaseName}${ext}`;

        const { data, error } = await supabase.storage
          .from("gallery")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) {
          throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Generate the Public URL
        const { data: publicUrlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "An image file or imageUrl is required",
        });
      }

      /* ---------------------------------------------------
         CREATE GALLERY ITEM IN MONGODB
      --------------------------------------------------- */
      const item = await GalleryItem.create({
        title: req.body.title.trim(),
        category: req.body.category?.trim() || "General",
        imageUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Gallery item uploaded successfully",
        item,
      });
    } catch (err) {
      console.error("Gallery upload error:", err);
      next(err);
    }
  }
);

/* =========================================================
   DELETE /api/gallery/:id

   Deletes:
   1. Image file from Supabase Storage
   2. Gallery record from MongoDB
========================================================= */

router.delete(
  "/:id",
  dbGuard,
  requireAuth,
  requireRole("admin", "editor"),

  async (req, res, next) => {
    try {
      /* ---------------------------------------------------
         FIND ITEM
      --------------------------------------------------- */
      const item = await GalleryItem.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Gallery item not found",
        });
      }

      /* ---------------------------------------------------
         DELETE IMAGE FROM SUPABASE STORAGE
      --------------------------------------------------- */
      if (item.imageUrl) {
        try {
          // Extract file path from Supabase public URL
          // URL format: .../object/public/gallery/filename.jpg
          const urlParts = item.imageUrl.split("/gallery/");
          if (urlParts.length > 1) {
            const filePath = urlParts[1];

            console.log("Deleting Supabase image:", filePath);

            const { error: storageError } = await supabase.storage
              .from("gallery")
              .remove([filePath]);

            if (storageError) {
              console.error("Supabase Storage delete error:", storageError.message);
            }
          }
        } catch (supabaseErr) {
          console.error("Error extracting/deleting Supabase image:", supabaseErr);
        }
      }

      /* ---------------------------------------------------
         DELETE MONGODB RECORD
      --------------------------------------------------- */
      await GalleryItem.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Gallery item deleted successfully",
      });
    } catch (err) {
      console.error("Gallery delete error:", err);
      next(err);
    }
  }
);

module.exports = router;