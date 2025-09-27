import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "video", "quiz", "dsa"],
      default: "text",
    },
    videoUrl: {
      type: String,
      required: function () {
        return this.type === "video";
      },
    },
    duration: {
      type: Number, // Duration in seconds
      required: true,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    content: String, // Additional written content
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "document", "link", "file"],
          default: "link",
        },
      },
    ],
    quiz: {
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
          points: {
            type: Number,
            default: 1,
          },
        },
      ],
      passingScore: {
        type: Number,
        default: 70,
      },
    },
    dsaSheet: {
      categories: [
        {
          title: {
            type: String,
            required: true,
          },
          description: String,
          problems: [
            {
              id: {
                type: String,
                required: true,
              },
              title: {
                type: String,
                required: true,
              },
              difficulty: {
                type: String,
                enum: ["Easy", "Medium", "Hard"],
                required: true,
              },
              topic: String,
              leetcodeUrl: String,
              solutionUrl: String,
              companies: [String],
              notes: String,
            },
          ],
        },
      ],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add index for course lessons ordering
lessonSchema.index({ course: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
