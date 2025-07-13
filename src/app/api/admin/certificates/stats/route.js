import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";

// GET /api/admin/certificates/stats - Admin: Get certificate statistics
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

    // Get current date for monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate statistics
    const stats = await Certificate.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          thisMonth: [
            { $match: { issuedAt: { $gte: startOfMonth } } },
            { $count: "count" }
          ],
          valid: [
            { $match: { isValid: true } },
            { $count: "count" }
          ],
          revoked: [
            { $match: { isValid: false } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      thisMonth: stats[0].thisMonth[0]?.count || 0,
      valid: stats[0].valid[0]?.count || 0,
      revoked: stats[0].revoked[0]?.count || 0
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching certificate stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
