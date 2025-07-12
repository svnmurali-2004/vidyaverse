import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model.js";
import OTP from "@/models/otp.model.js";
import db from "@/lib/db";
import { sendOTPEmail, generateOTP } from "@/lib/email";

export async function POST(request) {
  try {
    await db();

    const { name, email, password, role = "student" } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["student", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'student' or 'admin'" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: "signup" });

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      type: "signup",
    });

    // Store user data temporarily (you might want to encrypt this)
    const tempUserData = {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
    };

    // In a real application, you'd want to store this securely
    // For now, we'll send it back to client (not recommended for production)

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, "signup");

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        message:
          "OTP sent successfully. Please check your email to verify your account.",
        email,
        // Note: In production, don't send sensitive data back to client
        tempData: Buffer.from(JSON.stringify(tempUserData)).toString("base64"),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
