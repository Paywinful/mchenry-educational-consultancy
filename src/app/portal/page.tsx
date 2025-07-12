"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Portal() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full h-screen flex justify-center">
      {/* Left side - Image */}
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image src="/about.png" alt="heroleft" fill className="object-cover" />
      </div>

      {/* Right side - Form area */}
      <div className="w-1/2 h-full flex items-center justify-center bg-white">
        <div className="text-center w-80">
          <h3 className="text-2xl font-bold mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h3>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSignUp) {
                router.push("/dashboard/student");
              }
            }}
          >
            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="border p-2 w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border p-2 w-full"
                />
              </>
            )}

            <input
              type="text"
              placeholder="Username"
              className="border p-2 w-full"
            />
            <input
              type="password"
              placeholder="Password"
              className="border p-2 w-full"
            />

            {isSignUp && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="border p-2 w-full"
              />
            )}

            <button className="bg-[#6B0F10] text-white px-4 py-2 rounded w-full hover:bg-[#951A1B] hover:cursor-pointer transition">
              {isSignUp ? "Create Account" : "Login"}
            </button>
          </form>

          {/* Toggle prompt */}
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
