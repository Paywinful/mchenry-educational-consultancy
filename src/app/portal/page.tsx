/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";

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

  // new password fields
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

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

  // Helper: read possible params from URL hash (for providers that use #)
  function getHashParams(): URLSearchParams {
    if (typeof window === "undefined") return new URLSearchParams("");
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    return new URLSearchParams(hash);
  }

  // ---- Arrival handling: MAGIC via PKCE or token_hash; or fallback to local 'expectMagic' ----
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (event) => {
      // If we just signed in (e.g., after exchange) and we were expecting a magic reset,
      // force the password form regardless of session presence.
      if (event === "SIGNED_IN") {
        if (typeof window !== "undefined" && window.localStorage.getItem("expectMagic") === "1") {
          setCameFromMagic(true);
          setMode("setNewPassword");
        }
      }
    });

    (async () => {
      const errDesc = qs.get("error_description");
      if (errDesc) {
        setArrivalError(decodeURIComponent(errDesc));
        setMode("forgot");
        return;
      }

      // Prefer query params
      let type = qs.get("type");                 // "magic" or "magiclink"
      let code = qs.get("code");                 // PKCE
      let tokenHash = qs.get("token_hash");      // OTP token

      // Fall back to hash params if query missing
      if (!type || (!code && !tokenHash)) {
        const h = getHashParams();
        type = type || h.get("type") || undefined!;
        code = code || h.get("code") || undefined!;
        tokenHash = tokenHash || h.get("token_hash") || undefined!;
      }

      // 1) MAGIC via PKCE
      if (type === "magic" && code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          // If we got here, we have a session for this browser now
          setCameFromMagic(true);
          setMode("setNewPassword");
          return; // ⛔ do not redirect
        } catch {
          // fall through to token_hash attempt
        }
      }

      // 2) MAGIC via token_hash (does not require PKCE verifier)
      if ((type === "magic" || type === "magiclink") && tokenHash) {
        try {
          const storedEmail =
            (typeof window !== "undefined" && window.localStorage.getItem("recoveryEmail")) || "";
          if (!storedEmail) throw new Error("Missing email for magic verification");
          const { error } = await supabase.auth.verifyOtp({
            type: "magiclink",
            token_hash: tokenHash,
            email: storedEmail,
          });
          if (error) throw error;
          setCameFromMagic(true);
          setMode("setNewPassword");
          return; // ⛔ do not redirect
        } catch {
          setArrivalError("Link is invalid or expired. Please request a new one.");
          setMode("forgot");
          return;
        }
      }

      // 3) If no recognizable magic params, but we *expect* magic (email client stripped params)
      if (typeof window !== "undefined" && window.localStorage.getItem("expectMagic") === "1") {
        // If we already have a session (SIGNED_IN event may have fired), show the form anyway.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCameFromMagic(true);
          setMode("setNewPassword");
          return; // ⛔ do not redirect
        }
        // Otherwise, fall through to normal redirect below.
      }

      // 4) Normal visit: if signed in and NOT in magic context, go to dashboard
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const dest = await getDefaultDashboard();
        router.replace(dest);
      }
    })();

    return () => {
      sub.data.subscription.unsubscribe();
    };
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

  // Make sure there is a session before updating password
  async function ensureSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    // Try re-exchange from query/hash
    let code = qs.get("code");
    let tokenHash = qs.get("token_hash");
    if (!code || !tokenHash) {
      const h = getHashParams();
      code = code || h.get("code") || undefined!;
      tokenHash = tokenHash || h.get("token_hash") || undefined!;
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return true;
    }
    if (tokenHash) {
      const storedEmail =
        (typeof window !== "undefined" && window.localStorage.getItem("recoveryEmail")) || "";
      if (storedEmail) {
        const { error } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: tokenHash,
          email: storedEmail,
        });
        if (!error) return true;
      }
    }
    return false;
  }

  // ---- Forgot password: send MAGIC link (only path) ----
  async function onSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);

      // Clear any existing session first so reset context is clean
      await supabase.auth.signOut();

      // Remember email + set expectation flag for resilience
      if (typeof window !== "undefined") {
        window.localStorage.setItem("recoveryEmail", email);
        window.localStorage.setItem("expectMagic", "1");
        window.localStorage.setItem("expectMagicAt", String(Date.now()));
      }

      const origin = getOrigin();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/portal?type=magic` },
      });
      if (error) throw error;

      toast.success("Reset password link sent. Check your email.");
      setArrivalError(null);
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Could not send reset link");
    } finally {
      setBusy(false);
    }
  }

  // ---- Update password after MAGIC sign-in ----
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

      // Clear expectation flag now that password is set
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("expectMagic");
        window.localStorage.removeItem("expectMagicAt");
      }

      toast.success("Password updated.");
      const dest = await getDefaultDashboard();
      router.replace(dest);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  // ---- Sign up / Sign in (unchanged) ----
  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  try {
    setBusy(true);

    if (mode === "signup") {
      // 🔒 Password length validation
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }

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

          {/* Forgot password → send MAGIC link */}
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
                {busy ? "Sending…" : "Send Reset Link"}
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

          {/* Set new password after MAGIC sign-in */}
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
                  You’re signed in via reset link. Updating your password will keep you signed in.
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

          {/* Toggle link */}
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
