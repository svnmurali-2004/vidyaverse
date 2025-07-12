import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import Enrollment from "@/models/enrollment.model";
import { LessonSchema } from "@/models/lesson.model"; // Assuming you have a lesson model
// GET /api/courses - Get all courses with filters and pagination
export async function GET(request) {
  try {
    await dbConnect();

    // Get session to check user enrollment status
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const featured = searchParams.get("featured") === "true";
    const published = searchParams.get("published") !== "false";
    const admin = searchParams.get("admin") === "true";

    console.log("Courses API - Admin request:", admin);
    console.log("Courses API - Published filter:", published);

    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    // For admin requests, don't filter by publication status
    if (!admin) {
      filter.isPublished = published;
    }

    console.log("Courses API - Filter:", JSON.stringify(filter));

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (featured) {
      filter.isFeatured = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination using aggregation for better lesson count
    const coursesAggregation = [
      { $match: filter },
      {
        $lookup: {
          from: "lessons",
          localField: "_id",
          foreignField: "course",
          as: "lessonsData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor",
        },
      },
      {
        $unwind: {
          path: "$instructor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          actualLessonCount: { $size: "$lessonsData" },
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          shortDescription: 1,
          description: 1,
          price: 1,
          thumbnail: 1,
          category: 1,
          level: 1,
          isPublished: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          actualLessonCount: 1,
          "instructor.name": 1,
          "instructor.email": 1,
          "instructor.image": 1,
          "instructor._id": 1,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    const courses = await Course.aggregate(coursesAggregation);

    console.log("Courses API - Found courses count:", courses.length);
    console.log(
      "Courses API - First course:",
      courses[0]
        ? `${courses[0].title} - ${courses[0].actualLessonCount} lessons`
        : "None"
    );

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    console.log("Courses API - Total count:", total);

    // Calculate enrollment counts, ratings, and user enrollment status for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
        });

        // Check if current user is enrolled (if logged in)
        let isEnrolled = false;
        let enrollmentId = null;
        if (session?.user?.id) {
          const userEnrollment = await Enrollment.findOne({
            user: session.user.id,
            course: course._id,
          });
          isEnrolled = !!userEnrollment;
          enrollmentId = userEnrollment?._id;
        }

        return {
          ...course,
          enrollmentCount,
          lessonCount: course.actualLessonCount || 0,
          isEnrolled,
          enrollmentId,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (Admin/Instructor only)
export async function POST(request) {
  try {
    console.log("Creating new course...");
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Session user ID:", session.user.id);

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User role:", user.role);

    if (!["admin", "instructor"].includes(user.role)) {
      console.log("Insufficient permissions for user role:", user.role);
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Course data received:", body);

    const courseData = {
      ...body,
      instructor: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Final course data:", courseData);

    const course = new Course(courseData);
    await course.save();

    console.log("Course saved with ID:", course._id);

    // Populate instructor details
    await course.populate("instructor", "name email image");

    return NextResponse.json(
      {
        success: true,
        data: course,
        message: "Course created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);

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
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
