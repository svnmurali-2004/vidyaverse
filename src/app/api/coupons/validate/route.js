import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon.model";
import Course from "@/models/course.model";
import CouponUsage from "@/models/couponUsage.model";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { code, courseId, orderAmount } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
    }).populate('courses');

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check if coupon is currently valid
    if (!coupon.isCurrentlyValid) {
      if (!coupon.isActive) {
        return NextResponse.json(
          { error: "This coupon is no longer active" },
          { status: 400 }
        );
      } else if (coupon.isExpired) {
        return NextResponse.json(
          { error: "This coupon has expired" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "This coupon is not yet valid" },
          { status: 400 }
        );
      }
    }

    // Check if user can use this coupon
    const canUse = await coupon.canBeUsedBy(session.user.id);
    if (!canUse) {
      return NextResponse.json(
        { error: "You have exceeded the usage limit for this coupon" },
        { status: 400 }
      );
    }

    // Get course details for validation
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Use provided order amount or course price
    const amount = orderAmount || course.price;

    // Calculate discount
    const discountResult = coupon.calculateDiscount(
      amount, 
      courseId, 
      course.category
    );

    if (!discountResult.valid) {
      return NextResponse.json(
        { error: discountResult.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount: discountResult.discount,
        originalAmount: amount,
        finalAmount: discountResult.finalAmount,
        savings: discountResult.discount,
      },
    });

  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}