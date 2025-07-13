import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";

// PATCH /api/admin/certificates/[id]/revoke - Admin: Revoke a certificate
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await connectDB();

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (!certificate.isValid) {
      return NextResponse.json(
        { success: false, error: "Certificate is already revoked" },
        { status: 400 }
      );
    }

    // Revoke the certificate
    certificate.isValid = false;
    certificate.revokedAt = new Date();
    certificate.revokedBy = session.user.id;

    await certificate.save();

    return NextResponse.json({
      success: true,
      data: certificate,
      message: "Certificate revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke certificate" },
      { status: 500 }
    );
  }
}
