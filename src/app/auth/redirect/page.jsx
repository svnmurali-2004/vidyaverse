"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function AuthRedirectContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      console.log("Auth redirect - Status:", status, "Session:", session);

      // Wait a bit for session to be available
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Force get the latest session
        const latestSession = await getSession();
        console.log("Latest session:", latestSession);

        if (latestSession?.user) {
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
            if (latestSession.user.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          }, 1000);
        } else {
          // No session found after waiting, redirect to signin
          console.log("No session found after waiting, redirecting to signin");
          setTimeout(() => {
            router.push("/signin");
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/signin");
      } finally {
        setIsChecking(false);
      }
    };

    // Only run if not already checking and status is not loading
    if (status !== "loading" && isChecking) {
      checkSessionAndRedirect();
    }
  }, [status, router, searchParams, isChecking]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">
          {status === "loading" || isChecking
            ? "Completing sign in..."
            : "Redirecting to your dashboard..."}
        </p>
      </div>
    </div>
  );
}

export default function AuthRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  );
}
