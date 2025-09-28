import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon.model";
import User from "@/models/user.model";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("createdBy", "name email")
        .populate("courses", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: coupons.length,
        totalItems: total,
      },
    });

  } catch (error) {
    console.error("Error fetching coupons:", error);
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

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      maxDiscount,
      minOrderValue,
      applicableTo,
      courses,
      categories,
      usageLimit,
      userLimit,
      validFrom,
      validUntil,
    } = body;

    // Validation
    if (!code || !description || !type || !value || !validUntil) {
      return NextResponse.json(
        { error: "Required fields: code, description, type, value, validUntil" },
        { status: 400 }
      );
    }

    if (type === "percentage" && (value < 1 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (type === "fixed" && value <= 0) {
      return NextResponse.json(
        { error: "Fixed discount value must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      type,
      value,
      maxDiscount: type === "percentage" ? maxDiscount : undefined,
      minOrderValue: minOrderValue || 0,
      applicableTo: applicableTo || "all",
      courses: applicableTo === "specific_courses" ? courses || [] : [],
      categories: applicableTo === "specific_categories" ? categories || [] : [],
      usageLimit,
      userLimit: userLimit || 1,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: new Date(validUntil),
      createdBy: session.user.id,
    });

    await coupon.save();
    await coupon.populate("createdBy", "name email");
    await coupon.populate("courses", "title");

    return NextResponse.json({
      success: true,
      data: coupon,
      message: "Coupon created successfully",
    });

  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}