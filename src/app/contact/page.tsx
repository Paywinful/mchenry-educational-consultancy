import { Clock3, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="section-shell bg-[#f8fafc]">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="section-heading">Contact Our Admissions Team</h1>
            <p className="section-subheading">
              Ready to start your educational journey in Ghana? Share your goals and our team will guide you on the
              next best step.
            </p>
          </div>

          <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_1.05fr]">
            <div className="space-y-6">
              <article className="card-surface p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-900">Get in Touch</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  We respond to most inquiries within one business day.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                      <Phone size={16} />
                    </p>
                    <p className="text-sm font-semibold text-slate-900">Phone</p>
                    <a href="tel:+233240846638" className="text-sm text-slate-600 transition hover:text-[#6B0F10]">
                      +233 24 084 6638
                    </a>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                      <Mail size={16} />
                    </p>
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <a href="mailto:info@mchenry.com" className="text-sm text-slate-600 transition hover:text-[#6B0F10]">
                      info@mchenry.com
                    </a>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                      <MapPin size={16} />
                    </p>
                    <p className="text-sm font-semibold text-slate-900">Location</p>
                    <p className="text-sm text-slate-600">Accra Mall Area, Accra, Ghana</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBD6] text-[#6B0F10]">
                      <Clock3 size={16} />
                    </p>
                    <p className="text-sm font-semibold text-slate-900">Office Hours</p>
                    <p className="text-sm text-slate-600">Mon-Fri: 8:00 AM-6:00 PM</p>
                  </div>
                </div>
              </article>

              <article className="card-surface p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-900">Send Us a Message</h2>
                <form className="mt-6 space-y-5" aria-label="Contact form">
                  <div>
                    <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6B0F10] focus:outline-none focus:ring-2 focus:ring-[#6B0F10]/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6B0F10] focus:outline-none focus:ring-2 focus:ring-[#6B0F10]/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="mb-2 block text-sm font-medium text-slate-700">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-[#6B0F10] focus:outline-none focus:ring-2 focus:ring-[#6B0F10]/20"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select inquiry type
                      </option>
                      <option value="admissions">Admissions</option>
                      <option value="scholarships">Scholarships</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us about your educational goals"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6B0F10] focus:outline-none focus:ring-2 focus:ring-[#6B0F10]/20"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full rounded-xl">
                    Send Message
                  </button>
                </form>
              </article>
            </div>

            <aside className="card-surface overflow-hidden p-4 sm:p-5">
              <h2 className="px-2 pt-2 text-xl font-semibold text-slate-900">Visit Our Office</h2>
              <p className="px-2 pt-2 text-sm leading-7 text-slate-600">
                Find us near Accra Mall for in-person consultation and admissions support.
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <iframe
                  title="Map showing Accra Mall, Accra, Ghana"
                  src="https://maps.google.com/maps?q=Accra%20Mall%2C%20Accra%2C%20Ghana&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="h-[420px] w-full md:h-[680px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
