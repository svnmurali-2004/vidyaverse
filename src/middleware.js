import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ✅ Public or auth pages — allow access
    if (
      pathname === "/" ||
      pathname.startsWith("/signin") ||
      pathname.startsWith("/signup")
    ) {
      return NextResponse.next();
    }

    // ✅ Admin-only API route (corrected path)
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

    // ✅ All other protected API routes (except auth)
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      if (!token) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // ✅ All other routes (pages) — require login
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicRoutes = [
          "/",
          "/about",
          "/contact",
          "/signin",
          "/signup",
          "/auth/error",
          "/auth/verify-request",
        ];

        const isPublic = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        const isAsset =
          pathname.startsWith("/_next") ||
          pathname.includes(".") ||
          pathname === "/favicon.ico";

        if (isPublic || isAsset || pathname.startsWith("/api/auth")) {
          return true;
        }

        return !!token; // Require authentication
      },
    },
  }
);

// ✅ Matcher for relevant routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
