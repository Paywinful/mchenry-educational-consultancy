"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import AppHeader from "@/components/dashboard/AppHeader";
import { usePathname, useRouter } from "next/navigation";

const adminLinks = [
  { name: "Dashboard", href: "/portal/dashboard/admin" },
  { name: "Students", href: "/portal/dashboard/admin/students" },
  { name: "Payments", href: "/portal/dashboard/admin/payments" },
  { name: "Profile", href: "/portal/dashboard/admin/profile" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white flex flex-col justify-between shadow-md transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between md:justify-start">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              router.push("/portal/dashboard/admin");
              setSidebarOpen(false);
            }}
          >
            <img src="/logo.jpg" alt="Logo" className="h-12 w-12 rounded-full border" />
            <span className="ml-3 font-bold text-xl text-[#6B0F10] tracking-wide">
              McHenry Admin
            </span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <ul className="space-y-2 mt-4">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      router.push(link.href);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full text-left p-2 rounded-lg font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-[#6B0F10] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {link.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
            Log Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden p-4 bg-white shadow-md flex items-center justify-between">
          <span className="font-bold text-[#6B0F10] text-xl">Admin</span>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Sticky top header for desktop */}
        <div className="hidden md:block sticky top-0 z-30 bg-white shadow-md">
          <AppHeader />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
