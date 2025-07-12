import { NextResponse } from "next/server";
import User from "@/models/user.model.js";
import OTP from "@/models/otp.model.js";
import db from "@/lib/db";

export async function POST(request) {
  try {
    await db();

    const { email, otp, tempData } = await request.json();

    // Validate input
    if (!email || !otp || !tempData) {
      return NextResponse.json(
        { error: "Email, OTP, and user data are required" },
        { status: 400 }
      );
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "signup",
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Decode user data
    let userData;
    try {
      userData = JSON.parse(Buffer.from(tempData, "base64").toString());
    } catch (error) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Double-check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      emailVerified: true,
    });

    // Mark OTP as verified and delete
    await OTP.findByIdAndUpdate(otpRecord._id, { verified: true });
    await OTP.deleteMany({ email, type: "signup" });

    // Return success response (without password)
    return NextResponse.json(
      {
        message: "Email verified and account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
