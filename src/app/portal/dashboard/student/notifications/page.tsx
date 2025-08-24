/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Upload,
  XCircle,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";

/** DB rows */
type NotificationRow = {
  id: string;
  user_id: string;
  type: "payment" | "document" | "general" | string;
  title: string | null;
  body: string | null;
  link: string | null;
  meta: any | null;
  read_at: string | null;
  created_at: string | null;
};

type PaymentRow = {
  id: string;
  payment_type: string | null;
  amount_ghs: number | string | null;
  status: "pending" | "paid" | "overdue" | "upcoming";
  due_date: string | null;
};

type DocumentRow = {
  id: string;
  name: string | null;
  doc_type: string | null;
  status: "required" | "uploaded" | "verified" | "rejected";
  uploaded_at: string | null;
  reviewer_note: string | null;
};

export default function NotificationsPage() {
  const supabase = supabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // primary source
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  // fallback sources
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  const [showAll, setShowAll] = useState(false); // toggle: unread vs all

  const niceDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const unreadCount = useMemo(
    () => rows.filter((r) => !r.read_at).length,
    [rows]
  );

  const fetchPrimary = useCallback(async () => {
    // Try notifications table first
    const { data: list, error: err } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) throw err;
    setRows(list || []);
    setUsingFallback(false);
  }, [supabase]);

  const fetchFallback = useCallback(async () => {
    // Derived notifications from payments + documents
    const [{ data: p, error: pErr }, { data: d, error: dErr }] = await Promise.all([
      supabase
        .from("payments")
        .select("id,payment_type,amount_ghs,status,due_date")
        .in("status", ["pending", "overdue"])
        .order("due_date", { ascending: true }),
      supabase
        .from("documents")
        .select("id,name,doc_type,status,uploaded_at,reviewer_note")
        .in("status", ["required", "rejected"])
        .order("uploaded_at", { ascending: false }),
    ]);
    if (pErr || dErr) {
      throw new Error(pErr?.message || dErr?.message);
    }
    setPayments(p || []);
    setDocuments(d || []);
    setUsingFallback(true);
  }, [supabase]);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await fetchPrimary();
    } catch {
      // if table missing / RLS issue => fallback
      try {
        await fetchFallback();
      } catch (e: any) {
        setError(e?.message || "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPrimary, fetchFallback]);

  // initial + focus refresh
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // realtime: auto-refresh when notifications change
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      try {
        ch = supabase
          .channel("notif-feed")
          .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => refresh())
          .subscribe();
      } catch {
        // ignore
      }
    })();
    return () => {
      if (ch) supabase.removeChannel(ch);
    };
  }, [supabase, refresh]);

  // --- Actions (primary only) ---
  async function markRead(id: string) {
    try {
      const now = new Date().toISOString();
      const { error: err } = await supabase
        .from("notifications")
        .update({ read_at: now })
        .eq("id", id);
      if (err) throw err;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: now } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to mark as read");
    }
  }

  async function markAllRead() {
    try {
      const now = new Date().toISOString();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error: err } = await supabase
        .from("notifications")
        .update({ read_at: now })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (err) throw err;
      setRows((prev) => prev.map((r) => (r.read_at ? r : { ...r, read_at: now })));
    } catch (e: any) {
      setError(e?.message || "Failed to mark all as read");
    }
  }

  function openAndRead(n: NotificationRow) {
    if (n.link) {
      // optimistic read
      if (!n.read_at) markRead(n.id);
      if (n.link.startsWith("/")) {
        // in-app route
        router.push(n.link);
      } else {
        window.open(n.link, "_blank");
      }
    }
  }

  // ---- UI ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#6B0F10]" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-gray-500">
              {usingFallback
                ? "Showing derived notifications (payments & documents)"
                : "Inbox of your account notifications"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!usingFallback && (
            <>
              <button
                onClick={() => setShowAll((s) => !s)}
                className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
                title={showAll ? "Show unread" : "Show all"}
              >
                {showAll ? "Show Unread" : "Show All"}
              </button>
              <button
                onClick={markAllRead}
                className="px-3 py-2 rounded bg-[#6B0F10] text-white hover:bg-red-700"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 inline mr-2" />
                Mark all read
              </button>
            </>
          )}
          <button
            onClick={refresh}
            className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {usingFallback ? (
            <>You have <strong>{(payments?.length || 0) + (documents?.length || 0)}</strong> pending items.</>
          ) : (
            <>
              <strong>{unreadCount}</strong> unread •{" "}
              <span className="text-gray-500">{rows.length} total</span>
            </>
          )}
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* PRIMARY (notifications table) */}
      {!usingFallback && (
        <section className="space-y-3">
          {(showAll ? rows : rows.filter((r) => !r.read_at)).map((n) => {
            const unread = !n.read_at;
            return (
              <div
                key={n.id}
                className={`bg-white rounded-lg shadow p-4 border flex items-start justify-between ${unread ? "border-blue-200" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-3">
                  {n.type === "payment" ? (
                    <AlertCircle className={`w-5 h-5 ${unread ? "text-red-600" : "text-gray-400"}`} />
                  ) : n.type === "document" ? (
                    <Upload className={`w-5 h-5 ${unread ? "text-orange-500" : "text-gray-400"}`} />
                  ) : (
                    <Bell className={`w-5 h-5 ${unread ? "text-[#6B0F10]" : "text-gray-400"}`} />
                  )}
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span>{n.title || "Notification"}</span>
                      {n.link && (
                        <button
                          className="text-xs text-blue-600 hover:underline inline-flex items-center"
                          onClick={() => openAndRead(n)}
                          title="Open"
                        >
                          Open <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                    {n.body && (
                      <div className="text-sm text-gray-700 mt-1">{n.body}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {niceDate(n.created_at)}
                      {n.read_at && <> • read {niceDate(n.read_at)}</>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unread ? (
                    <button
                      onClick={() => markRead(n.id)}
                      className="px-3 py-1 rounded bg-white border hover:bg-gray-50 text-[#6B0F10]"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      Read
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 px-2 py-1 border rounded">
                      Read
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && (showAll ? rows.length === 0 : unreadCount === 0) && (
            <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
              {showAll ? "No notifications yet." : "No unread notifications."}
            </div>
          )}
        </section>
      )}

      {/* FALLBACK (derived) */}
      {usingFallback && (
        <>
          {/* Payments */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Payments <span className="text-sm font-normal text-gray-500">({payments.length})</span>
            </h2>
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">
                Loading payments…
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
                No payment actions needed.
              </div>
            ) : (
              payments.map((row) => (
                <div key={row.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between border">
                  <div className="flex items-center gap-3">
                    {row.status === "pending" ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {row.payment_type || "Payment"} — {row.status === "overdue" ? "Overdue" : "Pending"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Amount: ₵{Number(row.amount_ghs || 0).toLocaleString()} • Due:{" "}
                        {row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/portal/dashboard/student/payments")}
                    className="px-3 py-2 rounded bg-[#6B0F10] text-white hover:bg-red-700"
                  >
                    Go to Payments
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Documents */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Documents <span className="text-sm font-normal text-gray-500">({documents.length})</span>
            </h2>
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">
                Loading documents…
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
                No document actions needed.
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between border">
                  <div className="flex items-center gap-3">
                    {doc.status === "rejected" ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {doc.name || "Document"} — {doc.status === "rejected" ? "Rejected" : "Required"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {doc.reviewer_note ? `Note: ${doc.reviewer_note}` : "Please upload this to proceed."}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/portal/dashboard/student/application")}
                    className="px-3 py-2 rounded bg-white border hover:bg-gray-50 text-[#6B0F10]"
                  >
                    {doc.status === "rejected" ? "Re-upload" : "Upload"}
                  </button>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
