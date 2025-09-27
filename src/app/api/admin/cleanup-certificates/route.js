import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";

// POST /api/admin/cleanup-certificates - Clean up invalid certificate entries
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Find and log problematic certificates before deletion
    const problematicCerts = await Certificate.find({
      $or: [
        { user: null },
        { course: null },
        { user: { $exists: false } },
        { course: { $exists: false } }
      ]
    });

    console.log(`Found ${problematicCerts.length} problematic certificate entries:`);
    problematicCerts.forEach((cert, index) => {
      console.log(`  ${index + 1}. ID: ${cert._id}, user: ${cert.user}, course: ${cert.course}`);
    });

    // Delete problematic certificates
    const cleanupResult = await Certificate.deleteMany({
      $or: [
        { user: null },
        { course: null },
        { user: { $exists: false } },
        { course: { $exists: false } }
      ]
    });

    console.log(`Successfully deleted ${cleanupResult.deletedCount} invalid certificate entries`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: deleted ${cleanupResult.deletedCount} invalid certificate entries`,
      deletedCount: cleanupResult.deletedCount,
      details: problematicCerts.map(cert => ({
        id: cert._id,
        user: cert.user,
        course: cert.course,
        createdAt: cert.createdAt
      }))
    });

  } catch (error) {
    console.error("Error cleaning up certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup certificates" },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup-certificates - Check for invalid certificate entries
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Find problematic certificates
    const problematicCerts = await Certificate.find({
      $or: [
        { user: null },
        { course: null },
        { user: { $exists: false } },
        { course: { $exists: false } }
      ]
    });

    // Also get total certificate count for context
    const totalCerts = await Certificate.countDocuments();

    return NextResponse.json({
      success: true,
      totalCertificates: totalCerts,
      problematicCount: problematicCerts.length,
      problematicCertificates: problematicCerts.map(cert => ({
        id: cert._id,
        user: cert.user,
        course: cert.course,
        certificateId: cert.certificateId,
        createdAt: cert.createdAt,
        issuedAt: cert.issuedAt
      }))
    });

  } catch (error) {
    console.error("Error checking certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check certificates" },
      { status: 500 }
    );
  }
}