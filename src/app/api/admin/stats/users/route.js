import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total users count
    const total = await User.countDocuments();

    // Get recent users (last 10)
    const recent = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role createdAt emailVerified")
      .lean();

    // Transform the data to include id field for DataTable compatibility
    const transformedRecent = recent.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Unknown User",
      email: user.email || "No email",
      role: user.role || "student",
      status: user.emailVerified ? "active" : "inactive",
      joinDate: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "Unknown",
    }));

    return NextResponse.json({
      total,
      recent: transformedRecent,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
