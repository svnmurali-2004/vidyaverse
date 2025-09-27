# Enhanced Lesson Model for DSA Sheets

## Add to lesson.model.js:

```javascript
// Add new lesson type
type: {
  type: String,
  enum: ["text", "video", "quiz", "dsa-sheet"], // Add dsa-sheet
  default: "text",
},

// Add DSA sheet specific fields
dsaSheet: {
  categories: [
    {
      title: String, // "Easy", "Medium", "Hard" or "Arrays", "Strings", etc.
      description: String,
      problems: [
        {
          id: String, // Unique problem ID
          title: String, // "Two Sum"
          difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"]
          },
          topic: String, // "Arrays", "Strings", etc.
          leetcodeUrl: String,
          solutionUrl: String,
          companies: [String], // ["Google", "Amazon"]
          isCompleted: {
            type: Boolean,
            default: false
          }
        }
      ]
    }
  ],
  totalProblems: {
    type: Number,
    default: 0
  }
}
```

## Create New Progress Model:

```javascript
// models/dsaProgress.model.js
import mongoose from "mongoose";

const dsaProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    completedProblems: [
      {
        problemId: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
        timeSpent: Number, // in minutes
        attempts: Number,
        difficulty: String,
      },
    ],
    categoryProgress: [
      {
        categoryName: String,
        completed: Number,
        total: Number,
        percentage: Number,
      },
    ],
    overallProgress: {
      completed: Number,
      total: Number,
      percentage: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DsaProgress ||
  mongoose.model("DsaProgress", dsaProgressSchema);
```
