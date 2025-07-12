import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Certificate from "@/models/certificate.model";
import jsPDF from "jspdf";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const certificate = await Certificate.findById(id)
      .populate("user", "name email")
      .populate("course", "title instructor");

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check if user owns this certificate or is an admin
    if (
      certificate.user._id.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate PDF certificate
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Certificate design
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background and border
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Decorative border
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Header
    doc.setFontSize(32);
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 40, {
      align: "center",
    });

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", pageWidth / 2, 55, { align: "center" });

    // Student name
    doc.setFontSize(28);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(certificate.user.name, pageWidth / 2, 75, { align: "center" });

    // Course completion text
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("has successfully completed the course", pageWidth / 2, 90, {
      align: "center",
    });

    // Course name
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");

    // Handle long course titles
    const courseTitle = certificate.course.title;
    const maxWidth = pageWidth - 40;
    const splitTitle = doc.splitTextToSize(courseTitle, maxWidth);

    if (splitTitle.length > 1) {
      doc.text(splitTitle, pageWidth / 2, 105, { align: "center" });
    } else {
      doc.text(courseTitle, pageWidth / 2, 110, { align: "center" });
    }

    // Certificate details
    const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`Completed on: ${completionDate}`, pageWidth / 2, 135, {
      align: "center",
    });

    // Instructor signature area
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Instructor:", 50, 160);
    doc.text(certificate.course.instructor || "VidyaVerse Team", 50, 170);

    // Certificate ID
    doc.text("Certificate ID:", pageWidth - 100, 160);
    doc.text(
      certificate._id.toString().substring(0, 12).toUpperCase(),
      pageWidth - 100,
      170
    );

    // VidyaVerse branding
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text("VidyaVerse", pageWidth / 2, pageHeight - 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Online Learning Platform", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });

    // Verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${certificate._id}`;
    doc.setFontSize(8);
    doc.text(`Verify at: ${verificationUrl}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.user.name.replace(
          /\s+/g,
          "-"
        )}-${certificate.course.title.replace(/\s+/g, "-")}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
