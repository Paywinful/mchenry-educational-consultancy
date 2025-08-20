/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast"; 

const navLinks = [
  { name: "Dashboard", href: "/portal/dashboard/student", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { name: "Application", href: "/portal/dashboard/student/application", icon: <FileText className="w-5 h-5 mr-3" /> },
  { name: "Payments", href: "/portal/dashboard/student/payments", icon: <CreditCard className="w-5 h-5 mr-3" /> },
  { name: "Settings", href: "/portal/dashboard/student/settings", icon: <SettingsIcon className="w-5 h-5 mr-3" /> },
];

interface StudentSidebarProps {
  collapsed: boolean;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseClient();

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out");
      router.push("/portal");
    } catch (err: any) {
      toast.error(err?.message || "Sign out failed");
    }
  }

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} h-full bg-white flex flex-col justify-between shadow-md transition-all duration-300`}>
      <div className="flex items-center p-6">
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={48}
          height={48}
          className={`rounded-full border border-gray-200 ${collapsed ? "mx-auto" : ""}`}
        />
      </div>

      <nav className="flex-1 px-4 ">
        <ul className={`space-y-2 mt-4 ${collapsed ? "flex flex-col items-center" : ""}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className={collapsed ? "w-full flex justify-center" : ""}>
                <button
                  onClick={() => router.push(link.href)}
                  className={`flex items-center w-full hover:cursor-pointer text-left p-2 rounded-lg font-semibold transition-colors duration-150 ${
                    isActive ? "bg-[#F5EFDB] text-black" : "hover:bg-gray-100 text-gray-700"
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
        <button
          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 hover:cursor-pointer text-gray-700 font-medium justify-center"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
