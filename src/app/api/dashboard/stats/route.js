import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Enrollment from "@/models/enrollment.model";
import QuizAttempt from "@/models/quizAttempt.model";
import Certificate from "@/models/certificate.model";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 Fetching stats for user:', session.user.id);

    await connectDB();

    // Use the same logic as the working frontend code but on the backend
    const userId = new ObjectId(session.user.id);

    // Fetch enrollments with course details and calculate learning hours differently
    const [enrollments, quizAttempts, certificates] = await Promise.all([
      Enrollment.find({ user: userId })
        .populate('course', 'title lessons')
        .lean(),
      
      QuizAttempt.find({ user: userId })
        .lean(),
        
      Certificate.find({ user: userId })
        .lean()
    ]);

    console.log('📚 Found enrollments:', enrollments.length);
    console.log('🧠 Found quiz attempts:', quizAttempts.length);
    console.log('🏆 Found certificates:', certificates.length);

    // Debug enrollment data
    console.log('📊 Enrollment raw data:', enrollments.map(e => ({
      courseId: e.course?._id,
      courseTitle: e.course?.title,
      progress: e.progress,
      status: e.status,
      completedLessons: e.completedLessons?.length || 0,
      totalLessons: e.course?.lessons?.length || 0
    })));

    // Calculate stats using the correct model fields
    const completedCourses = enrollments.filter(e => {
      const isCompleted = e.progress >= 100 || e.status === 'completed';
      console.log(`Course ${e.course?.title}: progress=${e.progress}, status=${e.status}, completed=${isCompleted}`);
      return isCompleted;
    }).length;
    
    console.log('✅ Completed courses count:', completedCourses);
    
    // Calculate quiz stats from attempts
    const quizzesTaken = quizAttempts.length;
    const averageScore = quizzesTaken > 0 
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizzesTaken)
      : 0;

    // Simple estimation for learning hours based on enrolled courses
    // We'll estimate 2-3 hours per enrolled course as a reasonable baseline
    const totalLearningHours = Math.max(enrollments.length * 2, 1);

    const statsData = {
      enrolledCourses: enrollments.length,
      completedCourses,
      quizzesTaken,
      averageScore,
      totalLearningHours,
      certificates: certificates.length
    };

    console.log('📊 Calculated stats:', statsData);

    return NextResponse.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}