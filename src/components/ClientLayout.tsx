"use client";

import Footer from "./footer";
import Navbar from "./Navbar";
import Toasts from "@/components/toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)]">{children}</main>
      <Footer />
      <Toasts />
    </>
  );
}
