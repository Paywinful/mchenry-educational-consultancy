"use client";

import Image from "next/image";
import {
  School,
  Quote,
  Shield,
  BookOpenCheck,
  PencilRuler,
  Lightbulb,
  UsersRound,
} from "lucide-react";

export default function About() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative w-full h-72 md:h-96">
        <Image
          src="/about.png"
          alt="Hero Section"
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/80 z-10" />
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 md:px-8 text-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Who We Are?</h1>
            <p className="text-sm md:text-md mb-8 md:mb-12 font-thin">
              McHenry Educational Consultancy in Ghana is ready to collaborate
              with all international bodies such as UNESCO, UNICEF, the UN, WHO,
              etc. and all countries to support children in war-torn areas,
              enabling them to study in Ghana through sponsorships and
              scholarships.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="w-full px-4 md:px-8 py-8 bg-[#F3F3F3]">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-8 md:mb-12">
          Our Story
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <p className="w-full md:w-1/2 text-xs md:text-sm leading-relaxed">
            <span className="float-left text-6xl font-bold leading-none mr-2">
              F
            </span>
            ounded with a vision to bridge the gap between international
            students and Ghana&apos;s prestigious educational institutions, McHenry
            Educational Consultancy was born from the understanding that quality
            education should be accessible to all, regardless of geographical
            boundaries.
            <br />
            <br />
            Our journey began when we recognized the untapped potential of
            Ghana&apos;s higher education sector and the growing demand from
            international students seeking authentic, affordable, and quality
            education in a culturally rich environment.
          </p>

          <div className="w-full md:w-1/3 bg-[#FFFBD6] shadow-xl rounded-full p-6 md:p-10 flex flex-col items-center space-y-4 text-center">
            <p className="text-xl md:text-2xl font-extrabold">Our Goal</p>
            <p className="text-sm md:text-md">
              Making education, knowledge & technology globally common &
              accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="w-full px-4 md:px-8 py-12 md:py-20 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2 bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center">
              <School color="#fff" size={35} />
            </div>
            <p className="text-md text-[#6B0F10] font-extrabold">Our Mission</p>
            <p className="text-xs md:text-sm text-gray-700">
              Bridge global educational opportunities with African potential by
              promoting access to high-quality tertiary education across
              borders. Dedicated to guiding students, families, and institutions
              through trusted advisory services, university placements, academic
              counseling, and capacity-building initiatives that foster personal
              growth, global citizenship, and national development.
            </p>
          </div>

          <div className="w-full md:w-1/2 bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FFFBD6] flex items-center justify-center">
              <School color="#6B0F10" size={35} />
            </div>
            <p className="text-md text-[#6B0F10] font-extrabold">Our Vision</p>
            <p className="text-xs md:text-sm text-gray-700">
              Become Africa’s leading educational consultancy firm, empowering
              future leaders through world-class partnerships, innovative
              guidance, and seamless access to transformative international
              higher education opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="w-full px-4 md:px-20 py-12 bg-[#F3F3F3]">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-12">
          Our <span className="text-[#6B0F10]">Core</span> Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            {
              icon: <Shield color="#FFFBD6" size={50} />,
              bg: "#6B0F10",
              title: "Integrity",
              desc: "Upholding the highest ethical standards.",
            },
            {
              icon: <BookOpenCheck color="#6B0F10" size={50} />,
              bg: "#FFFBD6",
              title: "Excellence",
              desc: "Delivering unmatched quality.",
            },
            {
              icon: <PencilRuler color="#FFFBD6" size={50} />,
              bg: "#6B0F10",
              title: "Discipline",
              desc: "Accountability, respect, professionalism.",
            },
            {
              icon: <Lightbulb color="#6B0F10" size={50} />,
              bg: "#FFFBD6",
              title: "Innovation",
              desc: "Encouraging creative solutions.",
            },
            {
              icon: <UsersRound color="#FFFBD6" size={50} />,
              bg: "#6B0F10",
              title: "Customer-Centricity",
              desc: "Client needs at the heart.",
            },
          ].map((val, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: val.bg }}
              >
                {val.icon}
              </div>
              <p className="text-sm font-extrabold">{val.title}</p>
              <p className="text-xs">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meet Our Team */}
      <div className="w-full py-12 px-4 md:px-10">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-12">
          Meet Our<span className="text-[#6B0F10] px-2">Team</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {[1, 2, 3].map((member) => (
            <div
              key={member}
              className="bg-white rounded-lg shadow-md max-w-xs w-full overflow-hidden"
            >
              <Image
                src={`/member${member}.jpg`}
                alt="Team Member"
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="font-bold text-lg">Michael McHenry</h3>
                <p className="text-sm text-[#6B0F10] font-semibold">Teacher</p>
                <p className="text-xs mt-2 text-gray-600">
                  I checked my posting from my phone and downloaded my letter in
                  minutes — no stress.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="w-full bg-[#F3F3F3] py-12 px-4 md:px-8">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-12">
          Why <span className="text-[#6B0F10]">Choose</span> Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Ethical Process",
              desc: "Transparent, honest guidance with no hidden fees or false promises.",
            },
            {
              title: "Institutional Partnerships",
              desc: "Strong relationships with Ghana's top universities and colleges.",
            },
            {
              title: "Personalized Support",
              desc: "Tailored guidance based on academic goals.",
            },
            {
              title: "End-to-End Support",
              desc: "Assistance from application to graduation.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <Quote color="#6B0F10" />
              <div>
                <p className="font-bold text-md">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accreditations */}
      <div className="w-full bg-white py-12 px-4">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-8">
          Accreditations & <span className="text-[#6B0F10]">Endorsements</span>
        </h2>
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-md w-40 h-48 flex flex-col items-center justify-center p-4 hover:shadow-xl transition-all duration-300">
            <Image
              src="/moe.png"
              width={120}
              height={120}
              alt="MOE Logo"
              className="object-contain"
            />
            <p className="text-sm font-semibold mt-2">MOE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
