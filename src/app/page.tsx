import ClientLayout from "@/components/ClientLayout";
import FAQItem from "@/components/faqs";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  FolderCheck,
  GraduationCap,
  Plane,
  School,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const howItWorks = [
  {
    title: "Consultation & Profile Setup",
    description: "We assess your goals, budget, and academic background to build a clear admissions roadmap.",
    icon: UserRoundPlus,
  },
  {
    title: "Program & Institution Matching",
    description: "Shortlist credible institutions and programs aligned with your long-term career direction.",
    icon: GraduationCap,
  },
  {
    title: "Application & Visa Support",
    description: "Receive complete guidance for applications, documentation, interview prep, and visa submission.",
    icon: Plane,
  },
  {
    title: "Pre-Departure & Arrival",
    description: "Get help with accommodation planning, onboarding, and transition support after arrival.",
    icon: School,
  },
];

const trustStats = [
  ["50+", "Partner Institutions"],
  ["95%", "Application Success Rate"],
  ["2,000+", "Students Guided"],
];

const processSteps = [
  { title: "Verify Placement", icon: FolderCheck },
  { title: "Confirm Identity", icon: ShieldCheck },
  { title: "Download Documents", icon: CalendarCheck },
];

export default function Home() {
  return (
    <ClientLayout>
      <div className="overflow-x-hidden bg-white">
        <section className="relative isolate min-h-[88vh]">
          <Image src="/hero1.jpg" alt="International students in Ghana" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/65 to-black/30" />

          <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white">
              <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#FFFBD6]">
                Study Opportunities in Ghana
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                Trusted Admissions Support for International Students
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                McHenry Educational Consultancy connects students to top institutions in Ghana with ethical,
                end-to-end advisory services from first consultation to enrollment.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  Start Your Application
                </Link>
                <Link href="/about" className="btn-secondary border-white text-white hover:bg-white/10">
                  Learn More <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="section-heading">How It Works</h2>
              <p className="section-subheading mx-auto">
                A structured process designed to reduce uncertainty and improve your admission outcomes.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {howItWorks.map(({ title, description, icon: Icon }) => (
                <article key={title} className="card-surface p-6">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6B0F10] text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#6B0F10]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-3">
            {trustStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#8a2b2c] bg-[#5a0c0d] px-6 py-8 text-center">
                <p className="text-4xl font-semibold text-[#FFFBD6]">{value}</p>
                <p className="mt-2 text-sm font-medium text-white">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell bg-[#fffdf0]">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <h2 className="section-heading">Secure, Transparent, and Verifiable</h2>
              <p className="section-subheading">
                Our placement verification process gives students and guardians a clear, trackable path from
                acceptance to confirmation.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Secure records and privacy-first data handling",
                  "Clear milestones across each stage",
                  "Dedicated support for updates and document access",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 size={18} className="mt-0.5 text-[#6B0F10]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {processSteps.map(({ title, icon: Icon }) => (
                <article key={title} className="card-surface flex items-center gap-4 p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs text-slate-600">Fast and guided verification workflow.</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="section-heading text-center">Partner Institutions</h2>
            <div className="mt-10 grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {["1", "2", "3", "4", "5"].map((num) => (
                <div key={num} className="flex h-28 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Image
                    src={`/${num}.png`}
                    alt={`Partner institution crest ${num}`}
                    width={110}
                    height={110}
                    className="h-20 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f7f8fa]">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="section-heading text-center">Frequently Asked Questions</h2>
            <p className="section-subheading mx-auto text-center">
              Get quick answers to the most common admissions and onboarding questions.
            </p>
            <div className="mt-10 space-y-4">
              <FAQItem
                question="How do I start my application process?"
                answer="Book a consultation through our contact page. We will assess your profile and create a program shortlist based on your goals and eligibility."
              />
              <FAQItem
                question="Do you assist with visa processing?"
                answer="Yes. We provide visa documentation guidance, interview preparation, and step-by-step support through submission and follow-up."
              />
              <FAQItem
                question="Can you help with accommodation after admission?"
                answer="Yes. We provide accommodation options and orientation support to help students settle in smoothly."
              />
            </div>
            <div className="mt-8 text-center">
              <Link href="/faq" className="btn-secondary">
                View All FAQs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}
