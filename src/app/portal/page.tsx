/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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

type Mode = "signin" | "signup" | "forgot" | "setNewPassword";

// ---- All your existing logic lives here ----
function PortalInner() {
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // new-password fields
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const supabase = supabaseClient();
  const router = useRouter();
  const qs = useSearchParams();

  // If already authenticated, bounce to dashboard—BUT skip if coming from a recovery link
 useEffect(() => {
  (async () => {
    // 1) Handle PKCE-style links: /portal?code=...&type=recovery
    const code = qs.get("code");
    const urlType = qs.get("type");
    if (code && urlType === "recovery") {
      try {
        // Exchange ?code=... for a session, then show reset form
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        setMode("setNewPassword");
        return; // stop normal bounce-to-dashboard logic
      } catch (e: any) {
        console.error(e);
        toast.error("Recovery link invalid or expired. Request a new one.");
        return;
      }
    }

    // 2) Handle hash-style links: /portal#access_token=...&type=recovery
    const fromRecovery =
      (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) ||
      qs.get("type") === "recovery";

    if (fromRecovery) {
      setMode("setNewPassword");
      return;
    }

    // Normal "already signed in?" redirect
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const dest = await getDefaultDashboard();
      router.replace(dest);
    }
  })();

  // Keep your existing listener — it still helps in hash-based flows
  const { data: sub } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") setMode("setNewPassword");
  });
  return () => sub.subscription.unsubscribe();
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

  // Send reset link (stays on the same page)
  async function onSendResetLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      const origin =
        (typeof window !== "undefined" && window.location.origin) ||
        process.env.NEXT_PUBLIC_APP_URL 
      const redirectTo = `${origin}/portal`; // redirect right back to THIS page
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast.success("Password reset link sent. Check your email.");
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Could not send reset link");
    }
  }

  // Handle new password (after clicking email link)
  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw1.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pw1 !== pw2) return toast.error("Passwords do not match.");
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      // clean up recovery session + URL hash
      await supabase.auth.signOut();
      setPw1(""); setPw2("");
      setPassword("");
      toast.success("Password updated. Please sign in.");
      setMode("signin");
      router.replace("/portal"); // clears the auth hash in URL
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    }
  }

  // Sign up / Sign in
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "signup") {
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
          setMode("signin");
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
        toast.success("Login successfully");
        router.push(redirect || (await getDefaultDashboard()));
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication error");
    }
  }

  const title = useMemo(() => {
    if (mode === "forgot") return "Reset Password";
    if (mode === "setNewPassword") return "Set a New Password";
    return mode === "signup" ? "Sign Up" : "Sign In";
  }, [mode]);

  return (
    <div className="w-full h-screen flex justify-center">
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image src="/about.png" alt="heroleft" fill className="object-cover" />
      </div>

      <div className="w-1/2 h-full flex items-center justify-center bg-white">
        <div className="text-center w-80">
          <h3 className="text-2xl font-bold mb-6">{title}</h3>

          {/* ---- MODE: Forgot (send link) ---- */}
          {mode === "forgot" && (
            <form className="space-y-4" onSubmit={onSendResetLink}>
              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="bg-[#6B0F10] hover:cursor-pointer text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition">
                Send Reset Link
              </button>

              <p className="mt-6 text-sm text-gray-600">
                Remembered your password?{" "}
                <button
                  onClick={async () => {
                    await ensureSignedOut();
                    setMode("signin");
                  }}
                  type="button"
                  className="text-blue-600 hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          {/* ---- MODE: Set new password (after email link) ---- */}
          {mode === "setNewPassword" && (
            <form className="space-y-4" onSubmit={onUpdatePassword}>
              <input
                type="password"
                placeholder="New password"
                className="border p-2 w-full"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="border p-2 w-full"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />
              <button className="bg-[#6B0F10] hover:cursor-pointer text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition">
                Update Password
              </button>
            </form>
          )}

          {/* ---- MODE: Sign in / Sign up ---- */}
          {(mode === "signin" || mode === "signup") && (
            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === "signup" && (
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
                {mode === "signup" ? "Create Account" : "Login"}
              </button>

              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      await ensureSignedOut();
                      setMode("forgot");
                    }}
                    className="text-sm text-center hover:cursor-pointer text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Toggle sign in/sign up (hide during forgot / setNewPassword) */}
          {(mode === "signin" || mode === "signup") && (
            <p className="mt-2 text-sm text-gray-600">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={async () => {
                      await ensureSignedOut(); // avoid weird state if toggling while logged in
                      setMode("signin");
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
                      setMode("signup");
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
