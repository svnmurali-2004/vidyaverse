import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Quiz from "@/models/quiz.model";
import QuizAttempt from "@/models/quizAttempt.model";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { answers, timeSpent, startedAt } = await request.json();

    if (!answers || !timeSpent || !startedAt) {
      return NextResponse.json(
        {
          error: "Answers, time spent, and start time are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if user has exceeded attempt limit
    const existingAttempts = await QuizAttempt.countDocuments({
      quiz: id,
      user: session.user.id,
    });

    if (existingAttempts >= quiz.attempts) {
      return NextResponse.json(
        {
          error: "Maximum attempts exceeded",
        },
        { status: 400 }
      );
    }

    // Grade the quiz
    let totalScore = 0;
    let totalPossiblePoints = 0;
    const gradedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers.find((a) => a.questionIndex === i);
      totalPossiblePoints += question.points;

      if (!userAnswer) {
        gradedAnswers.push({
          questionIndex: i,
          selectedOptions: [],
          textAnswer: "",
          isCorrect: false,
          pointsEarned: 0,
        });
        continue;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === "fill-blank") {
        // Simple text matching (case-insensitive)
        const userText = userAnswer.textAnswer?.toLowerCase().trim();
        const correctAnswer = question.correctAnswer?.toLowerCase().trim();
        isCorrect = userText === correctAnswer;
      } else {
        // Multiple choice questions
        const correctOptions = question.options
          .map((opt, idx) => (opt.isCorrect ? idx : -1))
          .filter((idx) => idx !== -1);

        const selectedOptions = userAnswer.selectedOptions || [];

        if (question.type === "multiple-choice") {
          // For multiple choice, all correct options must be selected and no incorrect ones
          isCorrect =
            correctOptions.length === selectedOptions.length &&
            correctOptions.every((idx) => selectedOptions.includes(idx));
        } else {
          // For single choice, exactly one correct option must be selected
          isCorrect =
            selectedOptions.length === 1 &&
            correctOptions.includes(selectedOptions[0]);
        }
      }

      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += pointsEarned;
      }

      gradedAnswers.push({
        questionIndex: i,
        selectedOptions: userAnswer.selectedOptions || [],
        textAnswer: userAnswer.textAnswer || "",
        isCorrect,
        pointsEarned,
      });
    }

    const percentage =
      totalPossiblePoints > 0 ? (totalScore / totalPossiblePoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Create quiz attempt record
    const attempt = new QuizAttempt({
      quiz: id,
      user: session.user.id,
      answers: gradedAnswers,
      score: totalScore,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      passed,
      timeSpent,
      startedAt: new Date(startedAt),
      completedAt: new Date(),
      attemptNumber: existingAttempts + 1,
    });

    await attempt.save();

    // Return results with correct answers for review
    const results = {
      attempt: {
        score: totalScore,
        totalPossiblePoints,
        percentage: attempt.percentage,
        passed,
        timeSpent,
        attemptNumber: attempt.attemptNumber,
      },
      questions: quiz.questions.map((question, index) => {
        const userAnswer = gradedAnswers.find((a) => a.questionIndex === index);
        return {
          question: question.question,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          userAnswer,
          points: question.points,
        };
      }),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
