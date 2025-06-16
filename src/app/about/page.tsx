'use client';

import Image from "next/image";
import { School, Quote, Shield, BookOpenCheck, PencilRuler, Lightbulb, UsersRound } from 'lucide-react';

export default function About() {
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
                    <div className="text-white max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Who We Are?
                        </h1>
                        <p className="text-md mb-10 md:mb-12 font-thin">
                            McHenry Educational Consultancy in Ghana is ready to collaborate with all international bodies such as UNESCO, UNICEF, the UN, WHO, etc. and all countries to support children in war-torn areas, enabling them to study in Ghana through sponsorships and scholarships.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="w-full px-8 py-8 bg-[#F3F3F3] ">
                <h2 className="text-center text-3xl font-bold mb-4 md:mb-12">Our Story</h2>
                <div className="flex flex-col md:flex-row items-center justify-between mx-20">
                    <p className="md:w-4xl mx-10 w-84 text-xs md:text-sm mb-4 md:max-w-md">
                        {`Founded with a vision to bridge the gap between international students and Ghana's prestigious educational institutions, McHenry Educational Consultancy was born from the understanding that quality education should be accessible to all, regardless of geographical boundaries.`}
                        <br /><br />
                        {`Our journey began when we recognized the untapped potential of Ghana's higher education sector and the growing demand from international students seeking authentic, affordable, and quality education in a culturally rich environment.`}
                    </p>
                    <div className="w-4xl mx-10 bg-white justify-even flex-col flex items-center space-y-8 md:space-y-12 rounded-lg p-10">
                        <School color="#6B0F10" size={35} />
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-md font-extrabold">Our Goal</p>
                            <p className="text-sm text-center w-84 md:max-w-md">
                                Making education, knowledge & technology globally common & accessible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="w-full px-18 md:py-28 bg-white ">
                <div className="flex flex-col md:flex-row items-center justify-between mx-20 ">
                    <div className="w-3xl mx-10 bg-white shadow-xl max-w-md my-4 md:my-0 justify-even flex-col flex items-center  md:space-y-16 rounded-lg p-14">
                        <div className="w-14 h-14 rounded-full bg-[#6B0F10] flex items-center justify-center mx-auto mb-4">
                            <School color="#ffff" size={35} />
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-md text-[#6B0F10] font-extrabold">Our Mission</p>
                            <p className="text-sm h-24 text-center max-w-md">
                               With discipline, determination & dedication through this consultancy, education, knowledge & technology can benefit all the people around the globe.
                            </p>
                        </div>
                    </div>
                    <div className="w-3xl mx-10 bg-white max-w-md shadow-xl justify-even flex-col flex items-center space-y-16 rounded-lg p-14">
                        <div className="w-14 h-14 rounded-full bg-[#FFFBD6] flex items-center justify-center mx-auto mb-4">
                            <School color="#6B0F10" size={35} />
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-md text-[#6B0F10] font-extrabold">Our Vision</p>
                            <p className="text-sm h-24 text-center">
                                The world has become a global village. Education, knowledge & technology are not centered in one country or abroad. Minds that develop them are found all over the world irrespective of gender, colour, race, ethnicity or country of origin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="w-full px-4 md:px-20 py-16 bg-[#F3F3F3]">
                <div className="flex text-center justify-center">
                    <h2 className="text-center text-3xl font-extrabold px-1 mb-12">Our</h2>
                    <h2 className="text-center text-3xl text-[#6B0F10] font-extrabold px-1 mb-12">Core</h2>
                    <h2 className="text-center text-3xl font-extrabold px-1 mb-12">Values</h2>
                </div>
                <div className="flex flex-col md:flex-row justify-around gap-10">
                    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
                        <div className="w-20 h-20 rounded-full bg-[#6B0F10] p-1 flex items-center justify-center mb-4">
                            <Shield color="#FFFBD6" size={50} />
                        </div>
                        <p className="text-sm font-extrabold">Integrity</p>
                        <p className="text-xs">Upholding the highest ethical standards in every action.</p>
                    </div>
                    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
                        <div className="w-20 h-20 rounded-full bg-[#FFFBD6] p-1 flex items-center justify-center mb-4">
                            <BookOpenCheck color="#6B0F10" size={50} />
                        </div>
                        <p className="text-sm font-extrabold">Excellence</p>
                        <p className="text-xs">Delivering unmatched quality through continuous improvement.</p>
                    </div>
                    <div className="flex flex-col items-center text-center mt-20 max-w-xs mx-auto">
                        <div className="w-20 h-20 rounded-full bg-[#6B0F10] p-1 flex items-center justify-center mb-4">
                            <PencilRuler color="#FFFBD6" size={50} />
                        </div>
                        <p className="text-sm font-extrabold">Disciplne</p>
                        <p className="text-xs">Fostering a work culture of accountability, respect, and professionalism</p>
                    </div>
                    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
                        <div className="w-20 h-20 rounded-full bg-[#FFFBD6] p-1 flex items-center justify-center mb-4">
                            <Lightbulb color="#6B0F10" size={50} />
                        </div>
                        <p className="text-sm font-extrabold">Innovation</p>
                        <p className="text-xs">Fostering a work culture of accountability, respect, and professionalism</p>
                    </div>
                    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
                        <div className="w-20 h-20 rounded-full bg-[#6B0F10] p-1 flex items-center justify-center mb-4">
                            <UsersRound color="#FFFBD6" size={50} />
                        </div>
                        <p className="text-sm font-extrabold">Customer-Centricity</p>
                        <p className="text-xs">Placing client and passenger needs at the heart of our operations.</p>
                    </div>
                </div>
            </div>

            {/* Meet Our Team */}
            <div className="w-full py-12 px-10">
                <h2 className="text-center text-3xl font-extrabold mb-12">Meet Our<span className="text-[#6B0F10] px-2">Team</span></h2>
                <div className="flex flex-col md:flex-row justify-center items-center gap-10 px-4 md:px-20">
                    {/* Team Member 1 */}
                    <div className="bg-white rounded-lg shadow-md max-w-xs w-full overflow-hidden">
                        <Image
                            src="/member1.jpg"
                            alt="Michael McHenry"
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4 text-center">
                            <h3 className="font-bold text-lg">Michael McHenry</h3>
                            <p className="text-sm text-[#6B0F10] font-semibold">Teacher</p>
                            <p className="text-xs mt-2 text-gray-600">
                                I checked my posting from my phone and downloaded my letter in minutes — no stress.
                            </p>
                        </div>
                    </div>


                    {/* Team Member 2 */}
                    <div className="bg-white rounded-lg shadow-md max-w-xs w-full overflow-hidden">
                        <Image
                            src="/member2.jpg"
                            alt="Michael McHenry"
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4 text-center">
                            <h3 className="font-bold text-lg">Michael McHenry</h3>
                            <p className="text-sm text-[#6B0F10] font-semibold">Teacher</p>
                            <p className="text-xs mt-2 text-gray-600">
                                I checked my posting from my phone and downloaded my letter in minutes — no stress.
                            </p>
                        </div>
                    </div>


                    {/* Team Member 3 */}
                    <div className="bg-white rounded-lg shadow-md max-w-xs w-full overflow-hidden">
                        <Image
                            src="/member3.jpg"
                            alt="Michael McHenry"
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4 text-center">
                            <h3 className="font-bold text-lg">Michael McHenry</h3>
                            <p className="text-sm text-[#6B0F10] font-semibold">Teacher</p>
                            <p className="text-xs mt-2 text-gray-600">
                                I checked my posting from my phone and downloaded my letter in minutes — no stress.
                            </p>
                        </div>
                    </div>

                </div>

            </div>

            {/* Why Choose Us */}
            <div className="w-full bg-[#F3F3F3] py-16 px-8">
                <h2 className="text-center text-3xl font-extrabold mb-12">
                    Why <span className="text-[#6B0F10]">Choose</span> Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto space-y-16">
                    {/* Item 1 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10"/>
                        <div>
                            <p className="font-bold text-md">Ethical Process</p>
                            <p className="text-sm text-gray-600">
                                Transparent, honest guidance with no hidden fees or false promises.
                            </p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10"/>
                        <div>
                            <p className="font-bold text-md">Institutional Partnerships</p>
                            <p className="text-sm text-gray-600">
                                {`Strong relationships with Ghana's top universities and colleges.`}
                            </p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10"/>
                        <div>
                            <p className="font-bold text-md">Personalized Support</p>
                            <p className="text-sm text-gray-600">
                                Tailored guidance based on individual academic goals and preferences.
                            </p>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start gap-4">
                        <Quote color="#6B0F10"/>
                        <div>
                            <p className="font-bold text-md">End-to-End Support</p>
                            <p className="text-sm text-gray-600">
                                Comprehensive assistance from application to graduation and beyond.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

          {/* Accreditations & Endorsement */}
<div className="w-full bg-white py-16 px-8">
    <h2 className="text-center text-3xl font-extrabold mb-12">
        Accreditations & <span className="text-[#6B0F10]">Endorsements</span>
    </h2>

    <div className="flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-md w-48 h-56 flex flex-col items-center justify-center p-4 hover:shadow-xl transition-all duration-300">
            <Image
                src="/moe.png"
                width={160}
                height={160}
                alt="MOE Logo"
                className="object-contain"
            />
            <p className="text-sm mt-[-28px] font-semibold text-black">MOE</p>
        </div>
    </div>
</div>



        </div>
    );
}


