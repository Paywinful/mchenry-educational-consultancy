/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";

// ---- Outer wrapper adds Suspense (required for useSearchParams) ----
export default function Portal() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <PortalInner />
    </Suspense>
  );
}

// ---- All your existing logic lives here ----
function PortalInner() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = supabaseClient();
  const router = useRouter();
  const qs = useSearchParams();

  // If already authenticated, bounce to dashboard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const dest = await getDefaultDashboard();
        router.replace(dest);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getDefaultDashboard(): Promise<string> {
    try {
      const res = await fetch("/api/profile", { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("no profile yet");
      const { profile } = await res.json();
      if (profile?.is_admin) return "/portal/dashboard/admin";
    } catch {
      // ignore – fallback to student
    }
    return "/portal/dashboard/student";
  }

  async function ensureSignedOut() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await supabase.auth.signOut();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Important: clear any existing session so we don’t update the current user
        await ensureSignedOut();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // The DB trigger reads this to prefill first/last name
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        // If email confirmation is ON: session will be null.
        // The DB trigger already created the profile row. No API calls needed.
        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          return;
        }

        // If there IS a session (e.g., dev without email confirmation),
        // we can still upsert extra profile fields and create a starter application.
        const first = fullName.split(" ")[0] || "";
        const last = fullName.split(" ").slice(1).join(" ");

        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, first_name: first, last_name: last }),
        });

        // Optional: create starter application immediately in this flow
        await fetch("/api/application", { method: "POST", credentials: "include" });

        const redirect = qs.get("redirect");
        router.push(redirect || (await getDefaultDashboard()));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const redirect = qs.get("redirect");
        toast.success("Login successfully")
        router.push(redirect || (await getDefaultDashboard()));
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication error");
    }
  }

  return (
    <div className="w-full h-screen flex justify-center">
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image src="/about.png" alt="heroleft" fill className="object-cover" />
      </div>

      <div className="w-1/2 h-full flex items-center justify-center bg-white">
        <div className="text-center w-80">
          <h3 className="text-2xl font-bold mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h3>

          <form className="space-y-4" onSubmit={onSubmit}>
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="border p-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="border p-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="bg-[#6B0F10] hover:cursor-pointer text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition">
              {isSignUp ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={async () => {
                    await ensureSignedOut(); // avoid weird state if toggling while logged in
                    setIsSignUp(false);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={async () => {
                    await ensureSignedOut();
                    setIsSignUp(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
