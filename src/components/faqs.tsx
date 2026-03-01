"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          aria-expanded={isOpen}
        >
          <span className="text-base font-semibold text-slate-900">{question}</span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-[#6B0F10] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {isOpen && <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">{answer}</div>}
    </div>
  );
}
