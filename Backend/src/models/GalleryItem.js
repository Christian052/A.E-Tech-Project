const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    category: { type: String, default: "general", trim: true },
  },
  { timestamps: true }
);

galleryItemSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
