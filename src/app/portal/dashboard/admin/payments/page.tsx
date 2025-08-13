"use client";
import React, { useState } from "react";

type Payment = {
  id: number;
  studentName: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Failed";
};

const dummyPayments: Payment[] = [
  { id: 1, studentName: "John Doe", amount: 2000, date: "2025-01-15", status: "Paid" },
  { id: 2, studentName: "Jane Smith", amount: 1500, date: "2025-01-20", status: "Pending" },
  { id: 3, studentName: "Michael Brown", amount: 2500, date: "2025-01-25", status: "Paid" },
];

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const filteredPayments = dummyPayments.filter((payment) =>
    payment.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#6B0F10] mb-4">Payments</h1>

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[#F5EFDB]">
            <tr>
              <th className="px-6 py-3 border-b text-left">Student Name</th>
              <th className="px-6 py-3 border-b text-left">Amount</th>
              <th className="px-6 py-3 border-b text-left">Date</th>
              <th className="px-6 py-3 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">{payment.studentName}</td>
                  <td className="px-6 py-3 border-b">GHS {payment.amount}</td>
                  <td className="px-6 py-3 border-b">{payment.date}</td>
                  <td
                    className={`px-6 py-3 border-b font-semibold ${
                      payment.status === "Paid"
                        ? "text-green-600"
                        : payment.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {payment.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
