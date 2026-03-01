"use client";

import Navbar from "./Navbar";
import Footer from "./footer";
import Toasts from "@/components/toast"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />

      {/* Global toast viewport */}
      <Toasts />
    </>
  );
}
