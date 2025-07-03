'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="p-2 bg-[#6B0F10] flex text-center text-white font-semibold justify-center w-full text-sm">
        2025 Placements will be available from August 15th
      </div>

      <nav className="p-2 z-30 flex justify-between w-full px-6 items-center text-md relative bg-white shadow-md">
        {/* Logo */}
        <Image src="/logo.jpg" width={70} height={70} alt='Logo Of The Website' />

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <a href="/faq" className="hover:underline">FAQ</a>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/portal" className="p-2 px-7 bg-black text-white rounded-3xl">Find a School</Link>
        </div>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="md:hidden text-3xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center py-4 z-50 md:hidden">
            <Link href="/" className="py-2 hover:underline" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/about" className="py-2 hover:underline" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/faq" className="py-2 hover:underline" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/contact" className="py-2 hover:underline" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/contact" className="mt-4 p-2 px-7 bg-black text-white rounded-3xl" onClick={() => setMenuOpen(false)}>Find a School</Link>
          </div>
        )}
      </nav>
    </div>
  );
}
