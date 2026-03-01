import {
  BookOpenCheck,
  Compass,
  GraduationCap,
  Lightbulb,
  Shield,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Image from "next/image";

const teamMembers = [
  {
    id: 1,
    image: "/henry.png",
    name: "Henry Amankwah",
    role: "Founder & Lead Consultant",
    text: "Education is the passport to opportunity, and every student deserves a fair chance to thrive.",
  },
  {
    id: 2,
    image: "/member1.jpg",
    name: "Daniel Mensah",
    role: "CEO",
    text: "The right guidance at the right time can transform academic ambition into real outcomes.",
  },
  {
    id: 3,
    image: "/member2.jpg",
    name: "Demarsha Sweety Mensah",
    role: "Administrator",
    text: "When knowledge meets determination, nothing can stand in the way of your dreams.",
  },
];

const coreValues = [
  {
    title: "Integrity",
    desc: "We offer transparent advice with ethical standards and clear communication.",
    icon: Shield,
    tone: "bg-[#6B0F10] text-[#FFFBD6]",
  },
  {
    title: "Excellence",
    desc: "We maintain a high bar for advisory quality and student experience.",
    icon: BookOpenCheck,
    tone: "bg-[#FFFBD6] text-[#6B0F10]",
  },
  {
    title: "Innovation",
    desc: "We adapt quickly to global admissions trends and policy updates.",
    icon: Lightbulb,
    tone: "bg-[#6B0F10] text-[#FFFBD6]",
  },
  {
    title: "Student Focus",
    desc: "Every recommendation is tailored to your goals, background, and budget.",
    icon: UsersRound,
    tone: "bg-[#FFFBD6] text-[#6B0F10]",
  },
];

export default function About() {
  return (
    <div className="overflow-x-hidden bg-white">
      <section className="relative isolate min-h-[360px]">
        <Image src="/students.jpg" alt="Students in an educational setting" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[360px] w-full max-w-7xl items-center px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#FFFBD6]">
              About McHenry
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Built on Trust, Guidance, and Global Access</h1>
            <p className="mt-5 text-base leading-8 text-slate-200 md:text-lg">
              We work with students, families, and institutions to connect international learners to quality education in
              Ghana with transparent advisory, responsible partnerships, and practical support.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[#f7f8fa]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <article>
            <h2 className="section-heading">Our Story</h2>
            <p className="section-subheading">
              McHenry Educational Consultancy was founded to close the information gap between international students
              and credible institutions in Ghana. We combine local insight with global admissions standards to deliver
              a dependable pathway from inquiry to enrollment.
            </p>
            <p className="mt-6 text-sm leading-7 text-slate-600 md:text-base">
              From academic counseling and institution selection to application preparation and pre-departure support,
              our team focuses on outcomes, compliance, and student confidence at every stage.
            </p>
          </article>

          <aside className="card-surface bg-[#FFFBD6] p-8">
            <h3 className="text-2xl font-semibold text-[#6B0F10]">Our Goal</h3>
            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
              Make quality education, knowledge, and opportunity accessible across borders through disciplined guidance
              and partnerships that prioritize student success.
            </p>
          </aside>
        </div>
      </section>

      <section className="section-shell">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="card-surface p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6B0F10] text-white">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Our Mission</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                To guide students and families through trusted admissions advisory, institution placement, and practical
                support services that unlock life-changing educational opportunities.
              </p>
            </article>

            <article className="card-surface p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                <Compass size={20} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Our Vision</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                To become one of Africa&apos;s most respected education consultancies, known for ethical leadership,
                strong institutional partnerships, and measurable student outcomes.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[#f7f8fa]">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="section-heading text-center">
            Our <span className="text-[#6B0F10]">Core Values</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map(({ title, desc, icon: Icon, tone }) => (
              <article key={title} className="card-surface p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="section-heading text-center">Meet Our Team</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <article key={member.id} className="card-surface overflow-hidden">
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#6B0F10]">{member.role}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{member.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-[#fffdf0]">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="section-heading text-center">Why Families Choose Us</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Ethical Advisory",
                desc: "No hidden fees, no inflated promises, and transparent process guidance.",
              },
              {
                title: "Strong Institutional Network",
                desc: "Access to established partnerships with leading institutions in Ghana.",
              },
              {
                title: "Personalized Support",
                desc: "One-on-one recommendations based on your academic profile and goals.",
              },
              {
                title: "End-to-End Delivery",
                desc: "Support from shortlist and application to travel readiness and onboarding.",
              },
            ].map((item) => (
              <article key={item.title} className="card-surface p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6B0F10]/10 text-[#6B0F10]">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
