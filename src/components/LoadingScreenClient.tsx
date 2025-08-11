"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function LoadingScreenClient() {
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setActive(true);
    setVisible(true);
    const timeout1 = setTimeout(() => setActive(false), 1200);
    const timeout2 = setTimeout(() => setVisible(false), 1500);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-[#fff] transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      <div className="relative flex flex-col items-center justify-center">
        <div
          className="flex items-center justify-center"
          style={{
            animation:
              "pulse 1.2s infinite, fadeIn 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <span className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-[#6B0F10] animate-spin-slow" />
          <Image
            src="/logonobg.png"
            alt="McHenry Logo"
            width={180}
            height={180}
            className="z-10 object-contain animate-fadein"
            priority
          />
        </div>
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.08);
            }
            100% {
              transform: scale(1);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-spin-slow {
            animation: spin 1.2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .animate-fadein {
            animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </div>
  );
}
