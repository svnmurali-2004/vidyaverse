import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { verifyPayment } from "@/lib/razorpay";
import dbConnect from "@/lib/db";
import Order from "@/models/order.model";
import Enrollment from "@/models/enrollment.model";

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = body;

    // Verify payment signature
    const isValidPayment = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidPayment) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    order.status = "completed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    // Create enrollment
    const enrollment = new Enrollment({
      user: session.user.id,
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      paymentStatus: "completed",
      order: order._id,
    });

    await enrollment.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified and enrollment created successfully",
      data: {
        orderId: order._id,
        enrollmentId: enrollment._id,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
