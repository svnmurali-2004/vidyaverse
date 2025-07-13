import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Skip detailed logging for static assets and common requests
    const isAsset =
      pathname.startsWith("/_next") ||
      pathname.includes(".") ||
      pathname.startsWith("/favicon");

    if (!isAsset) {
      console.log("🔍 MIDDLEWARE DEBUG:", {
        pathname,
        hasToken: !!token,
        tokenRole: token?.role,
        tokenEmail: token?.email,
        method: req.method,
        userAgent: req.headers.get("user-agent")?.includes("Chrome-Lighthouse")
          ? "Lighthouse"
          : "Browser",
        purpose: req.headers.get("purpose") || "navigation",
        timestamp: new Date().toISOString(),
      });
    }

    // Allow access to auth pages for unauthenticated users
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      console.log("📝 Auth page accessed:", pathname);
      console.log("👤 Allowing access to auth page");
      return NextResponse.next();
    }

    // Allow access to root page for all users
    if (pathname === "/") {
      console.log("🏠 Root page accessed, allowing access");
      return NextResponse.next();
    }

    // API route protection - reject instead of redirect
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      console.log("🔌 API route accessed:", pathname);
      if (!token) {
        console.log("🚫 Rejecting unauthenticated API request with 401");
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Admin route protection
    if (pathname.startsWith("/admin")) {
      console.log("🔐 Admin route accessed:", pathname);
      if (!token) {
        console.log("❌ No token found for admin route");

        // For API requests or prefetch, return 401 instead of redirecting
        if (
          pathname.startsWith("/admin/api") ||
          req.headers.get("purpose") === "prefetch"
        ) {
          console.log("🚫 Rejecting API/prefetch request with 401");
          return new NextResponse("Unauthorized", { status: 401 });
        }

        // For navigation requests, redirect to signin
        console.log("🔄 Redirecting navigation request to signin");
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      if (token.role !== "admin") {
        console.log("⚠️ Non-admin user accessing admin route");

        // For API requests or prefetch, return 403 instead of redirecting
        if (
          pathname.startsWith("/admin/api") ||
          req.headers.get("purpose") === "prefetch"
        ) {
          console.log("🚫 Rejecting API/prefetch request with 403");
          return new NextResponse("Forbidden", { status: 403 });
        }

        // For navigation requests, redirect to dashboard
        console.log("🔄 Redirecting navigation request to dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      console.log("✅ Admin access granted for:", pathname);
    }

    // Student route protection
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/courses") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/certificates") ||
      pathname.startsWith("/quizzes")
    ) {
      console.log("🎓 Student route accessed:", pathname);
      if (!token) {
        console.log("❌ No token found for student route");

        // For API requests or prefetch, return 401 instead of redirecting
        if (
          pathname.includes("/api/") ||
          req.headers.get("purpose") === "prefetch"
        ) {
          console.log("🚫 Rejecting API/prefetch request with 401");
          return new NextResponse("Unauthorized", { status: 401 });
        }

        // For navigation requests, redirect to signin
        console.log("🔄 Redirecting navigation request to signin");
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      // Admin users can access student routes
      console.log("✅ Student route access granted for:", pathname);
    }

    console.log("🚀 Middleware completed, allowing request to proceed");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        console.log("🔑 AUTHORIZED CALLBACK:", {
          pathname,
          hasToken: !!token,
          tokenRole: token?.role,
          method: req.method,
          purpose: req.headers.get("purpose") || "navigation",
          timestamp: new Date().toISOString(),
        });

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/about",
          "/contact",
          "/signin",
          "/signup",
          "/auth/error",
          "/auth/verify-request",
          "/api/auth",
        ];

        // Check if it's a public route or API route
        if (
          publicRoutes.some((route) => pathname.startsWith(route)) ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.includes(".")
        ) {
          console.log("✅ Public route or asset, access granted:", pathname);
          return true;
        }

        // For protected routes, require authentication
        const hasAccess = !!token;
        console.log(
          `${hasAccess ? "✅" : "❌"} Protected route access:`,
          pathname,
          "Token present:",
          hasAccess
        );
        return hasAccess;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
