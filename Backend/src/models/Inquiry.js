const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    serviceInterest: { type: String, trim: true, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["unread", "read", "responded"],
      default: "unread",
    },
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
