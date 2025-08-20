/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";

export default function Portal() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = supabaseClient();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.warning("Please enter your full name");
          setSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        if (data.user) {
          // Create profile shell + app shell
          const first = fullName.split(" ")[0] || "";
          const last = fullName.split(" ").slice(1).join(" ");
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              first_name: first,
              last_name: last,
            }),
          });
          await fetch("/api/application", { method: "POST" });
        }

        toast.success("Account created");
        toast.info("You may need to verify your email to sign in.");
        router.push("/portal/dashboard/student");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Welcome back!");
        router.push("/portal/dashboard/student");
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full h-screen flex justify-center">
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image src="/about.png" alt="heroleft" fill className="object-cover" />
      </div>

      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white">
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

            <button
              className="bg-[#6B0F10] text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting
                ? isSignUp
                  ? "Creating..."
                  : "Signing in..."
                : isSignUp
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
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
