"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard/student",
    icon: (
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0H7m6 0v6m0 0h6m-6 0H7"
        />
      </svg>
    ),
  },
  {
    name: "Application",
    href: "/dashboard/student/application",
    icon: (
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 00-4-4V7a4 4 0 018 0v2a4 4 0 00-4 4z"
        />
      </svg>
    ),
  },
  {
    name: "Payments",
    href: "/dashboard/student/payments",
    icon: (
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 0C7.582 4 4 7.582 4 12c0 4.418 3.582 8 8 8s8-3.582 8-8c0-4.418-3.582-8-8-8z"
        />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/dashboard/student/settings",
    icon: (
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 h-full bg-white flex flex-col justify-between shadow-md">
      <div className="p-6 flex items-center">
        <img
          src="/logo.jpg"
          alt="Logo"
          className="h-12 w-12 rounded-full border border-gray-200"
        />
        <span className="ml-3 font-bold text-xl text-[#6B0F10] tracking-wide">
          McHenry
        </span>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <button
                  onClick={() => router.push(link.href)}
                  className={`flex items-center w-full text-left p-2 rounded-lg font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-[#6B0F10] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mb-2">
        <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}
