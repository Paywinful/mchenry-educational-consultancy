"use client";
import React from "react";
import AppHeader from "@/components/dashboard/AppHeader";
import StudentSidebar from "@/components/dashboard/StudentSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      {!collapsed && <StudentSidebar collapsed={collapsed} />}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30">
          <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
