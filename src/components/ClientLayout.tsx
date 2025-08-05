"use client";

import Navbar from "./Navbar";
import Footer from "./footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard/");
  console.log("Current pathname:", pathname, "isDashboard:", isDashboard); // Debug log

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}
