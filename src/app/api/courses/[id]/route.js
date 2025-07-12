import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import Enrollment from "@/models/enrollment.model";
import Lesson from "@/models/lesson.model";
import Progress from "@/models/progress.model";
import Review from "@/models/review.model";

// GET /api/courses/[id] - Get single course by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get("includeDetails") === "true";

    const course = await Course.findById(id)
      .populate("instructor", "name email image bio")
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let courseData = { ...course };

    if (includeDetails) {
      // Get lessons
      const lessons = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .lean();

      // Get enrollment count
      const enrollmentCount = await Enrollment.countDocuments({ course: id });

      // Get reviews and ratings
      const reviews = await Review.find({ course: id })
        .populate("user", "name image")
        .sort({ createdAt: -1 })
        .lean();

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      courseData = {
        ...courseData,
        lessons,
        enrollmentCount,
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    }

    return NextResponse.json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course by ID (Admin/Instructor only)
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

    const user = await User.findById(session.user.id);
    if (!user || !["admin", "instructor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user owns this course (instructors can only edit their own courses)
    if (
      user.role === "instructor" &&
      existingCourse.instructor.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own courses" },
        { status: 403 }
      );
    }

    // Update course data
    const courseData = {
      ...body,
      updatedAt: new Date(),
    };

    const updatedCourse = await Course.findByIdAndUpdate(id, courseData, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email image");

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Error updating course:", error);

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
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
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
    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);

    // Check permissions - must be admin or course instructor
    if (
      !user ||
      (user.role !== "admin" &&
        course.instructor.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: id });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete course with active enrollments",
        },
        { status: 400 }
      );
    }

    // Delete related lessons, progress, and reviews
    await Promise.all([
      Lesson.deleteMany({ course: id }),
      Progress.deleteMany({ course: id }),
      Review.deleteMany({ course: id }),
    ]);

    // Delete the course
    await Course.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
