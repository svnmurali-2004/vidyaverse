import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { courseId, amount, couponCode, paymentMethod } = body;

    if (!courseId || !amount) {
      return NextResponse.json(
        { error: "Course ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: session.user.id,
      },
    });

    // Create order in database
    const order = new Order({
      user: session.user.id,
      course: courseId,
      amount: amount,
      status: "pending",
      paymentMethod: paymentMethod || "razorpay",
      razorpayOrderId: razorpayOrder.id,
      couponCode: couponCode || null,
      createdAt: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ user: session.user.id })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
