import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        selectedOptions: [Number], // Array of selected option indices
        textAnswer: String, // For fill-blank questions
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // in seconds
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuizAttemptSchema.index({ quiz: 1, user: 1 });
QuizAttemptSchema.index({ user: 1 });
QuizAttemptSchema.index({ completedAt: -1 });

// Compound index for finding user's attempts on a specific quiz
QuizAttemptSchema.index({ quiz: 1, user: 1, attemptNumber: 1 });

export default mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", QuizAttemptSchema);
