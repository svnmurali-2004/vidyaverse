import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Debug logging for production
  if (process.env.NODE_ENV === "production") {
    console.log("🔍 MIDDLEWARE:", {
      pathname,
      host: req.headers.get("host"),
    });
  }

  // ✅ NextAuth.js routes - allow all auth-related endpoints first
  if (pathname.startsWith("/api/auth") || pathname === "/api/auth/session") {
    console.log("✅ Allowing NextAuth route:", pathname);
    return NextResponse.next();
  }

  // ✅ Public pages — allow access
  const publicPages = [
    "/",
    "/about",
    "/contact",
    "/signin",
    "/signup",
    "/auth/error",
    "/auth/verify-request",
  ];

  if (publicPages.some((page) => pathname.startsWith(page))) {
    return NextResponse.next();
  }

  // Get the token for protected routes
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (process.env.NODE_ENV === "production") {
    console.log("🔑 Token check:", {
      pathname,
      hasToken: !!token,
      tokenRole: token?.role,
    });
  }

  // ✅ Admin-only API routes
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (token.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return NextResponse.next();
  }

  // ✅ Student (or Admin) API routes
  const studentApiRoutes = [
    "/api/dashboard",
    "/api/courses",
    "/api/profile",
    "/api/certificates",
    "/api/quizzes",
  ];
  if (studentApiRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (token.role !== "student" && token.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return NextResponse.next();
  }

  // ✅ All other protected API routes
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.next();
  }

  // ✅ Protected pages — require login
  if (!token) {
    console.log("❌ No token for protected page, redirecting to signin");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// ✅ Matcher for relevant routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
