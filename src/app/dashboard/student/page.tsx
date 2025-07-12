// import StudentSidebar from "@/components/dashboard/StudentSidebar";
import Image from "next/image";

// Student Dashboard
export default function StudentDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* <StudentSidebar /> */}
      <main className="flex-1 p-8 flex justify-center items-start">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-12">
          {/* Quick Actions Section */}
          <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#FFFBD6] flex items-center min-h-[260px]">
              {/* Background image */}
              <Image
                src="/Dash, Get started.png"
                alt="Banner Background"
                fill
                className="object-cover opacity-90"
                style={{ zIndex: 1 }}
              />
              {/* Main content */}
              <div className="relative z-20 flex flex-col md:flex-row items-center justify-between w-full px-12 py-12 gap-12">
                <div className="flex-1 text-left">
                  <h3 className="text-3xl md:text-4xl font-bold text-[#6B0F10] mb-4">
                    Start Your Journey <span className="text-black">Today</span>
                  </h3>
                  <p className="text-gray-700 text-lg mb-6 max-w-lg">
                    Lorem ipsum jdb dnidn dionifjd ds sd o ds sdjfs ius b
                    fsjbslk fsbkjbslkfsbujksf fsubsf
                  </p>
                  <div className="flex gap-6 mt-2">
                    <button className="bg-white border border-[#6B0F10] text-[#6B0F10] px-6 py-3 rounded font-semibold hover:bg-gray-100 transition text-base">
                      View application requirements
                    </button>
                    <button className="bg-[#6B0F10] text-white px-8 py-3 rounded font-semibold hover:bg-[#951A1B] transition text-base">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
