const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 220 },
    fullDescription: { type: String, default: "" },
    icon: { type: String, default: "" },
    images: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });

module.exports = mongoose.model("Service", serviceSchema);
