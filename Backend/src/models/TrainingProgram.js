const mongoose = require("mongoose");

const trainingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    durationWeeks: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 week"],
      default: 4,
    },
    seatsAvailable: {
      type: Number,
      default: 0,
      min: [0, "Seats cannot be negative"],
    },
    startDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty strings/undefined
          if (!v || v.trim() === "") return true;
          // Allow full URLs OR relative uploaded paths starting with /uploads
          return /^(https?:\/\/|\/uploads\/)/i.test(v);
        },
        message: "Image URL must be a valid HTTP(S) URL or a relative /uploads/ path",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);