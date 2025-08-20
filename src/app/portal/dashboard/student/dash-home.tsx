'use client'


import Image from "next/image";

import { useRouter } from "next/navigation";


// Student Dashboard
export default function StudentDashboard() {

  const router = useRouter()
  return (
    <div className="flex bg-gray-50">
      {/* <StudentSidebar /> */}
      <main className="flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-12">
          {/* Quick Actions Section */}
          <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#F5EFDB] flex items-center min-h-[260px]">
              {/* Main content */}
              <div className="relative z-20 flex flex-col md:flex-row items-center justify-between w-full px-8 py-12 gap-12">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#6B0F10] mb-4">
                    Start Your Journey <span className="text-black">Today</span>
                  </h3>
                  <p className="text-gray-700 text-md mb-6 max-w-lg">
                    Trust us to help you find the perfect school in Ghana. Discover top universities and high schools, and immerse yourself in a rich culture while getting a world-class education.
                  </p>
                  <div className="flex flex-col md:flex-row gap-6 mt-2">
                    <button className="bg-white border border-[#6B0F10] text-[#6B0F10] px-3 py-3 rounded font-semibold hover:bg-gray-100 transition text-sm">
                      View application requirements
                    </button>
                    <button
                  className="bg-[#6B0F10] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#951A1B] transition text-base "
                  onClick={() =>
                    router.push("/portal/dashboard/student/application")
                  }
                >
                  Apply Now
                </button>
                  </div>
                </div>
              </div>

              {/* Background image */}
              <Image
                src="/dash.png"
                alt="Banner Background"
                width={400}
                height={500}
                className="object-cover opacity-90"
                style={{ zIndex: 1 }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}