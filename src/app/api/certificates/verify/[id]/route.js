import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Certificate from "@/models/certificate.model";

// GET /api/certificates/verify/[id] - Verify certificate by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const certificate = await Certificate.findOne({ certificateId: id })
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
        certificateId: certificate.certificateId,
        courseName: certificate.courseName,
        userName: certificate.userName,
        instructorName: certificate.instructorName,
        issuedAt: certificate.issuedAt,
        completionDate: certificate.completionDate,
        isValid: true,
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
