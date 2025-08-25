"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  const [avatarSrc, setAvatarSrc] = useState<string>("/placeholder.svg?height=40&width=40");
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [adminCheck, setadminCheck] = useState(false)

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
  

  // Load greeting + avatar (public avatars bucket or signed docs)
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
        setadminCheck(profile.is_admin)
        if (cancelled) return;

        // Greeting
        if (profile?.first_name) {
          setTitleText(`Welcome ${profile.first_name}`);
        } else if (user?.email) {
          setTitleText(`Welcome ${user.email.split("@")[0]}`);
        }

        // Avatar: if it's already a full URL, use it; else resolve via Supabase
        const raw: string = String(profile?.avatar_url || "");
        if (raw) {
          if (/^https?:\/\//i.test(raw)) {
            setAvatarSrc(raw);
          } else {
            // Expect "avatars/<uid>/file" (public) or "documents/<uid>/file" (private)
            const parts = raw.split("/");
            const bucket = parts[0];
            const path = parts.slice(1).join("/");

            if (bucket === "avatars") {
              const { data } = supabase.storage.from("avatars").getPublicUrl(path);
              if (data?.publicUrl) setAvatarSrc(data.publicUrl);
            } else {
              const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
              if (data?.signedUrl) setAvatarSrc(data.signedUrl);
            }
          }
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNotificationCount(0);
        return;
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (!error) setNotificationCount(count ?? 0);
    } catch {
      // silent fail; keep previous count
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchUnreadCount();
      if (cancelled) return;

      // Realtime subscription for changes to this user's notifications
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("notifications-count")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            // Recompute count on any insert/update/delete for the user
            await fetchUnreadCount();
          }
        )
        .subscribe();

      // also refresh on window focus (returning from other pages)
      const onFocus = () => fetchUnreadCount();
      window.addEventListener("focus", onFocus);

      return () => {
        window.removeEventListener("focus", onFocus);
        supabase.removeChannel(channel);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, fetchUnreadCount]);

  return (
    <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md min-h-[70px]">
      <div className="flex items-center">
        <button
          className="mr-4 hover:cursor-pointer p-2 rounded hover:bg-gray-100 transition-all duration-300"
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
            onClick={() => {
              if(adminCheck){
                router.push("/portal/dashboard/admin/notifications")
              }else{
                router.push("/portal/dashboard/student/notifications")
            }}}
          >
            <Bell className="w-6 h-6 text-gray-700 hover:cursor-pointer" />
            {/* Badge */}
            <span
              className={`absolute -top-1 -right-1 text-white text-xs rounded-full px-1.5 py-0.5 font-bold ${
                notificationCount > 0 ? "bg-red-600" : "bg-gray-400"
              }`}
              title={notificationCount > 0 ? `${notificationCount} unread` : "No new notifications"}
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          </button>
        </div>

        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300">
          <Image
            src={avatarSrc}
            alt="Profile"
            width={40}
            height={40}
            className="object-cover w-10 h-10"
            unoptimized={/^https?:\/\//.test(avatarSrc)}
          />
        </div>
      </div>
    </header>
  );
}
