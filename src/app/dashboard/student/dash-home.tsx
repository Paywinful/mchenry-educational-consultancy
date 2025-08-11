"use client";
import Image from "next/image";

export default function StudentDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* <StudentSidebar /> */}
      <main className="flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-12">
          {/* Modern Quick Actions Card */}
          <div className="w-full flex justify-center">
            {/* Left: Content */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-12 gap-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#6B0F10] mb-2">
                Start Your Journey <span className="text-black">Today</span>
              </h2>
              <p className="text-gray-700 text-base md:text-lg mb-4 max-w-md">
                Take the first step toward your future. Explore our application
                requirements or get started right away!
              </p>
              <div className="flex gap-4 mt-2">
                <button className="border-2 border-[#6B0F10] text-[#6B0F10] bg-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6B0F10] hover:text-white transition text-base">
                  View application requirements
                </button>
                <button
                  className="bg-[#6B0F10] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#951A1B] transition text-base "
                  onClick={() =>
                    (window.location.href = "/dashboard/student/application")
                  }
                >
                  Apply Now
                </button>
              </div>
            </div>
            {/* Right: Illustration/Image */}
            <div className="relative w-full md:w-2/5 min-h-[220px] md:min-h-[320px]">
              <Image
                src="/Dash-Get-started.png"
                alt="Banner Illustration"
                fill
                className="object-cover h-full w-full md:rounded-r-xl"
                style={{
                  borderTopRightRadius: "1rem",
                  borderBottomRightRadius: "1rem",
                }}
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
