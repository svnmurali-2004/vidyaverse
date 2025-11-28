"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudentLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay before checking session to prevent flash
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only check authentication after the delay
    if (!isReady || status === "loading") return;

    // Allow public access to courses, about, and contact pages
    const publicPaths = ["/courses", "/about", "/contact"];
    if (publicPaths.some(path => pathname?.startsWith(path))) return;

    if (!session) {
      console.log("❌ No session found for student area, redirecting to home");
      router.push("/");
      return;
    }

    console.log("✅ Student access granted for:", session.user?.email);
  }, [session, status, router, isReady, pathname]);

  // Show loading state while session is being fetched or during delay
  if (!isReady || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show redirecting state if user is not authenticated
  const publicPaths = ["/courses", "/about", "/contact"];
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

  if (!session && !isPublicPath) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
