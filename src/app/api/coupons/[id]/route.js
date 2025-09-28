import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon.model";
import User from "@/models/user.model";

export async function GET(request, { params }) {
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

    const coupon = await Coupon.findById(params.id)
      .populate("createdBy", "name email")
      .populate("courses", "title");

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });

  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
      isActive,
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

    // Check if coupon code already exists (excluding current coupon)
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      _id: { $ne: params.id }
    });
    
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const updateData = {
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
      isActive: isActive !== undefined ? isActive : true,
    };

    const coupon = await Coupon.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email").populate("courses", "title");

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: coupon,
      message: "Coupon updated successfully",
    });

  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const coupon = await Coupon.findByIdAndDelete(params.id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}