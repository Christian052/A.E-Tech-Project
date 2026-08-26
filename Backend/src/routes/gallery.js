const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { body, validationResult } = require("express-validator");

const GalleryItem = require("../models/GalleryItem");
const dbGuard = require("../middleware/dbGuard");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/* =========================================================
   CLOUDINARY CONFIGURATION
========================================================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================================================
   CLOUDINARY STORAGE
========================================================= */

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "augu_smart_uploads/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
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

    const items = await GalleryItem.find(filter)
      .sort({ createdAt: -1 });

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

   Uploads image directly to Cloudinary and stores
   the Cloudinary URL in MongoDB.
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

      /* ---------------------------------------------------
         GET CLOUDINARY IMAGE URL
      --------------------------------------------------- */

      const imageUrl = req.file?.path || req.body.imageUrl;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "An image file or imageUrl is required",
        });
      }

      /* ---------------------------------------------------
         CREATE GALLERY ITEM
      --------------------------------------------------- */

      const item = await GalleryItem.create({
        title: req.body.title.trim(),

        category:
          req.body.category?.trim() || "General",

        imageUrl,
      });

      /* ---------------------------------------------------
         RESPONSE
      --------------------------------------------------- */

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
   1. Image from Cloudinary
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
         DELETE IMAGE FROM CLOUDINARY
      --------------------------------------------------- */

      if (item.imageUrl) {
        try {
          const imageUrl = item.imageUrl;

          const uploadIndex = imageUrl.indexOf("/upload/");

          if (uploadIndex !== -1) {
            let publicId = imageUrl.substring(
              uploadIndex + "/upload/".length
            );

            // Remove Cloudinary version
            publicId = publicId.replace(/^v\d+\//, "");

            // Remove image extension
            publicId = publicId.replace(/\.[^/.]+$/, "");

            console.log(
              "Deleting Cloudinary image:",
              publicId
            );

            await cloudinary.uploader.destroy(publicId);
          }
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary delete error:",
            cloudinaryError
          );

          /*
           * We don't stop MongoDB deletion if Cloudinary
           * deletion fails.
           */
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

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;