import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon.model";
import CouponUsage from "@/models/couponUsage.model";
import User from "@/models/user.model";
import Course from "@/models/course.model";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Create sample coupons for testing
    const sampleCoupons = [
      {
        code: "WELCOME20",
        description: "20% off for new users",
        type: "percentage",
        value: 20,
        maxDiscount: 1000,
        minOrderValue: 500,
        applicableTo: "all",
        usageLimit: 100,
        userLimit: 1,
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: session.user.id,
        isActive: true,
      },
      {
        code: "SAVE500",
        description: "Get ₹500 off on courses above ₹2000",
        type: "fixed",
        value: 500,
        minOrderValue: 2000,
        applicableTo: "all",
        usageLimit: 50,
        userLimit: 1,
        validFrom: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        createdBy: session.user.id,
        isActive: true,
      },
      {
        code: "STUDENT10",
        description: "10% off for all students",
        type: "percentage",
        value: 10,
        maxDiscount: 300,
        minOrderValue: 200,
        applicableTo: "all",
        usageLimit: null, // unlimited
        userLimit: 1,
        validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdBy: session.user.id,
        isActive: true,
      },
    ];

    // Create coupons
    const createdCoupons = [];
    for (const couponData of sampleCoupons) {
      const existingCoupon = await Coupon.findOne({ code: couponData.code });
      if (!existingCoupon) {
        const coupon = new Coupon(couponData);
        await coupon.save();
        createdCoupons.push(coupon);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCoupons.length} sample coupons`,
      data: createdCoupons,
    });

  } catch (error) {
    console.error("Error creating sample coupons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}