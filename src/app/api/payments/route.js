import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay";
import Order from "@/models/order.model";
import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import Coupon from "@/models/coupon.model";
import CouponUsage from "@/models/couponUsage.model";
import connectDB from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { courseId, action, couponCode, discountAmount, finalAmount } = body;

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

      let orderAmount = course.price;
      let appliedCoupon = null;
      
      // Validate coupon if provided
      if (couponCode) {
        appliedCoupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase() 
        });
        
        if (!appliedCoupon || !appliedCoupon.isCurrentlyValid) {
          return NextResponse.json(
            { error: "Invalid or expired coupon" },
            { status: 400 }
          );
        }
        
        // Re-validate coupon can be used by this user
        const canUse = await appliedCoupon.canBeUsedBy(session.user.id);
        if (!canUse) {
          return NextResponse.json(
            { error: "Coupon usage limit exceeded" },
            { status: 400 }
          );
        }
        
        // Re-calculate discount to ensure it's correct
        const discountResult = appliedCoupon.calculateDiscount(
          course.price, 
          courseId, 
          course.category
        );
        
        if (!discountResult.valid) {
          return NextResponse.json(
            { error: discountResult.reason },
            { status: 400 }
          );
        }
        
        orderAmount = discountResult.finalAmount;
      }

      // Create order in database
      const order = new Order({
        user: session.user.id,
        course: courseId,
        amount: orderAmount,
        originalAmount: course.price,
        discountAmount: (discountAmount || (course.price - orderAmount)),
        couponCode: couponCode || null,
        appliedCoupon: appliedCoupon ? appliedCoupon._id : null,
        status: "pending",
        paymentMethod: "razorpay",
      });
      await order.save();

      // Create Razorpay order with the final amount
      const razorpayOrder = await createRazorpayOrder({
        amount: orderAmount, // Use the discounted amount
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
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
        .populate('appliedCoupon');
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      order.status = "completed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.paidAt = new Date();
      await order.save();

      // Record coupon usage if a coupon was applied
      if (order.appliedCoupon) {
        const couponUsage = new CouponUsage({
          coupon: order.appliedCoupon._id,
          user: session.user.id,
          order: order._id,
          course: order.course,
          discountAmount: order.discountAmount,
          originalAmount: order.originalAmount,
          finalAmount: order.amount,
        });
        await couponUsage.save();

        // Update coupon usage count
        await Coupon.findByIdAndUpdate(
          order.appliedCoupon._id,
          { $inc: { usedCount: 1 } }
        );
      }

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
