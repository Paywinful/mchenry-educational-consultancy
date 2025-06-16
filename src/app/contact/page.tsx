'use client';

import Image from "next/image";
import { Quote } from 'lucide-react';

export default function Contact() {
    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative w-full h-72">
                <Image
                    src="/about.png"
                    alt="Hero Section"
                    fill
                    className="object-cover z-0"
                    priority
                />
                <div className="absolute inset-0 bg-black/80 z-10" />
                <div className="absolute inset-0 z-20 flex items-center justify-center px-8 text-center">
                    <div className="text-white max-w-2xl md:mt-32">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Contact Us
                        </h1>
                        <p className="text-md mb-10 md:mb-12 font-thin">
                           {` Ready to start your educational journey in Ghana? We're here to help! Reach out to us for personalized guidance and support.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Card Section */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-24 py-16 px-4 bg-white">
                {/* Left Side: Image and Socials */}
                <div className="flex flex-col items-center">
                    <Image
                        src="/member1.jpg" // Make sure this path is correct
                        alt="Smiling Woman"
                        width={300}
                        height={300}
                        className="rounded-lg object-cover"
                    />
                    <p className="mt-4 text-lg font-semibold">Follow Us</p>
                    <div className="flex gap-4 mt-2">
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <Image src="/facebook.svg" alt="Facebook" width={32} height={32} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <Image src="/instagram.svg" alt="Instagram" width={32} height={32} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <Image src="/linkedin.svg" alt="LinkedIn" width={32} height={32} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <Image src="/twitter-x.svg" alt="X" width={32} height={32} />
                        </a>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="bg-[#F9F9F9] rounded-xl shadow-md p-8 w-full md:w-2/5">
                    <h2 className="text-2xl font-bold text-[#6B0F10] mb-6">Send us a Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1 font-semibold">Full Name</label>
                            <input type="text" placeholder="Enter your full name" className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-semibold">Email Address</label>
                            <input type="email" placeholder="Enter your email" className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-semibold">Inquiry Type</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md">
                                <option>Select Inquiry type</option>
                                <option>Admissions</option>
                                <option>Scholarships</option>
                                <option>General Inquiry</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-semibold">Message</label>
                            <textarea rows={4} placeholder="Tell us about your educational goals..." className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <button type="submit" className="bg-[#6B0F10] text-white w-full py-2 rounded-md font-semibold hover:bg-[#500a0b]">
                            Send
                        </button>
                    </form>
                </div>
            </div>


            {/* visit our office */}
            <div className="w-full px-8 py-16 justify center items-center flex flex-col">
                <h2 className="text-center text-3xl font-extrabold mb-12">
                    Visit Our <span className="text-[#6B0F10]">Office</span>
                </h2>
                <Image src="/map.jpg" alt="map" width={800} height={800} />
            </div>

            {/* Why Choose Us */}
            <div className="w-full bg-[#F3F3F3] py-16 px-8">
                <h2 className="text-center text-3xl text-[#6B0F10] font-extrabold mb-12">
                    Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto space-y-16">
                    {/* Item 1 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10" />
                        <div>
                            <p className="font-bold text-md">Phone</p>
                            <p className="text-sm text-gray-600">
                                +233 24 084 6638
                            </p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10" />
                        <div>
                            <p className="font-bold text-md">Email</p>
                            <p className="text-sm text-gray-600">
                                info@mchenry.com
                            </p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10" />
                        <div>
                            <p className="font-bold text-md">WhatsApp</p>
                            <p className="text-sm text-gray-600">
                                +233 24 084 6638
                            </p>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10" />
                        <div>
                            <p className="font-bold text-md">Office Hours</p>
                            <p className="text-sm text-gray-600">
                                Mon - Fri: 8:00 AM - 6:00 PM <br />
                                Sat: 9:00 AM - 2:00 PM
                            </p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}


