import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Enrollment from "@/models/enrollment.model";
import Order from "@/models/order.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total enrollments count
    const total = await Enrollment.countDocuments();

    // Get recent enrollments (last 10)
    const recent = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("course", "title price")
      .select("user course progress createdAt")
      .lean();

    // Get total revenue from paid orders
    const orders = await Order.find({ status: "paid" });
    const revenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    return NextResponse.json({
      total,
      recent,
      revenue,
    });
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment stats" },
      { status: 500 }
    );
  }
}
