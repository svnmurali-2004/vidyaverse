import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { verifyRazorpayPayment } from "@/lib/razorpay";
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
      orderId,
      paymentId,
      signature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = body;

    // Support both parameter formats for flexibility
    const orderIdToUse = orderId || razorpay_order_id;
    const paymentIdToUse = paymentId || razorpay_payment_id;
    const signatureToUse = signature || razorpay_signature;

    // Verify payment signature
    const paymentVerification = await verifyRazorpayPayment({
      razorpay_order_id: orderIdToUse,
      razorpay_payment_id: paymentIdToUse,
      razorpay_signature: signatureToUse,
    });

    if (!paymentVerification.isValid) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find the order - try both orderId (database _id) and razorpay order id
    let order;
    if (orderId && orderId.length === 24) {
      // If orderId looks like a MongoDB ObjectId, search by _id
      order = await Order.findById(orderId);
    } else {
      // Otherwise search by razorpay order id
      order = await Order.findOne({ razorpayOrderId: orderIdToUse });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    order.status = "completed";
    order.razorpayPaymentId = paymentIdToUse;
    order.razorpaySignature = signatureToUse;
    order.paidAt = new Date();
    await order.save();

    // Create enrollment
    const enrollment = new Enrollment({
      user: session.user.id,
      course: order.course, // Use course from order
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
