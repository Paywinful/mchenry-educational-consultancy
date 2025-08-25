/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import {
  Bell,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  Upload,
  Eye,
  User2,
  AlertTriangle,
} from "lucide-react";

// --- tiny UI shims -----------------------------------------------------------
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
);
// const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div className="border-b px-6 py-4" {...props}>{children}</div>
// );
// const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
//   <h2 className="text-xl font-bold flex items-center gap-2" {...props}>{children}</h2>
// );
// const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
//   <p className="text-gray-500 text-sm" {...props}>{children}</p>
// );
const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="p-6" {...props}>{children}</div>
);
const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center px-3 py-2 hover:cursor-pointer rounded border bg-[#6B0F10] text-white hover:bg-red-700 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
const LightButton = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`inline-flex items-center px-3 py-2 hover:cursor-pointer rounded border bg-white hover:bg-gray-50 ${className}`} {...props}>
    {children}
  </button>
);
const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 ${className}`} {...props}>
    {children}
  </span>
);
// -----------------------------------------------------------------------------


// Types that match your tables
type PaymentRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  payment_type: string | null;
  amount_ghs: number | string | null;
  status: "pending" | "paid" | "overdue" | "upcoming";
  due_date: string | null;
  paid_at: string | null;
  method: string | null;
  provider_ref: string | null;
  receipt_url: string | null;
};

type DocumentRow = {
  id: string;
  application_id: string | null;
  user_id: string;
  name: string | null;
  doc_type: string | null;
  status: "required" | "uploaded" | "verified" | "rejected";
  storage_path: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  reviewer_note: string | null;
};

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string | null; // 'in_progress' | 'accepted' | ...
  progress: number | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function AdminNotificationsPage() {
  const supabase = supabaseClient();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});

  const niceDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  // Fetch queues + related user profiles
  const refresh = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      // 1) Fetch queues in parallel
      const [
        { data: payData, error: payErr },
        { data: docData, error: docErr },
        { data: appData, error: appErr },
      ] = await Promise.all([
        // Payments awaiting manual receipt review: pending + receipt_url present
        supabase
          .from("payments")
          .select(
            "id,user_id,application_id,payment_type,amount_ghs,status,due_date,paid_at,method,provider_ref,receipt_url"
          )
          .eq("status", "pending")
          .not("receipt_url", "is", null)
          .order("due_date", { ascending: true }),
        // Documents uploaded but not yet verified
        supabase
          .from("documents")
          .select(
            "id,application_id,user_id,name,doc_type,status,storage_path,uploaded_at,verified_at,reviewer_note"
          )
          .eq("status", "uploaded")
          .order("uploaded_at", { ascending: false }),
        // Applications NOT accepted yet (admin may accept them)
        supabase
          .from("applications")
          .select("id,user_id,status,progress,created_at,updated_at")
          .neq("status", "accepted")
          .order("updated_at", { ascending: false }),
      ]);

      if (payErr || docErr || appErr) {
        throw new Error(payErr?.message || docErr?.message || appErr?.message);
      }

      const p = payData || [];
      const d = docData || [];
      const a = appData || [];

      setPayments(p);
      setDocuments(d);
      setApplications(a);

      // 2) Fetch all involved user profiles (to show names/emails)
      const userIds = Array.from(
        new Set([
          ...p.map((x) => x.user_id),
          ...d.map((x) => x.user_id),
          ...a.map((x) => x.user_id),
        ])
      ).filter(Boolean);

      if (userIds.length) {
        const { data: profs, error: profErr } = await supabase
          .from("student_profiles")
          .select("user_id,first_name,last_name,email,phone")
          .in("user_id", userIds);
        if (profErr) throw profErr;

        const map: Record<string, ProfileRow> = {};
        for (const row of profs || []) {
          map[row.user_id] = row as ProfileRow;
        }
        setProfiles(map);
      } else {
        setProfiles({});
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalCount = useMemo(
    () => (payments?.length || 0) + (documents?.length || 0) + (applications?.length || 0),
    [payments, documents, applications]
  );

  // --- Actions ---------------------------------------------------------------

  // Try to send a user notification if you have a 'notifications' table (optional).
  // This is best-effort and will silently ignore if the table/policy isn't present.
  async function sendUserNotification(userId: string, title: string, body: string) {
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        title,
        body,
        category: "admin",
        is_read: false,
      } as any);
    } catch {
      // ignore if table doesn't exist or RLS blocks it
    }
  }

  async function approvePayment(row: PaymentRow) {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("payments")
        .update({ status: "paid", paid_at: now, method: row.method || "manual" })
        .eq("id", row.id);
      if (error) throw error;

      await sendUserNotification(
        row.user_id,
        "Payment Verified",
        `Your ${row.payment_type || "payment"} of ₵${Number(
          row.amount_ghs || 0
        ).toLocaleString()} has been verified.`
      );

      alert("Payment marked as paid.");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to approve payment");
    }
  }

  async function viewReceipt(row: PaymentRow) {
    if (!row.receipt_url) return;
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(row.receipt_url, 60);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch (e: any) {
      alert(e?.message || "Could not open receipt");
    }
  }

  async function verifyDocument(row: DocumentRow) {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("documents")
        .update({ status: "verified", verified_at: now, reviewer_note: null })
        .eq("id", row.id);
      if (error) throw error;

      await sendUserNotification(
        row.user_id,
        "Document Verified",
        `${row.name || row.doc_type || "Document"} has been verified.`
      );

      alert("Document verified.");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to verify document");
    }
  }

  async function rejectDocument(row: DocumentRow) {
    const reason = prompt("Add an optional note for the student (reason):") || null;
    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: "rejected", reviewer_note: reason })
        .eq("id", row.id);
      if (error) throw error;

      await sendUserNotification(
        row.user_id,
        "Document Rejected",
        `${row.name || row.doc_type || "Document"} was rejected.${reason ? ` Note: ${reason}` : ""}`
      );

      alert("Document rejected.");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to reject document");
    }
  }

  async function acceptApplication(row: ApplicationRow) {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("id", row.id);
      if (error) throw error;

      await sendUserNotification(
        row.user_id,
        "Application Accepted",
        "Congratulations! Your application has been accepted."
      );

      alert("Application marked as accepted.");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to accept application");
    }
  }

  // ---------------------------------------------------------------------------

  const emptyState = (label: string) => (
    <div className="text-sm text-gray-500 bg-white rounded border p-4">No {label}.</div>
  );

  const nameOf = (uid: string) => {
    const p = profiles[uid];
    if (!p) return <span className="text-gray-500">Unknown</span>;
    const full = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "—";
    return (
      <div className="flex items-center gap-2">
        <User2 className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{full}</span>
        <span className="text-gray-500 text-xs">({p.email || "—"})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#6B0F10]" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-gray-500">
              Review receipts, documents and accept applications
            </p>
          </div>
        </div>
        <LightButton className="hover:cursor-pointer" onClick={refresh}>
          <RefreshCcw className="w-4 h-4 mr-2 " />
          Refresh
        </LightButton>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 justify-between mx-4">
          <div className="text-sm text-gray-600 py-2 ">
            {totalCount > 0 ? (
              <>There are <strong>{totalCount}</strong> items needing attention.</>
            ) : (
              <>All caught up. 🎉</>
            )}
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700">
              <CreditCard className="w-3 h-3 inline mr-1" />
              Receipts: {payments.length}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700">
              <Upload className="w-3 h-3 inline mr-1" />
              Documents: {documents.length}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <FileText className="w-3 h-3 inline mr-1" />
              Applications: {applications.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payments awaiting review */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Receipts to Verify
          <span className="text-sm font-normal text-gray-500">({payments.length})</span>
        </h2>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">Loading payments…</div>
        ) : payments.length === 0 ? (
          emptyState("receipts")
        ) : (
          payments.map((row) => (
            <div key={row.id} className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-semibold">
                    {row.payment_type || "Payment"} • ₵{Number(row.amount_ghs || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {nameOf(row.user_id)}
                    <span className="mx-2">•</span>
                    Status: <span className="font-medium">Pending (receipt uploaded)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LightButton onClick={() => viewReceipt(row)} title="View receipt">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </LightButton>
                <Button onClick={() => approvePayment(row)} title="Mark as paid">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Documents awaiting verification */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Documents to Review
          <span className="text-sm font-normal text-gray-500">({documents.length})</span>
        </h2>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">Loading documents…</div>
        ) : documents.length === 0 ? (
          emptyState("documents")
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-semibold">
                    {doc.name || doc.doc_type || "Document"} — <span className="text-gray-600">Uploaded {niceDate(doc.uploaded_at)}</span>
                  </div>
                  <div className="text-sm text-gray-600">{nameOf(doc.user_id)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LightButton
                  onClick={async () => {
                    if (!doc.storage_path) return;
                    const { data, error } = await supabase.storage
                      .from("documents")
                      .createSignedUrl(doc.storage_path, 60);
                    if (error) return alert(error.message);
                    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </LightButton>
                <Button onClick={() => verifyDocument(doc)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify
                </Button>
                <LightButton className="text-red-600 border-red-200" onClick={() => rejectDocument(doc)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </LightButton>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Applications awaiting acceptance */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Applications to Accept
          <span className="text-sm font-normal text-gray-500">({applications.length})</span>
        </h2>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse text-sm text-gray-500">Loading applications…</div>
        ) : applications.length === 0 ? (
          emptyState("applications")
        ) : (
          applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold">
                    Application {app.id.slice(0, 8)}… — <span className="capitalize">{app.status || "in_progress"}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {nameOf(app.user_id)}
                    <span className="mx-2">•</span>
                    Updated {niceDate(app.updated_at)}
                    {typeof app.progress === "number" && (
                      <>
                        <span className="mx-2">•</span>Progress {Math.round(app.progress)}%
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="hover:cursor-pointer" onClick={() => acceptApplication(app)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
