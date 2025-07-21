import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import DsaProgress from "@/models/dsaProgress.model";
import Lesson from "@/models/lesson.model";
import Enrollment from "@/models/enrollment.model";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the lesson exists and user has access
    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check enrollment for students
    if (session.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        user: session.user.id,
        course: lesson.course._id,
        status: "active",
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            error: "You must be enrolled in this course to access DSA progress",
          },
          { status: 403 }
        );
      }
    }

    // Get or create DSA progress
    let dsaProgress = await DsaProgress.findOne({
      user: session.user.id,
      lesson: lessonId,
    });

    if (!dsaProgress) {
      dsaProgress = {
        completedProblems: [],
        totalProblems: 0,
        completionPercentage: 0,
      };
    }

    return NextResponse.json({
      success: true,
      completedProblems:
        dsaProgress.completedProblems?.map((p) => p.problemId) || [],
      totalProblems: dsaProgress.totalProblems || 0,
      completionPercentage: dsaProgress.completionPercentage || 0,
    });
  } catch (error) {
    console.error("Error fetching DSA progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    const { lessonId, problemId, completed, categoryIndex, problemIndex } =
      await request.json();

    if (!lessonId || !problemId || completed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the lesson exists and user has access
    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check enrollment for students
    if (session.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        user: session.user.id,
        course: lesson.course._id,
        status: "active",
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            error: "You must be enrolled in this course to update DSA progress",
          },
          { status: 403 }
        );
      }
    }

    // Calculate total problems from lesson data
    const totalProblems =
      lesson.dsaSheet?.categories?.reduce(
        (total, category) => total + (category.problems?.length || 0),
        0
      ) || 0;

    // Get or create DSA progress
    let dsaProgress = await DsaProgress.findOne({
      user: session.user.id,
      lesson: lessonId,
    });

    if (!dsaProgress) {
      dsaProgress = new DsaProgress({
        user: session.user.id,
        lesson: lessonId,
        course: lesson.course._id,
        completedProblems: [],
        totalProblems,
      });
    }

    // Update completed problems
    if (completed) {
      // Add problem if not already completed
      const existingIndex = dsaProgress.completedProblems.findIndex(
        (p) => p.problemId === problemId
      );

      if (existingIndex === -1) {
        dsaProgress.completedProblems.push({
          problemId,
          categoryIndex,
          problemIndex,
          completedAt: new Date(),
        });
      }
    } else {
      // Remove problem from completed list
      dsaProgress.completedProblems = dsaProgress.completedProblems.filter(
        (p) => p.problemId !== problemId
      );
    }

    // Update totals
    dsaProgress.totalProblems = totalProblems;
    dsaProgress.completionPercentage =
      totalProblems > 0
        ? (dsaProgress.completedProblems.length / totalProblems) * 100
        : 0;
    dsaProgress.lastUpdated = new Date();

    await dsaProgress.save();

    return NextResponse.json({
      success: true,
      completedProblems: dsaProgress.completedProblems.map((p) => p.problemId),
      totalProblems: dsaProgress.totalProblems,
      completionPercentage: dsaProgress.completionPercentage,
    });
  } catch (error) {
    console.error("Error updating DSA progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
