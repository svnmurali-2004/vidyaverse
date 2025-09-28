import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Enrollment from "@/models/enrollment.model";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Optimized query with selective population and limits
    const recentCourses = await Enrollment.find({
      user: session.user.id,
    })
      .populate({
        path: "course",
        select: "title description thumbnail category level duration price", // Only essential fields
        populate: {
          path: "instructor",
          select: "name", // Only instructor name
        },
      })
      .select("progressPercentage createdAt lastAccessed course") // Only needed enrollment fields
      .sort({ lastAccessed: -1, createdAt: -1 })
      .limit(6) // Limit results
      .lean(); // Use lean() for better performance

    // Transform data for frontend
    const transformedCourses = recentCourses.map(enrollment => ({
      _id: enrollment._id,
      course: {
        _id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        category: enrollment.course.category,
        level: enrollment.course.level,
        duration: enrollment.course.duration,
        price: enrollment.course.price,
        instructor: enrollment.course.instructor
      },
      progressPercentage: enrollment.progressPercentage || 0,
      lastAccessed: enrollment.lastAccessed,
      createdAt: enrollment.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: transformedCourses
    });

  } catch (error) {
    console.error('Recent courses error:', error);
    return NextResponse.json(
      { error: "Failed to fetch recent courses" },
      { status: 500 }
    );
  }
}