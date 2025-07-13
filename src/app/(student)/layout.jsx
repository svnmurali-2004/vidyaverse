"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudentLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
