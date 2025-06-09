import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { School, FolderLock, ShieldCheck, CalendarCheck, Quote } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-screen">
        {/* Background Image */}
        <Image
          src="/hero1.jpg"
          alt="Hero Section"
          fill
          className="object-cover"
          priority
        />

        {/* Semi-transparent Black Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Left-aligned Text Content */}
        <div className="absolute inset-0 z-20 md:ml-10 flex items-center px-8">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Connecting Foreign Students to Quality Education in Ghana
            </h1>
            <p className="text-md md:text-md mb-10 md:mb-12 font-thin">
              Your gateway to world-class education in Ghana’s top universities
            </p>
            <div className="flex gap-4">
              <button className="bg-[#f0b22b] text-white px-8 py-1 text-xs md:px-12 md:py-2 rounded-3xl md:text-lg hover:border-[#a9791c] hover:cursor-pointer hover:border hover:bg-transparent transition">
                Get Started
              </button>
              <button className="border border-[#f0b22b] text-white px-8 py-1 text-xs md:px-12 md:py-2 rounded-3xl md:text-lg hover:cursor-pointer hover:bg-[#a9791c] transition">
                Request Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "How It Works" Section */}
      <div className="w-full px-8 py-8 bg-white">
        <h2 className="text-center text-3xl font-bold mb-12">How It Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Card 1 */}
          <div className="bg-[#D9D9D9] p-10 rounded-xl justify-center shadow-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0b22b] flex items-center justify-center mx-auto mb-4">
              <School className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold mb-2">
              Sign Up & Consultation
            </p>
            <p className="text-xs text-gray-700">
              Simply input your unique identification number to begin the process
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#D9D9D9] p-10 rounded-xl justify-center shadow-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0b22b] flex items-center justify-center mx-auto mb-4">
              <School className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold mb-2">
              Select Programs & Apply
            </p>
            <p className="text-xs text-gray-700">
              We advise on schools, deadlines, and complete your application
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#D9D9D9] p-10 rounded-xl justify-center shadow-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0b22b] flex items-center justify-center mx-auto mb-4">
              <School className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold mb-2">
              Visa & Travel Assistance
            </p>
            <p className="text-xs text-gray-700">
              Document guidance, embassy liaison, flight booking
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#D9D9D9] p-10 rounded-xl justify-center shadow-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0b22b] flex items-center justify-center mx-auto mb-4">
              <School className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold mb-2">
              Accommodation & Pre-Departure
            </p>
            <p className="text-xs text-gray-700">
              Arrange housing, cultural orientation
            </p>
          </div>
        </div>
      </div>
      {/* Find Section */}
      <div className='w-full bg-[#D9D9D9] px-8 py-10 justify-center flex-col'>
        <h2 className='text-3xl text-center font-extrabold'>Find your Perfect School</h2>
        <div className='bg-white my-8 lg:mx-64 rounded-md shadow-xl p-4 border-[#ACACAC]rounded-sm justify-center flex space-x-4'>
          <input placeholder='Program or Course' className='border border-[#ACACAC] p-2 rounded-sm w-84 text-sm' />
          <button className='border border-[#ACACAC] p-2 text-sm rounded-sm font-bold hover:cursor-pointer hover:bg-[#D9D9D9]'>Select Location</button>
          <button className='bg-[#f0b22b] text-white p-2 w-48 text-sm rounded-sm hover:cursor-pointer hover:bg-[#a9791c] transition'>Search Programs</button>
        </div>
      </div>
      {/* numbers section */}
      <div className='w-full bg-[#202020] px-12 py-12 justify-between flex px-36'>
        <div className='justify-center flex-col'>
          <h1 className='text-[#F0B22B] text-4xl font-black'>50+</h1>
          <p className='text-white text-sm'>Partner Schools</p>
        </div>
        <div className='justify-center flex-col'>
          <h1 className='text-[#F0B22B] text-4xl font-black'>95%</h1>
          <p className='text-white text-sm'>Success rate</p>
        </div>
        <div className='justify-center flex-col'>
          <h1 className='text-[#F0B22B] text-4xl font-black'>2000+</h1>
          <p className='text-white text-sm'>Students Placed</p>
        </div>
      </div>

      {/* Secure & Transparent */}
      <div className='w-full py-16 bg-[#D9D9D9]'>
        <div className='flex text-4xl font-extrabold justify-center flex text-center'>
          <h2 className='text-[#F0B22B] mx-3'>Secure</h2>
          <h2> & Transparent</h2>
        </div>
        <div className='justify-between py-16 flex mx-12'>
          <div className="flex flex-col items-center text-center">
            <FolderLock size={32} className="text-[#F0B22B]" />
            <h1 className="text-sm font-black mt-4">View Placement</h1>
            <p className="text-xs mt-2 w-72">
              Simply input your unique identification number to begin the process
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck size={32} className="text-[#F0B22B]" />
            <h1 className="text-sm font-black mt-4">Enter your ID</h1>
            <p className="text-xs mt-2 w-72">
              Simply input your unique identification number to begin the process
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CalendarCheck size={32} className="text-[#F0B22B]" />
            <h1 className="text-sm font-black mt-4">Confirm / Download</h1>
            <p className=" text-xs w-72 mt-2">
              Simply input your unique identification number to begin the process
            </p>
          </div>
        </div>
      </div>

      {/* school crest */}
      <div className='w-full py-8 bg-white justify-between flex items-center px-24'>
        <Image
          src="/1.png"
          alt="Hero Section"
          width={120}
          height={120}
          className="object-cover"
          priority
        />
        <Image
          src="/2.png"
          alt="Hero Section"
          width={120}
          height={120}
          className="object-cover"
          priority
        />
        <Image
          src="/3.png"
          alt="Hero Section"
          width={120}
          height={120}
          className="object-cover"
          priority
        />
        <Image
          src="/5.png"
          alt="Hero Section"
          width={120}
          height={120}
          className="object-cover"
          priority
        />
        <Image
          src="/4.png"
          alt="Hero Section"
          width={120}
          height={120}
          className="object-cover"
          priority
        />
      </div>
      {/* student testimonials */}
      <div className="flex flex-col w-full py-12 bg-[#D9D9D9] justify-center items-center">
        <h2 className="text-3xl text-center font-extrabold mb-8">
          Student Testimonials
        </h2>

        <div className="w-3/5 flex text-center h-80 bg-white flex-col py-10 justify-between space-y-4 rounded-xl items-center">
          <Quote className='flex' size={34} color='#F0B22B'/>
          <p className="text-center text-lg w-2/3">"I checked my posting from my phone and downloaded my letter in minutes — no stress."</p>
          <div>
            <p className="text-center font-bold text-sm">Adjoa</p>
            <p className="text-center font-light text-xs">Teacher</p>
          </div>
        </div>
      </div>

    </div>
  );
}
