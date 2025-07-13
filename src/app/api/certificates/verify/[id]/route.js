import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";

// GET /api/certificates/verify/[id] - Verify certificate by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const certificate = await Certificate.findOne({
      $or: [
        { certificateId: id },
        { _id: id }
      ]
    })
      .populate("course", "title thumbnail")
      .populate("user", "name")
      .lean();

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        certificateId: certificate.certificateId || certificate._id.toString().substring(0, 12).toUpperCase(),
        courseName: certificate.course.title,
        userName: certificate.user.name,
        instructorName: certificate.instructorName || "VidyaVerse Team",
        issuedAt: certificate.issuedAt,
        completionDate: certificate.issuedAt,
        isValid: certificate.isValid,
      },
      message: "Certificate is valid",
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
