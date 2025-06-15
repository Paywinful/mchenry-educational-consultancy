'use client';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#202020] text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Name */}
        <div className="flex items-center md:mr-48 md:mt-[-68px]">
          <img src="/logonobg.png" alt="McHenry Logo" className="w-16 h-16 mb-2 bg-[#202020] mx-4" />
          <h2 className="text-xs w-20 font-semibold border-l-1 py-1 px-2 border-white ">McHenry Educational Consultancy</h2>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Useful Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white text-[10px] opacity-60 hover:underline">Home</a></li>
            <li><a href="/about" className="hover:text-white text-[10px] opacity-60 hover:underline">About Us</a></li>
            <li><a href="#" className="hover:text-white text-[10px] opacity-60 hover:underline">Services</a></li>
            <li><a href="#" className="hover:text-white text-[10px] opacity-60 hover:underline">Terms of service</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Contact Us</h3>
          <p className="text-xs mb-6">Location</p>
          <p className="text-xs"><span className="font-semibold text-white">Phone:</span> +233 555 666703</p>
          <p className="text-xs"><span className="font-semibold text-white">Email:</span> info@gmail.com</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><Facebook size={18} /></a>
            <a href="#" className="hover:text-white"><Twitter size={18} /></a>
            <a href="#" className="hover:text-white"><Linkedin size={18} /></a>
            <a href="#" className="hover:text-white"><Instagram size={18} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-12 text-center text-xs text-gray-400">
        &copy; Copyright <span className="font-semibold text-white">EXISTHQ</span>, All Rights Reserved
      </div>
    </footer>
  );
}
