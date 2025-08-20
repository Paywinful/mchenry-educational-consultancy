"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AppHeader({ collapsed, setCollapsed }: AppHeaderProps) {
  const supabase = supabaseClient();
  const router = useRouter();

  const [titleText, setTitleText] = useState("Welcome");
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // no image by default
  const [initials, setInitials] = useState<string>("");   // fallback to initials
  const [notificationCount] = useState(0);

  const today = useMemo(() => new Date(), []);
  const dateString = useMemo(
    () =>
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [today]
  );

  function makeInitials(nameOrEmail: string | undefined | null) {
    if (!nameOrEmail) return "";
    const base = nameOrEmail.trim();
    if (!base) return "";

    // Try words (e.g., "Ama Serwaa")
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();

    // If it's an email, use the local-part
    if (base.includes("@")) return base.split("@")[0].slice(0, 2).toUpperCase();

    // Single word name
    return base.slice(0, 2).toUpperCase();
  }

  async function resolveAvatarUrl(rawPath: string | null | undefined): Promise<string | null> {
    try {
      if (!rawPath) return null;
      if (/^https?:\/\//i.test(rawPath)) return rawPath;

      const parts = String(rawPath).split("/");
      // Support "avatars/<uid>/file" (public) and "documents/<uid>/file" (private)
      let bucket = "avatars";
      let path = rawPath;
      if (parts.length > 1 && (parts[0] === "avatars" || parts[0] === "documents")) {
        bucket = parts[0];
        path = parts.slice(1).join("/");
      }

      if (bucket === "avatars") {
        // Public bucket
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || null;
      }

      // Private bucket (documents)
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
      if (error) return null;
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const { profile } = await res.json();

        if (cancelled) return;

        // Greeting
        let displayName = "";
        if (profile?.first_name || profile?.last_name) {
          displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
          setTitleText(`Welcome ${profile?.first_name ?? displayName}`);
        } else if (user?.email) {
          displayName = user.email;
          setTitleText(`Welcome ${user.email.split("@")[0]}`);
        } else {
          setTitleText("Welcome");
        }

        // Initials fallback
        setInitials(makeInitials(displayName));

        // Avatar (may be null → show initials)
        const url = await resolveAvatarUrl(profile?.avatar_url);
        if (!cancelled) setAvatarUrl(url ?? "");
      } catch {
        if (!cancelled) {
          setAvatarUrl(""); // show initials
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasAvatar = Boolean(avatarUrl);

  return (
    <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md min-h-[70px]">
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded hover:bg-gray-100 transition-all duration-300"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[#6B0F10]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[#6B0F10]" />
          )}
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#6B0F10]">{titleText}</h2>
          <p className="text-xs text-gray-500 mt-1">Today is {dateString}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            aria-label="Notifications"
            onClick={() => router.push("/portal/dashboard/student/notifications")}
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Avatar or Initials */}
        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
          {hasAvatar ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover w-10 h-10"
              unoptimized={/^https?:\/\//.test(avatarUrl)}
              onError={() => setAvatarUrl("")} // fall back to initials
            />
          ) : (
            <span className="text-xs font-semibold text-gray-700 select-none">
              {initials || "🙂"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
