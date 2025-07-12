import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";
import { hashPassword } from "@/lib/hash";

// POST /api/create-admin - Create admin user (for testing only)
export async function POST(request) {
  try {
    await dbConnect();

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and name are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const adminUser = await User.create({
      email,
      name,
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      provider: "credentials",
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
