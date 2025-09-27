import mongoose from "mongoose";

const dsaProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedProblems: [
      {
        problemId: {
          type: String,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        categoryIndex: Number,
        problemIndex: Number,
      },
    ],
    totalProblems: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
dsaProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
dsaProgressSchema.index({ user: 1, course: 1 });

export default mongoose.models.DsaProgress ||
  mongoose.model("DsaProgress", dsaProgressSchema);
