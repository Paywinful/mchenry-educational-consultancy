"use client";
import { useState } from "react";
import Image from "next/image";

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [students] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", photo: "/student1.jpg" },
    { id: 2, name: "Mary Smith", email: "mary@example.com", photo: "/student2.jpg" },
  ]);

  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#6B0F10] mb-4">Students</h1>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B0F10]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-[#F5EFDB] text-[#6B0F10]">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Image src={s.photo} alt={s.name} width={40} height={40} className="rounded-full" />
                </td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
