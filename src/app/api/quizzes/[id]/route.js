import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Quiz from "@/models/quiz.model";
import QuizAttempt from "@/models/quizAttempt.model";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const quiz = await Quiz.findById(id)
      .populate("course", "title")
      .populate("lesson", "title")
      .populate("createdBy", "name");

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // For admin users editing quiz, return full quiz data
    if (session.user.role === "admin") {
      return NextResponse.json({
        success: true,
        data: quiz,
      });
    }

    // Get user's attempt history
    const attempts = await QuizAttempt.find({
      quiz: id,
      user: session.user.id,
    }).sort({ attemptNumber: -1 });

    const canAttempt = attempts.length < quiz.attempts;
    const lastAttempt = attempts[0];

    // For students taking the quiz, don't show correct answers
    let quizData = quiz.toObject();
    if (session.user.role === "student" && canAttempt) {
      quizData.questions = quiz.questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options?.map((opt) => ({ text: opt.text })),
        points: q.points,
      }));
    }

    return NextResponse.json({
      quiz: quizData,
      attempts,
      canAttempt,
      lastAttempt,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        course,
        lesson,
        questions,
        timeLimit: timeLimit || 30,
        passingScore: passingScore || 70,
        attempts: attempts || 3,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("course", "title")
      .populate("lesson", "title")
      .populate("createdBy", "name");

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "instructor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check ownership for instructors
    if (
      session.user.role === "instructor" &&
      quiz.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete quiz attempts first
    await QuizAttempt.deleteMany({ quiz: id });

    // Delete the quiz
    await Quiz.findByIdAndDelete(id);

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
