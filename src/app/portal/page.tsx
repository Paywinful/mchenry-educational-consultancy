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

function PortalInner() {
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // new-password fields
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  // arrival error (e.g., "Your link is invalid or expired")
  const [arrivalError, setArrivalError] = useState<string | null>(null);

  const supabase = supabaseClient();
  const router = useRouter();
  const qs = useSearchParams();

  // Utility to get origin consistently
  function getOrigin() {
    return (
      (typeof window !== "undefined" && window.location.origin) ||
      (process.env.NEXT_PUBLIC_APP_URL as string)
    );
  }

  // If already authenticated, bounce to dashboard—BUT skip if coming from a recovery link
  useEffect(() => {
    (async () => {
      const code = qs.get("code");
      const urlType = qs.get("type");
      const errDesc = qs.get("error_description"); // surfaced by Supabase on error
      // const errCode = qs.get("error_code") || "";

      if (errDesc) {
        // Example: "Your link is invalid or expired"
        setArrivalError(decodeURIComponent(errDesc));
        setMode("forgot"); // push user to resend right away
        return;
      }

      // --- PKCE-style link: /portal?code=...&type=recovery ---
      if (code && urlType === "recovery") {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setMode("setNewPassword"); // show the form
          return;                    // stop the dashboard bounce
        } catch {
          setArrivalError("Your recovery link is invalid or expired. Please request a new one.");
          setMode("forgot");
          return;
        }
      }

      // --- Hash-style link: /portal#...type=recovery ---
      const fromHash =
        typeof window !== "undefined" && window.location.hash.includes("type=recovery");
      if (fromHash || urlType === "recovery") {
        setMode("setNewPassword");
        return;
      }

      // --- Normal path: only now bounce signed-in users ---
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const dest = await getDefaultDashboard();
        router.replace(dest);
      }
    })();

    // Keep the listener; some environments emit PASSWORD_RECOVERY here
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

  // Ensure there is a recovery session before updating password
  async function ensureRecoverySession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    // Try to exchange ?code=... (PKCE flow)
    const code = qs.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return true;
    }

    // Hash-based links: session may attach after a tick
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      const again = await supabase.auth.getSession();
      return !!again.data.session;
    }

    return false;
  }

  // Send reset link (stays on the same page)
  async function onSendResetLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Remember email locally so we can offer 1-click resend if link is expired
      if (typeof window !== "undefined") {
        window.localStorage.setItem("recoveryEmail", email);
      }

      const origin = getOrigin();
      const redirectTo = `${origin}/portal?type=recovery`; // explicit flag
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast.success("Password reset link sent. Check your email.");
      setArrivalError(null);
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Could not send reset link");
    }
  }

  // Quick resend handler for the error case
  async function onResendLink() {
    try {
      const saved =
        (typeof window !== "undefined" && window.localStorage.getItem("recoveryEmail")) || email;
      if (!saved) {
        setMode("forgot");
        toast.error("Enter your email to resend the link.");
        return;
      }
      const origin = getOrigin();
      const redirectTo = `${origin}/portal?type=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(saved, { redirectTo });
      if (error) throw error;
      toast.success("A new reset link has been sent.");
      setArrivalError(null);
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Could not resend link");
    }
  }

  // Handle new password (after clicking email link)
  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw1.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pw1 !== pw2) return toast.error("Passwords do not match.");
    try {
      const ok = await ensureRecoverySession();
      if (!ok) {
        toast.error("Your recovery session is missing or expired. Click the email link again.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      await supabase.auth.signOut(); // end temporary recovery session
      setPw1(""); setPw2(""); setPassword("");
      toast.success("Password updated. Please sign in.");
      setMode("signin");
      router.replace("/portal"); // clears any auth params in URL
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    }
  }

  // Sign up / Sign in
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "signup") {
        await ensureSignedOut();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
          return;
        }

        const first = fullName.split(" ")[0] || "";
        const last = fullName.split(" ").slice(1).join(" ");

        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, first_name: first, last_name: last }),
        });

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
          <h3 className="text-2xl font-bold mb-2">{title}</h3>

          {/* Arrival error banner with quick resend */}
          {arrivalError && (
            <div className="mb-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded p-3">
              {arrivalError}
              <div className="mt-2">
                <button
                  onClick={onResendLink}
                  className="underline text-red-700 hover:text-red-800"
                  type="button"
                >
                  Resend reset email
                </button>
              </div>
            </div>
          )}

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
                    setArrivalError(null);
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
                minLength={8}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="border p-2 w-full"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
                minLength={8}
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
                      setArrivalError(null);
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
                      setArrivalError(null);
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
                      setArrivalError(null);
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
