import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Progress from "@/models/progress.model";
import Enrollment from "@/models/enrollment.model";
import Lesson from "@/models/lesson.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";

// GET /api/progress - Get user's progress
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId") || session.user.id;

    // Check permissions - users can only see their own progress unless admin
    const user = await User.findById(session.user.id);
    if (userId !== session.user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const filter = { userId: userId };
    if (courseId) {
      filter.courseId = courseId;
    }

    const progress = await Progress.find(filter)
      .populate("courseId", "title thumbnail")
      .populate("lessonId", "title duration order")
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate course completion percentages
    const courseProgress = {};
    for (const prog of progress) {
      if (!courseProgress[prog.courseId._id]) {
        const totalLessons = await Lesson.countDocuments({
          course: prog.courseId._id,
        });
        const completedLessons = await Progress.countDocuments({
          userId: userId,
          courseId: prog.courseId._id,
          isCompleted: true,
        });

        courseProgress[prog.courseId._id] = {
          course: prog.courseId,
          totalLessons,
          completedLessons,
          completionPercentage:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
          lastAccessed: prog.lastAccessedAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: progress,
      courseProgress: Object.values(courseProgress),
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST /api/progress - Update lesson progress
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { courseId, lessonId, completed, watchTime, quizScore } = body;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Update or create progress
    const progress = await Progress.findOneAndUpdate(
      { userId: session.user.id, courseId: courseId, lessonId: lessonId },
      {
        userId: session.user.id,
        courseId: courseId,
        lessonId: lessonId,
        isCompleted: completed || false,
        watchedDuration: watchTime || 0,
        quizScore: quizScore || null,
        lastAccessedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).populate("lessonId", "title duration");

    // Update enrollment progress
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessons = await Progress.countDocuments({
      userId: session.user.id,
      courseId: courseId,
      isCompleted: true,
    });

    const completionPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Update enrollment progress and completed lessons
    const enrollmentUpdate = {
      progress: completionPercentage,
      lastAccessed: new Date(),
    };

    // If course is 100% complete, mark enrollment as completed
    if (completionPercentage >= 100) {
      enrollmentUpdate.status = "completed";
    }

    // If lesson was marked as completed, add it to completedLessons array
    if (completed) {
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        ...enrollmentUpdate,
        $addToSet: { completedLessons: lessonId }, // Add lesson to completed array if not already present
      });
    } else {
      await Enrollment.findByIdAndUpdate(enrollment._id, enrollmentUpdate);
    }

    return NextResponse.json({
      success: true,
      data: progress,
      completionPercentage,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating progress:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: Object.values(error.errors).map((err) => err.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
