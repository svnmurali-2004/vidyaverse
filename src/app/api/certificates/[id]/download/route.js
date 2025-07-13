import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Certificate from "@/models/certificate.model";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import jsPDF from "jspdf";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const certificate = await Certificate.findById(id)
      .populate("user", "name email")
      .populate({
        path: "course",
        select: "title instructor",
        populate: {
          path: "instructor",
          select: "name email",
        },
      });

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

    // Elegant gradient-style background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Premium outer border with rounded corners effect
    doc.setDrawColor(37, 99, 235); // Blue-600
    doc.setLineWidth(3);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Inner decorative border
    doc.setDrawColor(147, 197, 253); // Blue-300
    doc.setLineWidth(1);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Elegant corner decorations
    const cornerSize = 15;
    doc.setFillColor(37, 99, 235);

    // Top left corner decoration
    doc.triangle(12, 12, 12 + cornerSize, 12, 12, 12 + cornerSize, "F");

    // Top right corner decoration
    doc.triangle(
      pageWidth - 12,
      12,
      pageWidth - 12 - cornerSize,
      12,
      pageWidth - 12,
      12 + cornerSize,
      "F"
    );

    // Bottom left corner decoration
    doc.triangle(
      12,
      pageHeight - 12,
      12 + cornerSize,
      pageHeight - 12,
      12,
      pageHeight - 12 - cornerSize,
      "F"
    );

    // Bottom right corner decoration
    doc.triangle(
      pageWidth - 12,
      pageHeight - 12,
      pageWidth - 12 - cornerSize,
      pageHeight - 12,
      pageWidth - 12,
      pageHeight - 12 - cornerSize,
      "F"
    );

    // Premium header background
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.rect(20, 20, pageWidth - 40, 35, "F");

    // Header accent line
    doc.setFillColor(59, 130, 246); // Blue-500
    doc.rect(20, 52, pageWidth - 40, 2, "F");

    // Premium header section
    doc.setFontSize(36);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE", pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.setFont("helvetica", "normal");
    doc.text("OF COMPLETION", pageWidth / 2, 45, { align: "center" });

    // Elegant divider
    const dividerY = 65;
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.setLineWidth(0.5);
    doc.line(50, dividerY, pageWidth - 50, dividerY);

    // Central decorative element
    doc.setFillColor(37, 99, 235);
    doc.circle(pageWidth / 2, dividerY, 3, "F");

    // Professional subtitle
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", pageWidth / 2, 80, { align: "center" });

    // Student name with elegant styling
    doc.setFontSize(32);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.setFont("helvetica", "bold");

    // Add decorative underline for student name
    const studentName = certificate.user.name;
    const studentNameY = 100;
    doc.text(studentName, pageWidth / 2, studentNameY, { align: "center" });

    // Elegant underline
    const nameWidth = doc.getTextWidth(studentName);
    const underlineY = studentNameY + 3;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(
      (pageWidth - nameWidth) / 2,
      underlineY,
      (pageWidth + nameWidth) / 2,
      underlineY
    );

    // Course completion text with better spacing
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.setFont("helvetica", "normal");
    doc.text(
      "has successfully completed the comprehensive course",
      pageWidth / 2,
      120,
      {
        align: "center",
      }
    );

    // Course name with elegant presentation
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.setFont("helvetica", "bold");

    // Handle long course titles with better formatting
    const courseTitle = certificate.course.title;
    const maxWidth = pageWidth - 60;
    const splitTitle = doc.splitTextToSize(courseTitle, maxWidth);

    const courseTitleY = splitTitle.length > 1 ? 135 : 140;
    doc.text(splitTitle, pageWidth / 2, courseTitleY, { align: "center" });

    // Course title decorative box
    const titleHeight = splitTitle.length * 8 + 10;
    const boxY = courseTitleY - titleHeight / 2 - 5;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(40, boxY, pageWidth - 80, titleHeight, "S");

    // Achievement details section
    const detailsY = courseTitleY + (splitTitle.length > 1 ? 25 : 20);

    // Professional completion date
    const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.setFont("helvetica", "normal");
    doc.text(`Date of Completion: ${completionDate}`, pageWidth / 2, detailsY, {
      align: "center",
    });

    // Elegant separator line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(60, detailsY + 8, pageWidth - 60, detailsY + 8);

    // Professional signature and credential section
    const signatureY = pageHeight - 60;

    // Left side - Instructor credentials
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.rect(30, signatureY - 15, 80, 35, "F");

    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.setFont("helvetica", "bold");
    doc.text("INSTRUCTOR", 70, signatureY - 8, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.setFont("helvetica", "bold");
    doc.text(
      certificate.course.instructor?.name || "VidyaVerse Team",
      70,
      signatureY + 2,
      { align: "center" }
    );

    // Signature line
    doc.setDrawColor(75, 85, 99);
    doc.setLineWidth(0.5);
    doc.line(40, signatureY + 8, 100, signatureY + 8);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Signature", 70, signatureY + 15, { align: "center" });

    // Center - Certificate credentials (moved from right)
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.rect(pageWidth / 2 - 40, signatureY - 15, 80, 35, "F");

    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE ID", pageWidth / 2, signatureY - 8, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.setFont("helvetica", "bold");
    const certId = certificate._id.toString().substring(0, 12).toUpperCase();
    doc.text(certId, pageWidth / 2, signatureY + 2, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Verification Code", pageWidth / 2, signatureY + 15, {
      align: "center",
    });

    // Enhanced Official Seal - Bottom Right Corner
    const sealX = pageWidth - 50;
    const sealY = pageHeight - 50;
    const sealRadius = 25;

    // Outer seal ring - Gold/Bronze effect
    doc.setFillColor(212, 175, 55); // Gold color
    doc.circle(sealX, sealY, sealRadius, "F");

    // Inner seal ring - Darker gold
    doc.setFillColor(184, 134, 11); // Darker gold
    doc.circle(sealX, sealY, sealRadius - 3, "F");

    // Main seal background - Deep blue
    doc.setFillColor(30, 64, 175); // Blue-800
    doc.circle(sealX, sealY, sealRadius - 5, "F");

    // Inner circle - White
    doc.setFillColor(255, 255, 255);
    doc.circle(sealX, sealY, sealRadius - 8, "F");

    // Central emblem circle - Blue
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.circle(sealX, sealY, sealRadius - 12, "F");

    // Decorative star pattern in center
    doc.setFillColor(255, 255, 255);
    const starSize = 3;
    // Create a simple star shape using triangles
    doc.triangle(
      sealX,
      sealY - starSize,
      sealX - starSize * 0.6,
      sealY + starSize * 0.4,
      sealX + starSize * 0.6,
      sealY + starSize * 0.4,
      "F"
    );
    doc.triangle(
      sealX,
      sealY + starSize,
      sealX - starSize * 0.6,
      sealY - starSize * 0.4,
      sealX + starSize * 0.6,
      sealY - starSize * 0.4,
      "F"
    );

    // Seal text - Top arc
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("VIDYAVERSE", sealX, sealY - 8, { align: "center" });

    // Seal text - Bottom arc
    doc.setFontSize(6);
    doc.text("CERTIFIED", sealX, sealY + 6, { align: "center" });
    doc.text("AUTHENTIC", sealX, sealY + 12, { align: "center" });

    // Year at bottom of seal
    const currentYear = new Date().getFullYear();
    doc.setFontSize(5);
    doc.setTextColor(212, 175, 55); // Gold color
    doc.text(currentYear.toString(), sealX, sealY + 18, { align: "center" });

    // Decorative border around seal
    doc.setDrawColor(212, 175, 55); // Gold color
    doc.setLineWidth(1);
    doc.circle(sealX, sealY, sealRadius + 2, "S");

    // Additional decorative elements around seal
    const dotRadius = 1;
    const dotDistance = sealRadius + 6;
    // Top dot
    doc.setFillColor(212, 175, 55);
    doc.circle(sealX, sealY - dotDistance, dotRadius, "F");
    // Right dot
    doc.circle(
      sealX + dotDistance * 0.7,
      sealY - dotDistance * 0.5,
      dotRadius,
      "F"
    );
    // Bottom dot
    doc.circle(sealX, sealY + dotDistance, dotRadius, "F");
    // Left dot
    doc.circle(
      sealX - dotDistance * 0.7,
      sealY - dotDistance * 0.5,
      dotRadius,
      "F"
    );

    // Premium footer with enhanced branding
    const footerY = pageHeight - 25;

    // Footer background
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.rect(20, footerY - 8, pageWidth - 40, 20, "F");

    // VidyaVerse premium branding
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.setFont("helvetica", "bold");
    doc.text("VidyaVerse", pageWidth / 2, footerY, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.setFont("helvetica", "normal");
    doc.text("Excellence in Online Education", pageWidth / 2, footerY + 6, {
      align: "center",
    });

    // Enhanced verification section
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${certificate._id}`;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(
      `🔒 Verify authenticity at: ${verificationUrl}`,
      pageWidth / 2,
      pageHeight - 3,
      {
        align: "center",
      }
    );

    // Watermark for authenticity
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(60);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("AUTHENTICATED", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: -45,
    });
    doc.setGState(new doc.GState({ opacity: 1 })); // Reset opacity

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Generate professional filename
    const studentNameClean = certificate.user.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    const courseTitleClean = certificate.course.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    const dateStr = new Date(certificate.issuedAt).toISOString().split("T")[0];
    const filename = `VidyaVerse-Certificate-${studentNameClean}-${courseTitleClean}-${dateStr}.pdf`;

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
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
