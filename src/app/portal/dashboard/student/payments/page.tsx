"use client";

import React, { useState } from "react";

export default function PaymentsPage() {
  const [invoices] = useState([
    { id: 1, description: "Application Fee", amount: 50, currency: "USD", status: "Unpaid", dueDate: "2025-09-01" },
    { id: 2, description: "Accommodation Deposit", amount: 200, currency: "USD", status: "Unpaid", dueDate: "2025-09-10" },
  ]);

  const [history] = useState([
    { id: 1, description: "University Registration Fee", amount: 100, currency: "USD", date: "2025-08-01", status: "Paid" },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments</h1>

      {/* Outstanding Invoices */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Outstanding Invoices</h2>
        <div className="bg-white p-6 rounded-lg shadow border">
          {invoices.length === 0 ? (
            <p className="text-gray-500">No outstanding payments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-2">{invoice.description}</td>
                    <td className="py-2">
                      {invoice.currency} {invoice.amount}
                    </td>
                    <td className="py-2">{invoice.dueDate}</td>
                    <td
                      className={`py-2 font-medium ${
                        invoice.status === "Unpaid" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {invoice.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Payment History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment History</h2>
        <div className="bg-white p-6 rounded-lg shadow border">
          {history.length === 0 ? (
            <p className="text-gray-500">No past payments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-2">{payment.description}</td>
                    <td className="py-2">
                      {payment.currency} {payment.amount}
                    </td>
                    <td className="py-2">{payment.date}</td>
                    <td className="py-2 text-green-600 font-medium">{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
