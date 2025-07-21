import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay";
import Order from "@/models/order.model";
import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import connectDB from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { courseId, action } = body;

    if (action === "create_order") {
      // Create Razorpay order
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
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

      // Create order in database
      const order = new Order({
        user: session.user.id,
        course: courseId,
        amount: course.price,
        status: "pending",
        provider: "razorpay",
      });
      await order.save();

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder({
        amount: course.price,
        receipt: order._id.toString(),
      });

      // Update order with Razorpay order ID
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return NextResponse.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        course: {
          id: course._id,
          title: course.title,
          price: course.price,
        },
      });
    }

    if (action === "verify_payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        body;

      // Verify payment with Razorpay
      const verification = await verifyRazorpayPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!verification.isValid) {
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }

      // Find and update order
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      order.status = "completed";
      order.paymentId = razorpay_payment_id;
      await order.save();

      // Create enrollment
      const enrollment = new Enrollment({
        user: session.user.id,
        course: order.course,
        enrolledAt: new Date(),
        progress: 0,
        status: "active",
      });
      await enrollment.save();

      return NextResponse.json({
        message: "Payment successful and enrollment created",
        enrollment: enrollment._id,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
