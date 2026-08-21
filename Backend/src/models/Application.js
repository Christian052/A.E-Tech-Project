const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingProgram", required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewed", "accepted", "rejected"],
      default: "new",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ programId: 1 });

module.exports = mongoose.model("Application", applicationSchema);
