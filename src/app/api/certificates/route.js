import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Certificate from "@/models/certificate.model";
import Enrollment from "@/models/enrollment.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { v4 as uuidv4 } from "uuid";

// GET /api/certificates - Get certificates
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const currentUser = await User.findById(session.user.id);

    // Users can only see their own certificates unless admin
    if (userId !== session.user.id && currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const filter = { user: userId };
    if (courseId) {
      filter.course = courseId;
    }

    const skip = (page - 1) * limit;

    const certificates = await Certificate.find(filter)
      .populate("course", "title thumbnail instructor")
      .populate("user", "name email")
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Certificate.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: certificates,
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
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

// POST /api/certificates - Generate certificate
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
    const { courseId, userId } = body;

    const targetUserId = userId || session.user.id;
    const currentUser = await User.findById(session.user.id);

    // Check permissions - admin can generate for anyone, users for themselves
    if (targetUserId !== session.user.id && currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if enrollment exists and course is completed
    const enrollment = await Enrollment.findOne({
      user: targetUserId,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 400 }
      );
    }

    if (enrollment.progress < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Course must be completed to generate certificate",
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: targetUserId,
      course: courseId,
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        data: existingCertificate,
        message: "Certificate already exists",
      });
    }

    // Get course and user details
    const course = await Course.findById(courseId).populate(
      "instructor",
      "name"
    );
    const user = await User.findById(targetUserId);

    // Generate certificate
    const certificate = new Certificate({
      user: targetUserId,
      course: courseId,
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`,
      issuedAt: new Date(),
      courseName: course.title,
      userName: user.name,
      instructorName: course.instructor.name,
      completionDate: enrollment.updatedAt,
    });

    await certificate.save();
    await certificate.populate("course", "title thumbnail instructor");
    await certificate.populate("user", "name email");

    return NextResponse.json(
      {
        success: true,
        data: certificate,
        message: "Certificate generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
