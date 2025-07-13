import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Enrollment from "@/models/enrollment.model";
import Course from "@/models/course.model";
import Progress from "@/models/progress.model";
import User from "@/models/user.model";
import Lesson from "@/models/lesson.model";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure database connection
    await connectDB();

    // Get user's enrollments
    const enrollments = await Enrollment.find({
      user: session.user.id,
    })
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "name email image",
        },
      })
      .sort({ createdAt: -1 });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total lessons in course by querying lessons collection
        const totalLessons = await Lesson.countDocuments({
          course: enrollment.course._id,
        });

        // Get completed lessons count for reference
        const completedLessons = await Progress.countDocuments({
          userId: session.user.id,
          courseId: enrollment.course._id,
          isCompleted: true,
        });

        return {
          ...enrollment.toObject(),
          completedLessons,
          totalLessons,
          progressPercentage: enrollment.progress || 0, // Use the progress from enrollment
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrollmentsWithProgress,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { courseId } = await request.json();

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // For free courses, create enrollment directly
    if (course.price === 0) {
      const enrollment = new Enrollment({
        user: session.user.id,
        course: courseId,
      });

      await enrollment.save();

      return NextResponse.json({
        success: true,
        message: "Successfully enrolled in free course",
        data: enrollment,
      });
    } else {
      return NextResponse.json(
        { error: "Paid course requires payment" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
