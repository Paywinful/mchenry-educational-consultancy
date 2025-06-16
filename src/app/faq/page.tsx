'use client';

import FAQItem from '@/components/faqs';
import { Quote } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="w-full bg-white px-8 py-12 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold mb-6 text-center">FREQUENTLY ASKED QUESTIONS</h2>

      {/* Optional: Add an intro or testimonial */}
      <div className="w-full max-w-2xl mb-8 bg-[#D9D9D9] rounded-xl p-6 text-center shadow">
        <Quote size={30} color="#6B0F10" className="mx-auto mb-2" />
        <p className="text-sm italic">
          {`"These are the most common questions we get. If you're still unsure, reach out to us anytime."`}
        </p>
      </div>

      {/* FAQ items */}
      <div className="w-full max-w-2xl">
        <FAQItem
          question="How do I check my placement?"
          answer="Log into your account, navigate to the 'Placement Status' section, and enter your registration number. Your placement details will be displayed if available."
        />
        <FAQItem
          question="Can I update my application after submission?"
          answer="Yes, log in and click on 'Edit Application' to update any section before the deadline."
        />
        <FAQItem
          question="What documents do I need to apply?"
          answer="You’ll need your academic transcripts, a passport photo, and a valid ID or passport."
        />
        <FAQItem
          question="How long does it take to get a visa?"
          answer="Visa timelines vary by country, but we assist with embassy scheduling and documentation to speed things up."
        />
        <FAQItem
          question="Do you help with accommodation?"
          answer="Yes! We assist with safe and affordable housing options, and even offer cultural orientation before you arrive."
        />
      </div>
    </div>
  );
}
