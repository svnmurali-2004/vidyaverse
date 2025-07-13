import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import QuizAttempt from "@/models/quizAttempt.model";

// GET /api/debug-quiz-scores - Debug quiz scoring issues
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get recent quiz attempts for the user
    const attempts = await QuizAttempt.find({
      user: session.user.id,
    })
      .populate("quiz", "title passingScore")
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    const debugData = attempts.map(attempt => ({
      quizTitle: attempt.quiz?.title,
      attemptNumber: attempt.attemptNumber,
      rawScore: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingScore: attempt.quiz?.passingScore,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
      answersCount: attempt.answers?.length,
      correctAnswers: attempt.answers?.filter(a => a.isCorrect).length,
    }));

    return NextResponse.json({
      success: true,
      userAttempts: debugData,
      totalAttempts: attempts.length,
    });
  } catch (error) {
    console.error("Error in debug quiz scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
