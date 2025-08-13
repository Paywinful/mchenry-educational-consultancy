export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#6B0F10] mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Total Students</h2>
          <p className="text-3xl font-bold text-[#6B0F10]">120</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Pending Payments</h2>
          <p className="text-3xl font-bold text-yellow-600">25</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Completed Payments</h2>
          <p className="text-3xl font-bold text-green-600">95</p>
        </div>
      </div>
    </div>
  );
}
