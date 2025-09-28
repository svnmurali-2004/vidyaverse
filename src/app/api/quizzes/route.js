import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Quiz from "@/models/quiz.model";
import QuizAttempt from "@/models/quizAttempt.model";
import Course from "@/models/course.model";
import Lesson from "@/models/lesson.model";
import User from "@/models/user.model";
import Enrollment from "@/models/enrollment.model";

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

    // **SECURITY FIX**: Verify enrollment before showing quizzes
    if (courseId && session.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        user: session.user.id,
        course: courseId,
        status: { $ne: "cancelled" },
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            error: "You must be enrolled in this course to access quizzes",
          },
          { status: 403 }
        );
      }
    }

    const filter = { isActive: true };
    if (courseId) filter.course = courseId;
    if (lessonId) filter.lesson = lessonId;

    // For students, only show published quizzes from enrolled courses
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

    const data = await request.json();
    await connectDB();

    // Validate required fields
    if (!data.title || !data.course) {
      return NextResponse.json(
        { error: "Title and course are required" },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await Course.findById(data.course);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // If lesson is specified, verify it exists and belongs to the course
    if (data.lesson) {
      const lesson = await Lesson.findOne({
        _id: data.lesson,
        course: data.course,
      });
      if (!lesson) {
        return NextResponse.json(
          { error: "Lesson not found or doesn't belong to this course" },
          { status: 404 }
        );
      }
    }

    // Create quiz
    const quiz = new Quiz({
      title: data.title,
      description: data.description || "",
      course: data.course,
      lesson: data.lesson || null,
      timeLimit: data.timeLimit || 30,
      passingScore: data.passingScore || 70,
      attempts: data.attempts || 3,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isRequiredForCertificate: data.isRequiredForCertificate || false,
      questions: data.questions || [],
      createdBy: session.user.id,
    });

    await quiz.save();

    // Populate the response
    await quiz.populate("course", "title");
    await quiz.populate("lesson", "title");
    await quiz.populate("createdBy", "name");

    return NextResponse.json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}