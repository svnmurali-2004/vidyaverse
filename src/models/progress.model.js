import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    watchedDuration: {
      type: Number, // Duration watched in seconds
      default: 0,
    },
    totalDuration: {
      type: Number, // Total lesson duration in seconds
      default: 0,
    },
    quizScore: {
      type: Number,
      default: null,
    },
    quizAttempts: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique progress per user per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, courseId: 1 });

export default mongoose.models.Progress || mongoose.model("Progress", progressSchema);
