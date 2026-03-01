import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "Frequently Asked Questions" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "LinkedIn", icon: Linkedin },
  { href: "#", label: "Instagram", icon: Instagram },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#111827] text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image src="/logonobg.png" width={56} height={56} alt="McHenry Educational Consultancy logo" className="rounded-full" />
            <div>
              <p className="text-base font-semibold text-white">McHenry Educational Consultancy</p>
              <p className="text-sm text-slate-400">Trusted international admissions support</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            We guide students and families from first consultation to enrollment with transparent advisory services,
            institution matching, and application support.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-300 transition hover:text-[#FFFBD6]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2 text-slate-300">
              <MapPin size={16} className="mt-0.5 text-[#FFFBD6]" />
              <span>Accra Mall Area, Accra, Ghana</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone size={16} className="text-[#FFFBD6]" />
              <a href="tel:+233555666703" className="transition hover:text-[#FFFBD6]">
                +233 555 666703
              </a>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Mail size={16} className="text-[#FFFBD6]" />
              <a href="mailto:info@mchenry.com" className="transition hover:text-[#FFFBD6]">
                info@mchenry.com
              </a>
            </li>
          </ul>

          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-[#FFFBD6] hover:text-[#FFFBD6]"
              >
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} McHenry Educational Consultancy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
