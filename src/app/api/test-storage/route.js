import { NextResponse } from "next/server";
import { testVercelBlobConnection } from "@/lib/blob";

export async function GET() {
  try {
    const testResult = await testVercelBlobConnection();
    
    return NextResponse.json({
      message: "Vercel Blob connection test",
      result: testResult,
    });
  } catch (error) {
    console.error("Error testing Vercel Blob connection:", error);
    return NextResponse.json(
      { error: "Failed to test connection", details: error.message },
      { status: 500 }
    );
  }
}
