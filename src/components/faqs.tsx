'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-gray-300 rounded-md mb-4 ${isOpen ? 'bg-gray-100' : 'bg-white'} `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-gray-800 focus:outline-none"
      >
        {question}
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          color='#f0b22b'
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}
