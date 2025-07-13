import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Quiz from "@/models/quiz.model";
import QuizAttempt from "@/models/quizAttempt.model";
import Course from "@/models/course.model";
import Lesson from "@/models/lesson.model";
import User from "@/models/user.model";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    await connectDB();

    const filter = { isActive: true };
    if (courseId) filter.course = courseId;
    if (lessonId) filter.lesson = lessonId;

    // For students, only show published quizzes
    if (session.user.role === "student") {
      filter.isActive = true;
    }

    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(filter)
      .populate("course", "title")
      .populate("lesson", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Quiz.countDocuments(filter);

    // For each quiz, get user's attempt information
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({
          quiz: quiz._id,
          user: session.user.id,
        })
          .sort({ attemptNumber: -1 })
          .limit(1);

        const lastAttempt = attempts[0];
        const attemptCount = await QuizAttempt.countDocuments({
          quiz: quiz._id,
          user: session.user.id,
        });

        return {
          ...quiz,
          lastAttempt,
          attemptCount,
          canAttempt: attemptCount < quiz.attempts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: quizzesWithAttempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      course,
      lesson,
      questions,
      timeLimit,
      passingScore,
      attempts,
      isActive,
      isRequiredForCertificate,
    } = body;

    if (!title || !course || !questions || questions.length === 0) {
      return NextResponse.json(
        {
          error: "Title, course, and questions are required",
        },
        { status: 400 }
      );
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.type) {
        return NextResponse.json(
          {
            error: `Question ${i + 1} is missing required fields`,
          },
          { status: 400 }
        );
      }

      if (
        question.type !== "fill-blank" &&
        (!question.options || question.options.length === 0)
      ) {
        return NextResponse.json(
          {
            error: `Question ${i + 1} must have options`,
          },
          { status: 400 }
        );
      }

      if (question.type !== "fill-blank") {
        const hasCorrectAnswer = question.options.some(
          (option) => option.isCorrect
        );
        if (!hasCorrectAnswer) {
          return NextResponse.json(
            {
              error: `Question ${i + 1} must have at least one correct answer`,
            },
            { status: 400 }
          );
        }
      }
    }

    await connectDB();

    const quiz = new Quiz({
      title,
      description,
      course,
      lesson,
      questions,
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 70,
      attempts: attempts || 3,
      isActive: isActive !== undefined ? isActive : true,
      isRequiredForCertificate: isRequiredForCertificate !== undefined ? isRequiredForCertificate : false,
      createdBy: session.user.id,
    });

    await quiz.save();

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate("course", "title")
      .populate("lesson", "title")
      .populate("createdBy", "name");

    return NextResponse.json(populatedQuiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
