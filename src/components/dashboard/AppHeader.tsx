import React from "react";
import { Bell } from "lucide-react";
import Image from "next/image";

export default function AppHeader() {
  const userName = "Cudjoe";
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const notificationCount = 3;

  return (
    <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md min-h-[70px]">
      <div>
        <h2 className="text-2xl font-bold text-[#6B0F10]">
          Welcome {userName}
        </h2>
        <p className="text-xs text-gray-500 mt-1">Today is {dateString}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-6 h-6 text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        <div>
          <Image
            src="/member1.jpg"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border border-gray-300 object-cover w-10 h-10"
          />
        </div>
      </div>
    </header>
  );
}
