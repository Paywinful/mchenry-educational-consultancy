"use client";

import Navbar from "./Navbar";
import Footer from "./footer";
import { usePathname } from "next/navigation";
import Toasts from "@/components/toast"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/portal/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}

      {/* Global toast viewport */}
      <Toasts />
    </>
  );
}
