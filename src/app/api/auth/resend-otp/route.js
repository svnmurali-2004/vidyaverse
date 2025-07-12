import { NextResponse } from "next/server";
import OTP from "@/models/otp.model.js";
import db from "@/lib/db";
import { sendOTPEmail, generateOTP } from "@/lib/email";

export async function POST(request) {
  try {
    await db();

    const { email, type = "signup" } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check rate limiting - prevent sending OTP too frequently
    const recentOTP = await OTP.findOne({
      email,
      type,
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) }, // 2 minutes
    });

    if (recentOTP) {
      return NextResponse.json(
        { error: "Please wait 2 minutes before requesting a new OTP" },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email, type });

    // Save new OTP to database
    await OTP.create({
      email,
      otp,
      type,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, type);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        message: "OTP sent successfully. Please check your email.",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
