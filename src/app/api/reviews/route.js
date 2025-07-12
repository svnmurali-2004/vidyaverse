import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Review from "@/models/review.model";
import Enrollment from "@/models/enrollment.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";

// GET /api/reviews - Get reviews with optional course filter
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const filter = {};
    if (courseId) {
      filter.course = courseId;
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate("user", "name image")
      .populate("course", "title thumbnail")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(filter);

    // Calculate average rating if courseId is provided
    let avgRating = null;
    if (courseId) {
      const ratings = await Review.find({ course: courseId }, "rating").lean();
      if (ratings.length > 0) {
        avgRating =
          ratings.reduce((sum, review) => sum + review.rating, 0) /
          ratings.length;
        avgRating = Math.round(avgRating * 10) / 10;
      }
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      avgRating,
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
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { courseId, rating, comment } = body;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "You must be enrolled to review this course" },
        { status: 403 }
      );
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({
      user: session.user.id,
      course: courseId,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this course" },
        { status: 400 }
      );
    }

    const review = new Review({
      user: session.user.id,
      course: courseId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await review.save();
    await review.populate("user", "name image");
    await review.populate("course", "title thumbnail");

    // Update course average rating
    const allReviews = await Review.find({ course: courseId }, "rating").lean();
    const avgRating =
      allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: "Review created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);

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
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
