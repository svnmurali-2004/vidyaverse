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
import Quiz from "@/models/quiz.model";
import QuizAttempt from "@/models/quizAttempt.model";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: "Invalid course ID format" },
        { status: 400 }
      );
    }

    const userId = session.user?.id;

    // Validate required fields
    if (!userId) {
      console.error("User ID not found in session:", session);
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 401 }
      );
    }

    // Validate ObjectId format for userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID format:", userId);
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    console.log("Certificate generation requested by userId:", userId, "for courseId:", courseId);

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
      userId: userId,
      lessonId: { $in: lessons.map(l => l._id) },
      isCompleted: true
    });

    const completionPercentage = (completedProgress.length / totalLessons) * 100;

    // Get required quizzes for this course
    const requiredQuizzes = await Quiz.find({ 
      course: courseId, 
      isActive: true,
      isRequiredForCertificate: true 
    }).select('_id title passingScore');

    // Check quiz completion for required quizzes
    let quizCompletionStatus = {
      total: requiredQuizzes.length,
      passed: 0,
      failed: 0,
      notAttempted: 0,
      details: []
    };

    if (requiredQuizzes.length > 0) {
      for (const quiz of requiredQuizzes) {
        // Get user's best attempt for this quiz
        const bestAttempt = await QuizAttempt.findOne({
          quiz: quiz._id,
          user: userId,
          passed: true
        }).sort({ percentage: -1 });

        const quizStatus = {
          quizId: quiz._id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          passed: !!bestAttempt,
          bestScore: bestAttempt?.percentage || 0
        };

        if (bestAttempt) {
          quizCompletionStatus.passed++;
        } else {
          // Check if user has any attempts
          const anyAttempt = await QuizAttempt.findOne({
            quiz: quiz._id,
            user: userId
          });
          
          if (anyAttempt) {
            quizCompletionStatus.failed++;
          } else {
            quizCompletionStatus.notAttempted++;
          }
        }

        quizCompletionStatus.details.push(quizStatus);
      }
    }

    // Calculate overall completion requirements
    const lessonRequirementMet = completionPercentage >= 80;
    const quizRequirementMet = requiredQuizzes.length === 0 || quizCompletionStatus.passed === requiredQuizzes.length;

    // Check if both lesson and quiz requirements are met
    if (!lessonRequirementMet) {
      return NextResponse.json(
        {
          success: false,
          error: `Lesson completion required. Current progress: ${completionPercentage.toFixed(1)}%`,
          currentProgress: completionPercentage,
          requirements: {
            lessons: { required: 80, current: completionPercentage, met: false },
            quizzes: { 
              required: requiredQuizzes.length, 
              passed: quizCompletionStatus.passed, 
              met: quizRequirementMet,
              details: quizCompletionStatus.details
            }
          }
        },
        { status: 400 }
      );
    }

    if (!quizRequirementMet) {
      return NextResponse.json(
        {
          success: false,
          error: `Quiz completion required. You must pass all required quizzes (${quizCompletionStatus.passed}/${requiredQuizzes.length} passed)`,
          currentProgress: completionPercentage,
          requirements: {
            lessons: { required: 80, current: completionPercentage, met: true },
            quizzes: { 
              required: requiredQuizzes.length, 
              passed: quizCompletionStatus.passed, 
              met: false,
              details: quizCompletionStatus.details
            }
          }
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    console.log("Checking for existing certificate - userId:", userId, "courseId:", courseId);
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCertificate) {
      console.log("Certificate already exists:", existingCertificate._id);
      return NextResponse.json({
        success: true,
        data: existingCertificate,
        message: "Certificate already exists",
      });
    }

    console.log("No existing certificate found, proceeding to create new one");

    // Get user details
    const user = await User.findById(userId);

    // Calculate final score including quiz performance
    let finalScore = null;
    try {
      // Calculate overall score combining lesson completion and quiz performance
      let combinedScore = completionPercentage;
      
      if (requiredQuizzes.length > 0) {
        const avgQuizScore = quizCompletionStatus.details.reduce((sum, quiz) => sum + quiz.bestScore, 0) / requiredQuizzes.length;
        // Weight: 70% lesson completion + 30% quiz average
        combinedScore = Math.round((completionPercentage * 0.7) + (avgQuizScore * 0.3));
      }
      
      finalScore = combinedScore;
    } catch (error) {
      console.log('Could not calculate final score:', error);
      finalScore = Math.round(completionPercentage);
    }

    // Generate certificate
    console.log("Creating certificate with data:", {
      userId: userId,
      courseId: courseId,
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`,
      completionPercentage: Math.round(completionPercentage),
      finalScore: finalScore
    });
    
    const certificate = new Certificate({
      user: userId,
      course: courseId,
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`,
      issuedAt: new Date(),
      completionPercentage: Math.round(completionPercentage),
      finalScore: finalScore,
      isValid: true,
    });

    try {
      await certificate.save();
      console.log("Certificate saved successfully with ID:", certificate._id);
    } catch (saveError) {
      console.error("Error saving certificate:", saveError);
      
      if (saveError.code === 11000) {
        // MongoDB duplicate key error
        console.error("Duplicate key error details:", {
          userId: userId,
          courseId: courseId,
          errorMessage: saveError.message
        });
        return NextResponse.json(
          { success: false, error: "Certificate already exists for this user and course combination" },
          { status: 409 }
        );
      }
      
      throw saveError; // Re-throw other errors
    }
    
    // Populate the certificate with related data
    await certificate.populate({
      path: 'course',
      select: 'title thumbnail instructor',
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    });
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
        completionPercentage: completionPercentage,
        quizRequirements: {
          total: requiredQuizzes.length,
          passed: quizCompletionStatus.passed,
          details: quizCompletionStatus.details
        }
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
