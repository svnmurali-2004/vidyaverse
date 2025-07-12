import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";

// GET /api/test-auth - Test authentication
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
        session: null,
      });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    console.log("User from DB:", user);

    return NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      session,
      user: user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Authentication test failed",
      },
      { status: 500 }
    );
  }
}
