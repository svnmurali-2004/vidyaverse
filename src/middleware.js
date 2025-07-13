import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to auth pages for unauthenticated users
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      // If user is already authenticated, redirect to appropriate dashboard
      if (token) {
        const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      return NextResponse.next();
    }

    // Redirect authenticated users from root to appropriate dashboard
    if (pathname === "/" && token) {
      const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Admin route protection
    if (pathname.startsWith("/admin")) {
        if (!token) {
          console.log("redirection from middleware")
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Student route protection
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/courses") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/certificates") ||
      pathname.startsWith("/quizzes")
    ) {
      if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
      }
      // Admin users can access student routes
      if (token.role === "admin" && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

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
          return true;
        }

        // For protected routes, require authentication
        return !!token;
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
