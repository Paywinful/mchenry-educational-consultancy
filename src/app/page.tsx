'use client';

import Image from 'next/image';
import FAQItem from '@/components/faqs';
import {
  School,
  FolderLock,
  ShieldCheck,
  CalendarCheck,
  Quote,
  UserRoundPlus,
  GraduationCap,
  Plane
} from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <Image
          src="/hero1.jpg"
          alt="Hero Section"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 z-20 md:ml-10 flex items-center px-8">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Connecting Foreign Students to Quality Education in Ghana
            </h1>
            <p className="text-md md:text-md mb-10 md:mb-12 font-thin">
              Your gateway to world-class education in Ghana’s top universities
            </p>
            <div className="md:flex hidden gap-4">
              <button className="bg-[#6B0F10] text-white px-8 py-1 text-xs md:px-12 md:py-2 rounded-3xl md:text-lg hover:border-[#a9791c] hover:cursor-pointer hover:border hover:bg-transparent transition">
                Get Started
              </button>
              <button className="border border-[#6B0F10] text-white px-8 py-1 text-xs md:px-12 md:py-2 rounded-3xl md:text-lg hover:cursor-pointer hover:bg-[#a9791c] transition">
                Request Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="w-full px-8 py-8 bg-white">
  <h2 className="text-center text-3xl font-bold mb-12">How It Works</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
    
    {/* Card 1 */}
    <div className="bg-[#D9D9D9] p-10 rounded-xl shadow-md text-center">
      <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center mx-auto mb-4">
        <UserRoundPlus className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-extrabold mb-2">Sign Up & Consultation</p>
      <p className="text-xs text-gray-700">
        Simply input your unique identification number to begin the process
      </p>
    </div>

    {/* Card 2 */}
    <div className="bg-[#D9D9D9] p-10 rounded-xl shadow-md text-center">
      <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center mx-auto mb-4">
        <GraduationCap className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-extrabold mb-2">Select Programs & Apply</p>
      <p className="text-xs text-gray-700">
        We advise on schools, deadlines, and complete your application
      </p>
    </div>

    {/* Card 3 */}
    <div className="bg-[#D9D9D9] p-10 rounded-xl shadow-md text-center">
      <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center mx-auto mb-4">
        <Plane className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-extrabold mb-2">Visa & Travel Assistance</p>
      <p className="text-xs text-gray-700">
        Document guidance, embassy liaison, flight booking
      </p>
    </div>

    {/* Card 4 */}
    <div className="bg-[#D9D9D9] p-10 rounded-xl shadow-md text-center">
      <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center mx-auto mb-4">
        <School className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-extrabold mb-2">Accommodation & Pre-Departure</p>
      <p className="text-xs text-gray-700">
        Arrange housing, cultural orientation
      </p>
    </div>

  </div>
</div>


      {/* Find Section */}
      <div className="w-full bg-[#D9D9D9] px-8 py-10 flex-col justify-center">
        <h2 className="text-3xl text-center font-extrabold">Find your Perfect School</h2>
        <div className="bg-white my-8 lg:mx-64 rounded-md shadow-xl p-4 justify-center flex space-x-4 border-[#ACACAC]">
          <input
            placeholder="Program or Course"
            className="border border-[#ACACAC] p-2 rounded-sm w-24 md:w-84 text-sm"
          />
          <button className="border border-[#ACACAC] p-2 text-sm rounded-sm font-bold hover:cursor-pointer hover:bg-[#D9D9D9]">
            Select Location
          </button>
          <button className="bg-[#6B0F10] text-white p-2 md:w-48 text-sm rounded-sm hover:cursor-pointer hover:bg-[#a9791c] transition">
            Search Programs
          </button>
        </div>
      </div>

      {/* Numbers Section */}
      <div className="w-full bg-[#6B0F10] px-12 py-12 flex justify-between md:px-36">
        {[
          ['50+', 'Partner Schools'],
          ['95%', 'Success rate'],
          ['2000+', 'Students Placed'],
        ].map(([value, label], index) => (
          <div key={index} className="flex flex-col items-center">
            <h1 className="text-[#FFFBD6] text:3xl md:text-4xl font-black">{value}</h1>
            <p className="text-white text-xs md:text-sm">{label}</p>
          </div>
        ))}
      </div>

{/* Secure & Transparent */}
<div className="w-full py-16 bg-[#D9D9D9]">
  <div className="flex justify-center text-4xl font-extrabold text-center">
    <h2 className="text-[#6B0F10] mx-3">Secure <span className='text-black'>& Transparent</span></h2>
  </div>
  <div className="md:flex justify-between py-16 mx-12">
    {(
      [
        ['View Placement', FolderLock],
        ['Enter your ID', ShieldCheck],
        ['Confirm / Download', CalendarCheck],
      ] as [string, React.ElementType][]
    ).map(([title, Icon], index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <Icon size={32} className="text-[#6B0F10]" />
        <h1 className="text-sm font-black mt-4">{title}</h1>
        <p className="text-xs mt-2 w-72">
          Simply input your unique identification number to begin the process
        </p>
      </div>
    ))}
  </div>
</div>



      {/* School Crests */}
      <div className="w-full py-8 bg-white flex justify-between items-center md:px-24">
        {['1', '2', '3', '5', '4'].map((num) => (
          <Image
            key={num}
            src={`/${num}.png`}
            alt={`Crest ${num}`}
            width={120}
            height={120}
            className="object-cover w-[80px] h-[80px] md:w-[120px] md:h-[120px]"
            priority
          />
        ))}
      </div>

      {/* Testimonials */}
      <div className="flex flex-col w-full py-12 bg-[#D9D9D9] justify-center items-center">
        <h2 className="text-3xl text-center font-extrabold mb-8">
          Student Testimonials
        </h2>
        <div className="w-3/5 h-80 bg-white flex flex-col justify-between py-10 items-center text-center rounded-xl space-y-4">
          <Quote size={34} color="#6B0F10" />
          <p className="text-lg w-2/3">
           {` "I checked my posting from my phone and downloaded my letter in minutes — no stress."`}
          </p>
          <div>
            <p className="font-bold text-sm">Adjoa</p>
            <p className="font-light text-xs">Teacher</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id='faq' className="w-full bg-white px-8 py-12 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold mb-6">FREQUENTLY ASKED QUESTIONS</h2>
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
        </div>
      </div>
    </div>
  );
}
