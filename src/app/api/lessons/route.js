import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Lesson from "@/models/lesson.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import Progress from "@/models/progress.model";
import Enrollment from "@/models/enrollment.model";
import mongoose from "mongoose";

// GET /api/lessons - Get lessons (with optional course filter)
export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filter = {};
    if (courseId) {
      // Validate that courseId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid course ID format",
          },
          { status: 400 }
        );
      }
      filter.course = courseId;

      // **SECURITY FIX**: For non-preview requests, verify enrollment
      if (session && session.user.role === "student") {
        const isPreview = searchParams.get("preview") === "true";
        
        if (!isPreview) {
          const enrollment = await Enrollment.findOne({
            user: session.user.id,
            course: courseId,
            status: "active"
          });

          if (!enrollment) {
            // If not enrolled, only return preview lessons
            filter.isPreview = true;
          }
        } else {
          // For preview mode, only show preview lessons
          filter.isPreview = true;
        }
      }
    }

    // Temporarily show all lessons for debugging
    // filter.isPublished = true;

    const skip = (page - 1) * limit;

    const lessons = await Lesson.find(filter)
      .populate("course", "title instructor")
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Lessons API - Filter:", filter);
    console.log("Lessons API - Found lessons:", lessons.length);
    console.log("Lessons API - Lessons:", lessons.map(l => ({ id: l._id, title: l.title, type: l.type, hasQuiz: !!l.quiz })));

    const total = await Lesson.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: lessons,
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
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create a new lesson
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

    const user = await User.findById(session.user.id);
    const body = await request.json();

    // Verify user can create lessons for this course
    const course = await Course.findById(body.course);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

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

    // Auto-assign order if not provided
    if (!body.order) {
      const lastLesson = await Lesson.findOne({ course: body.course })
        .sort({ order: -1 })
        .lean();
      body.order = lastLesson ? lastLesson.order + 1 : 1;
    }

    const lesson = new Lesson({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await lesson.save();
    await lesson.populate("course", "title instructor");

    return NextResponse.json(
      {
        success: true,
        data: lesson,
        message: "Lesson created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);

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
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
