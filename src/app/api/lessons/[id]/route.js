import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Lesson from "@/models/lesson.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import Progress from "@/models/progress.model";
import Enrollment from "@/models/enrollment.model";

// GET /api/lessons/[id] - Get single lesson
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const { id } = await params;
    const lesson = await Lesson.findById(id)
      .populate("course", "title instructor price")
      .lean();

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this lesson
    if (session) {
      const user = await User.findById(session.user.id);
      const course = await Course.findById(lesson.course._id);

      // Allow access if user is admin, instructor, or enrolled
      const hasAccess =
        user.role === "admin" ||
        course.instructor.toString() === session.user.id ||
        (await Enrollment.exists({
          user: session.user.id,
          course: lesson.course._id,
        }));

      if (!hasAccess && !lesson.isPreview) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }

      // Track progress if user is enrolled
      if (hasAccess && user.role === "student") {
        await Progress.findOneAndUpdate(
          {
            userId: session.user.id,
            courseId: lesson.course._id,
            lessonId: id,
          },
          {
            userId: session.user.id,
            courseId: lesson.course._id,
            lessonId: id,
            lastAccessedAt: new Date(),
          },
          { upsert: true }
        );
      }
    } else if (!lesson.isPreview) {
      // Public access only for preview lessons
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id] - Update lesson
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const lesson = await Lesson.findById(id).populate("course");

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);

    // Check permissions
    if (
      !user ||
      (user.role !== "admin" &&
        lesson.course.instructor.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Ensure required fields have defaults for existing lessons
    const updateData = {
      ...body,
      type: body.type || "text",
      isPreview: body.isPreview !== undefined ? body.isPreview : false,
      // Sync isFree with isPreview for backward compatibility
      isFree: body.isPreview !== undefined ? body.isPreview : false,
      updatedAt: new Date(),
    };

    console.log("Updating lesson with data:", updateData);

    const updatedLesson = await Lesson.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("course", "title instructor");

    return NextResponse.json({
      success: true,
      data: updatedLesson,
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error("Error updating lesson:", error);

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
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const lesson = await Lesson.findById(id).populate("course");

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);

    // Check permissions
    if (
      !user ||
      (user.role !== "admin" &&
        lesson.course.instructor.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Delete related progress records
    await Progress.deleteMany({ lesson: id });

    // Delete the lesson
    await Lesson.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
