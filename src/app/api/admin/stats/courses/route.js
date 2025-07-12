import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total courses count
    const total = await Course.countDocuments();

    // Get recent courses (last 10)
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("instructor", "name")
      .select("title instructor isPublished createdAt status")
      .lean();

    // Calculate enrollment count for each course
    const coursesWithEnrollmentCount = await Promise.all(
      recentCourses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
        });
        return {
          ...course,
          enrollmentCount,
        };
      })
    );

    return NextResponse.json({
      total,
      recent: coursesWithEnrollmentCount,
    });
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch course stats" },
      { status: 500 }
    );
  }
}
