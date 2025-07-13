import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Course from "@/models/course.model";
import Lesson from "@/models/lesson.model";
import Quiz from "@/models/quiz.model";
import Progress from "@/models/progress.model";
import QuizAttempt from "@/models/quizAttempt.model";

// GET /api/courses/[id]/certificate-requirements - Get certificate requirements and progress
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: courseId } = await params;
    const userId = session.user.id;

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Get lessons and user progress
    const lessons = await Lesson.find({ course: courseId });
    const completedProgress = await Progress.find({
      user: userId,
      lesson: { $in: lessons.map((l) => l._id) },
      completed: true,
    });

    const lessonCompletion = {
      total: lessons.length,
      completed: completedProgress.length,
      percentage:
        lessons.length > 0
          ? (completedProgress.length / lessons.length) * 100
          : 0,
      required: 80,
    };

    // Get required quizzes and user attempts
    const requiredQuizzes = await Quiz.find({
      course: courseId,
      isActive: true,
      isRequiredForCertificate: true,
    });

    const quizRequirements = await Promise.all(
      requiredQuizzes.map(async (quiz) => {
        const bestAttempt = await QuizAttempt.findOne({
          quiz: quiz._id,
          user: userId,
          passed: true,
        }).sort({ percentage: -1 });

        const allAttempts = await QuizAttempt.find({
          quiz: quiz._id,
          user: userId,
        }).sort({ attemptNumber: -1 });

        return {
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            passingScore: quiz.passingScore,
            attempts: quiz.attempts,
          },
          passed: !!bestAttempt,
          bestScore: bestAttempt?.percentage || 0,
          attemptsUsed: allAttempts.length,
          attemptsRemaining: Math.max(0, quiz.attempts - allAttempts.length),
          lastAttempt: allAttempts[0] || null,
        };
      })
    );

    const quizCompletion = {
      total: requiredQuizzes.length,
      passed: quizRequirements.filter((q) => q.passed).length,
      requirements: quizRequirements,
    };

    // Calculate eligibility
    const lessonRequirementMet =
      lessonCompletion.percentage >= lessonCompletion.required;
    const quizRequirementMet =
      quizCompletion.total === 0 ||
      quizCompletion.passed === quizCompletion.total;
    const certificateEligible = lessonRequirementMet && quizRequirementMet;

    return NextResponse.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
        },
        lessons: lessonCompletion,
        quizzes: quizCompletion,
        certificateEligible,
        requirements: {
          lessonsMet: lessonRequirementMet,
          quizzesMet: quizRequirementMet,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching certificate requirements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate requirements" },
      { status: 500 }
    );
  }
}
