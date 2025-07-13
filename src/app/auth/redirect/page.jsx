"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Check if this is coming from OAuth (like Google sign-in)
      const isOAuth =
        searchParams.get("callbackUrl") ||
        (typeof window !== "undefined" &&
          (window.location.href.includes("google") ||
            window.location.href.includes("github")));

      if (isOAuth) {
        toast.success("🎉 Signed in successfully with Google!");
      }

      // Small delay to show the toast before redirect
      setTimeout(() => {
        if (session.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } else {
      // No session, redirect to sign in
      router.push("/signin");
    }
  }, [session, status, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
