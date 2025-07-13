import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";
import Enrollment from "@/models/enrollment.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import Lesson from "@/models/lesson.model";
import Progress from "@/models/progress.model";
import { v4 as uuidv4 } from "uuid";

// POST /api/certificates/generate - Generate certificate for completed course
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if enrollment exists
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).populate('course', 'title instructor lessons');

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 400 }
      );
    }

    // Get course details
    const course = await Course.findById(courseId).populate('instructor', 'name');
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Get all lessons for the course
    const lessons = await Lesson.find({ course: courseId }).select('_id');
    const totalLessons = lessons.length;

    if (totalLessons === 0) {
      return NextResponse.json(
        { success: false, error: "Course has no lessons" },
        { status: 400 }
      );
    }

    // Get user's progress for all lessons
    const completedProgress = await Progress.find({
      user: userId,
      lesson: { $in: lessons.map(l => l._id) },
      completed: true
    });

    const completionPercentage = (completedProgress.length / totalLessons) * 100;

    // Check if course is completed (at least 80% completion required)
    if (completionPercentage < 80) {
      return NextResponse.json(
        {
          success: false,
          error: `Course completion required. Current progress: ${completionPercentage.toFixed(1)}%`,
          currentProgress: completionPercentage
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        data: existingCertificate,
        message: "Certificate already exists",
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Calculate final score if available (average of quiz attempts)
    let finalScore = null;
    try {
      // This would require quiz attempt data - implement based on your quiz system
      // For now, we'll set it based on completion percentage
      finalScore = Math.round(completionPercentage);
    } catch (error) {
      console.log('Could not calculate final score:', error);
    }

    // Generate certificate
    const certificate = new Certificate({
      user: userId,
      course: courseId,
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`,
      issuedAt: new Date(),
      completionPercentage: Math.round(completionPercentage),
      finalScore: finalScore,
      isValid: true,
    });

    await certificate.save();
    
    // Populate the certificate with related data
    await certificate.populate('course', 'title thumbnail instructor');
    await certificate.populate('user', 'name email');

    // Update enrollment to mark as completed with certificate
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      progress: completionPercentage,
      completed: true,
      completedAt: new Date(),
      certificateIssued: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: certificate,
        message: "Certificate generated successfully",
        completionPercentage: completionPercentage
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
