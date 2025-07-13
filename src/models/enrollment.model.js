import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    progress: { type: Number, default: 0, min: 0, max: 100 }, // Completion percentage
    lastAccessed: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },
    enrolledAt: { type: Date, default: Date.now }, // Changed from enrollmentDate to match API usage
    certificateIssued: { type: Boolean, default: false },
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

// Add indexes for better performance
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", enrollmentSchema);
