"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="bg-[#6B0F10] px-4 py-2 text-center text-xs font-medium tracking-wide text-[#FFFBD6] sm:text-sm">
        2026 placements are open. Book your consultation today.
      </div>

      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="McHenry Educational Consultancy Home">
          <Image
            src="/logo.jpg"
            width={52}
            height={52}
            alt="McHenry Educational Consultancy logo"
            className="rounded-full border border-slate-200"
            priority
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">McHenry Educational Consultancy</p>
            <p className="text-xs text-slate-500">Ghanaian Education Advisory</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-[#6B0F10]" : "text-slate-700 hover:text-[#6B0F10]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn-primary">
            Find a School
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#FFFBD6] text-[#6B0F10]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#6B0F10]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/contact" className="btn-primary mt-2">
              Find a School
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
