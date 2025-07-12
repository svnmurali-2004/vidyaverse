import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: [
            "multiple-choice",
            "single-choice",
            "true-false",
            "fill-blank",
          ],
          default: "single-choice",
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        correctAnswer: String, // For fill-blank questions
        explanation: String,
        points: {
          type: Number,
          default: 1,
        },
      },
    ],
    timeLimit: {
      type: Number, // in minutes
      default: 30,
    },
    passingScore: {
      type: Number,
      default: 70, // percentage
    },
    attempts: {
      type: Number,
      default: 3, // maximum attempts allowed
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points
QuizSchema.virtual("totalPoints").get(function () {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Indexes
QuizSchema.index({ course: 1 });
QuizSchema.index({ lesson: 1 });
QuizSchema.index({ createdBy: 1 });

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
