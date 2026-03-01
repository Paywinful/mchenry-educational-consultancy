import FAQItem from "@/components/faqs";
import { MessageSquareText } from "lucide-react";

const faqs = [
  {
    question: "How do I start my application process?",
    answer:
      "Submit an inquiry through the contact page. Our team will schedule a consultation to assess your profile and recommend suitable institutions.",
  },
  {
    question: "Can you help me choose the right program and university?",
    answer:
      "Yes. We evaluate your academic history, budget, and career plans, then provide a curated shortlist of programs and institutions.",
  },
  {
    question: "Do you support visa applications?",
    answer:
      "Yes. We guide you through required documentation, timelines, and interview preparation to improve visa readiness.",
  },
  {
    question: "Do you provide accommodation support?",
    answer:
      "Yes. We help students identify safe and suitable accommodation options before departure and after arrival.",
  },
  {
    question: "How long does the admission process usually take?",
    answer:
      "Timelines depend on the institution and intake period, but most applications move from document preparation to offer decision within several weeks.",
  },
];

export default function FAQPage() {
  return (
    <div className="section-shell bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center">
          <h1 className="section-heading">Frequently Asked Questions</h1>
          <p className="section-subheading mx-auto">
            Clear answers on admissions, visas, institution matching, and student support.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-[#f0e8bd] bg-[#FFFBD6] p-6 text-center shadow-sm">
          <MessageSquareText className="mx-auto text-[#6B0F10]" size={28} />
          <p className="mt-3 text-sm leading-7 text-slate-700">
            If your question is not listed here, send us a message and our admissions team will respond directly.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
