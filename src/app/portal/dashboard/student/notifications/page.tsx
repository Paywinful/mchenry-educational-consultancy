/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Upload,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";

type PaymentRow = {
  id: string;
  payment_type: string | null;
  amount_ghs: number | string | null;
  status: "pending" | "paid" | "overdue" | "upcoming";
  due_date: string | null;
  paid_at: string | null;
  method: string | null;
};

type DocumentRow = {
  id: string;
  name: string | null;
  doc_type: string | null;
  status: "required" | "uploaded" | "verified" | "rejected";
  uploaded_at: string | null;
  reviewer_note: string | null;
  storage_path: string | null;
};

export default function NotificationsPage() {
  const supabase = supabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const [{ data: p, error: pErr }, { data: d, error: dErr }] = await Promise.all([
        supabase
          .from("payments")
          .select("id,payment_type,amount_ghs,status,due_date,paid_at,method")
          .in("status", ["pending", "overdue"])
          .order("due_date", { ascending: true }),
        supabase
          .from("documents")
          .select("id,name,doc_type,status,uploaded_at,reviewer_note,storage_path")
          .in("status", ["required", "rejected"])
          .order("uploaded_at", { ascending: false }),
      ]);
      if (pErr || dErr) throw new Error(pErr?.message || dErr?.message);
      setPayments(p || []);
      setDocuments(d || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refresh();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = useMemo(
    () => (payments?.length || 0) + (documents?.length || 0),
    [payments, documents]
  );

  // const payNow = async (row: PaymentRow) => {
  //   try {
  //     const amount = Number(row.amount_ghs || 0);
  //     const res = await fetch("/api/payments/initiate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         amountGhs: amount,
  //         paymentType: row.payment_type || "Payment",
  //         paymentId: row.id,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.error || "Unable to start payment");
  //     window.location.href = data.url;
  //   } catch (e: any) {
  //     alert(e?.message || "Payment error");
  //   }
  // };

  const goUploadDocs = () => {
    // Step 4 of your application flow is document upload
    router.push("/portal/dashboard/student/application");
  };

  // simple helper
  const niceDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#6B0F10]" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-gray-500">
              Actions you may need to take
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center px-3 py-2 rounded border bg-white hover:bg-gray-50"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {totalCount > 0 ? (
            <>
              You have <strong>{totalCount}</strong> pending item
              {totalCount > 1 ? "s" : ""}.
            </>
          ) : (
            "You're all caught up. 🎉"
          )}
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* Payments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payments
          <span className="text-sm font-normal text-gray-500">
            ({payments.length})
          </span>
        </h2>

        {loading && (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">
            Loading payments…
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
            No payment actions needed.
          </div>
        )}

        {!loading &&
          payments.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between border"
            >
              <div className="flex items-center gap-3">
                {row.status === "pending" ? (
                  <Clock className="w-5 h-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="font-semibold">
                    {row.payment_type || "Payment"} —{" "}
                    {row.status === "overdue" ? "Overdue" : "Pending"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Amount: ₵{Number(row.amount_ghs || 0).toLocaleString()} •
                    Due: {niceDate(row.due_date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/portal/dashboard/student/payments')}
                  className="px-3 py-2 rounded bg-[#6B0F10] text-white hover:bg-red-700"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}
      </section>

      {/* Documents */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Documents
          <span className="text-sm font-normal text-gray-500">
            ({documents.length})
          </span>
        </h2>

        {loading && (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">
            Loading documents…
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
            No document actions needed.
          </div>
        )}

        {!loading &&
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between border"
            >
              <div className="flex items-center gap-3">
                {doc.status === "rejected" ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <div className="font-semibold">
                    {doc.name || "Document"} —{" "}
                    {doc.status === "rejected" ? "Rejected" : "Required"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {doc.reviewer_note
                      ? `Note: ${doc.reviewer_note}`
                      : "Please upload this to proceed."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goUploadDocs}
                  className="px-3 py-2 rounded bg-white border hover:bg-gray-50 text-[#6B0F10]"
                >
                  {doc.status === "rejected" ? "Re-upload" : "Upload"}
                </button>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
