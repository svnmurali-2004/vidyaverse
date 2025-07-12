'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PWAInstall from '@/components/PWAInstall';

export default function StudentLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <PWAInstall />
    </>
  );
}
