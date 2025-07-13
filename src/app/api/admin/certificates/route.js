import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";
import User from "@/models/user.model";

// GET /api/admin/certificates - Admin: Get all certificates with filtering
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // valid, revoked

    const filter = {};
    
    if (status === "valid") {
      filter.isValid = true;
    } else if (status === "revoked") {
      filter.isValid = false;
    }

    const skip = (page - 1) * limit;

    // Build search pipeline
    let pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "course.title": { $regex: search, $options: "i" } },
            { certificateId: { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    // Add status filter
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { issuedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const certificates = await Certificate.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
    countPipeline.push({ $count: "total" });
    const countResult = await Certificate.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: certificates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
