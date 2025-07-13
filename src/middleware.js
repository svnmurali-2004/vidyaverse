import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    console.log("🔍 MIDDLEWARE DEBUG:", {
      pathname,
      hasToken: !!token,
      tokenRole: token?.role,
      tokenEmail: token?.email,
      timestamp: new Date().toISOString(),
    });

    // Allow access to auth pages for unauthenticated users
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      console.log("📝 Auth page accessed:", pathname);
      // If user is already authenticated, redirect to appropriate dashboard
      if (token) {
        const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
        console.log(
          "✅ Authenticated user on auth page, redirecting to:",
          redirectUrl
        );
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      console.log("👤 Unauthenticated user on auth page, allowing access");
      return NextResponse.next();
    }

    // Redirect authenticated users from root to appropriate dashboard
    if (pathname === "/" && token) {
      const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
      console.log("🏠 Root access with token, redirecting to:", redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Admin route protection
    if (pathname.startsWith("/admin")) {
      console.log("🔐 Admin route accessed:", pathname);
      if (!token) {
        console.log("❌ No token found, redirecting to signin");
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      if (token.role !== "admin") {
        console.log(
          "⚠️ Non-admin user accessing admin route, redirecting to dashboard"
        );
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
        console.log(
          "❌ No token found for student route, redirecting to signin"
        );
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      // Admin users can access student routes
      if (token.role === "admin" && pathname.startsWith("/dashboard")) {
        console.log("👑 Admin accessing dashboard, redirecting to admin panel");
        return NextResponse.redirect(new URL("/admin", req.url));
      }
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
