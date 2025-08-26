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

  // UI state
  const [arrivalError, setArrivalError] = useState<string | null>(null);
  const [cameFromMagic, setCameFromMagic] = useState(false);
  const [busy, setBusy] = useState(false);

  const supabase = supabaseClient();
  const router = useRouter();
  const qs = useSearchParams();

  function getOrigin() {
    return (
      (typeof window !== "undefined" && window.location.origin) ||
      process.env.NEXT_PUBLIC_APP_URL!
    );
  }

  // ---------- On arrival: handle MAGIC via PKCE or OTP token_hash ----------
  useEffect(() => {
    (async () => {
      const type = qs.get("type");
      const errDesc = qs.get("error_description");
      const code = qs.get("code");             // PKCE code
      const tokenHash = qs.get("token_hash");  // OTP token alternative

      if (errDesc) {
        setArrivalError(decodeURIComponent(errDesc));
        setMode("forgot");
        return;
      }

      // 1) Try PKCE exchange if code is present
      if (type === "magic" && code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setCameFromMagic(true);
          setMode("setNewPassword");
          return;
        } catch {
          // Proceed to try token_hash path (some providers rewrite the link style)
        }
      }

      // 2) Try token_hash verification (works without PKCE verifier)
      // Supabase sends ?token_hash=...&type=magiclink for some email providers/settings
      if ((type === "magic" || type === "magiclink") && tokenHash) {
        try {
          const stored =
            (typeof window !== "undefined" && window.localStorage.getItem("recoveryEmail")) || "";
          if (!stored) {
            setArrivalError(
              "Magic link was opened in a different browser or device. Please request a new link from this browser."
            );
            setMode("forgot");
            return;
          }
          const { error } = await supabase.auth.verifyOtp({
            type: "magiclink",
            token_hash: tokenHash,
            email: stored,
          });
          if (error) throw error;
          setCameFromMagic(true);
          setMode("setNewPassword");
          return;
        } catch {
          setArrivalError("Magic link is invalid or expired. Please request a new one.");
          setMode("forgot");
          return;
        }
      }

      // 3) Normal path: already signed in? → go to dashboard
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
    } catch {}
    return "/portal/dashboard/student";
  }

  async function ensureSignedOut() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await supabase.auth.signOut();
  }

  // Ensure there is a session before updating password (covers both flows)
  async function ensureSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    // Try PKCE re-exchange
    const code = qs.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return true;
    }

    // Try token_hash verification if present
    const tokenHash = qs.get("token_hash");
    if (tokenHash) {
      const stored =
        (typeof window !== "undefined" && window.localStorage.getItem("recoveryEmail")) || "";
      if (stored) {
        const { error } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: tokenHash,
          email: stored,
        });
        if (!error) return true;
      }
    }

    return false;
  }

  // ---------- Forgot password: send MAGIC link ----------
  async function onSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);

      // Remember email for token_hash verification path
      if (typeof window !== "undefined") {
        window.localStorage.setItem("recoveryEmail", email);
      }

      const origin = getOrigin();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/portal?type=magic` },
      });
      if (error) throw error;

      toast.success("Magic sign-in link sent. Check your email.");
      setArrivalError(null);
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Could not send magic link");
    } finally {
      setBusy(false);
    }
  }

  // ---------- Update password after MAGIC sign-in ----------
  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw1.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pw1 !== pw2) return toast.error("Passwords do not match.");
    try {
      setBusy(true);

      const ok = await ensureSession();
      if (!ok) {
        toast.error("Your session is missing or expired. Click the email link again.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      setPw1(""); setPw2(""); setPassword("");

      // Magic flow keeps the user signed in
      toast.success("Password updated.");
      const dest = await getDefaultDashboard();
      router.replace(dest);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  // ---------- Sign up / Sign in (unchanged) ----------
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);

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
    } finally {
      setBusy(false);
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

          {arrivalError && (
            <div className="mb-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded p-3">
              {arrivalError}
            </div>
          )}

          {/* Forgot password → MAGIC link */}
          {mode === "forgot" && (
            <form className="space-y-4" onSubmit={onSendMagicLink}>
              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                disabled={busy}
                className="bg-[#6B0F10] disabled:opacity-60 text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition"
              >
                {busy ? "Sending…" : "Send Magic Sign-In Link"}
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

          {/* Set new password after MAGIC sign-in (PKCE or token_hash verified) */}
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
              <button
                disabled={busy}
                className="bg-[#6B0F10] disabled:opacity-60 text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition"
              >
                {busy ? "Updating…" : "Update Password"}
              </button>
              {cameFromMagic && (
                <p className="text-xs text-gray-500">
                  You’re signed in via magic link. Updating your password will keep you signed in.
                </p>
              )}
            </form>
          )}

          {/* Sign in / Sign up */}
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
              <button
                disabled={busy}
                className="bg-[#6B0F10] disabled:opacity-60 text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition"
              >
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

          {/* Toggle between sign in and sign up */}
          {(mode === "signin" || mode === "signup") && (
            <p className="mt-2 text-sm text-gray-600">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={async () => {
                      await ensureSignedOut();
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
