import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon.model";
import CouponUsage from "@/models/couponUsage.model";
import User from "@/models/user.model";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days")) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Overview Statistics
    const [totalCoupons, activeCoupons, totalUsageResult, totalSavingsResult] = await Promise.all([
      Coupon.countDocuments({}),
      Coupon.countDocuments({ isActive: true }),
      CouponUsage.countDocuments({ usedAt: { $gte: startDate } }),
      CouponUsage.aggregate([
        { $match: { usedAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$discountAmount" } } }
      ])
    ]);

    const totalUsage = totalUsageResult;
    const totalSavings = totalSavingsResult[0]?.total || 0;

    // Top Performing Coupons
    const topCoupons = await CouponUsage.aggregate([
      { $match: { usedAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$coupon",
          usageCount: { $sum: 1 },
          totalSavings: { $sum: "$discountAmount" },
          avgDiscount: { $avg: "$discountAmount" }
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "coupons",
          localField: "_id",
          foreignField: "_id",
          as: "couponInfo"
        }
      },
      { $unwind: "$couponInfo" },
      {
        $project: {
          _id: 1,
          code: "$couponInfo.code",
          type: "$couponInfo.type",
          isActive: "$couponInfo.isActive",
          usageCount: 1,
          totalSavings: { $round: ["$totalSavings", 2] },
          avgDiscount: { $round: ["$avgDiscount", 2] }
        }
      }
    ]);

    // Usage by Month (last 6 months)
    const usageByMonth = await CouponUsage.aggregate([
      { $match: { usedAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: {
            year: { $year: "$usedAt" },
            month: { $month: "$usedAt" }
          },
          usage: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" }
                }
              }
            ]
          },
          usage: 1
        }
      }
    ]);

    // Savings by Coupon Type
    const savingsByType = await CouponUsage.aggregate([
      { $match: { usedAt: { $gte: startDate } } },
      {
        $lookup: {
          from: "coupons",
          localField: "coupon",
          foreignField: "_id",
          as: "couponInfo"
        }
      },
      { $unwind: "$couponInfo" },
      {
        $group: {
          _id: "$couponInfo.type",
          value: { $sum: "$discountAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          name: {
            $cond: {
              if: { $eq: ["$_id", "percentage"] },
              then: "Percentage",
              else: "Fixed Amount"
            }
          },
          value: { $round: ["$value", 2] }
        }
      }
    ]);

    // Recent Usage (last 20 entries)
    const recentUsage = await CouponUsage.find({ usedAt: { $gte: startDate } })
      .populate("coupon", "code type")
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ usedAt: -1 })
      .limit(20)
      .lean();

    const analytics = {
      overview: {
        totalCoupons,
        activeCoupons,
        totalUsage,
        totalSavings: Math.round(totalSavings * 100) / 100
      },
      topCoupons,
      usageByMonth,
      savingsByType,
      recentUsage
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error("Error fetching coupon analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}