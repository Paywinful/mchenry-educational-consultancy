"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard/student",
    icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
  },
  {
    name: "Application",
    href: "/dashboard/student/application",
    icon: <FileText className="w-5 h-5 mr-3" />,
  },
  {
    name: "Payments",
    href: "/dashboard/student/payments",
    icon: <CreditCard className="w-5 h-5 mr-3" />,
  },
  {
    name: "Settings",
    href: "/dashboard/student/settings",
    icon: <SettingsIcon className="w-5 h-5 mr-3" />,
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-full bg-white flex flex-col justify-between shadow-md transition-all duration-300`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={48}
            height={48}
            className={`rounded-full border border-gray-200 ${
              collapsed ? "mx-auto" : ""
            }`}
          />
          {!collapsed && (
            <span className="ml-3 font-bold text-xl text-[#6B0F10] tracking-wide"></span>
          )}
        </div>
        <button
          className="ml-2 p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[#6B0F10]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[#6B0F10]" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-4">
        <ul
          className={`space-y-2 mt-4 ${
            collapsed ? "flex flex-col items-center" : ""
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li
                key={link.name}
                className={collapsed ? "w-full flex justify-center" : ""}
              >
                <button
                  onClick={() => router.push(link.href)}
                  className={`flex items-center w-full text-left p-2 rounded-lg font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-[#6B0F10] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {link.icon}
                  {!collapsed && <span>{link.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`p-4 mb-2 ${collapsed ? "flex justify-center" : ""}`}>
        <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium justify-center">
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
