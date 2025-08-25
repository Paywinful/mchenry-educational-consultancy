/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "@/components/toast";

export default function AdminReviewApp() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/application/${id}`);
    const json = await res.json();
    setData(json);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!data) return <div>Loading…</div>;

  const { application, profile, education, testScores, preferences, documents, payments } = data;

  async function viewDoc(path: string) {
    const r = await fetch(`/api/admin/storage/signed-url?path=${encodeURIComponent(path)}`);
    const j = await r.json();
    if (j.url) window.open(j.url, "_blank");
  }

  async function markPaid(paymentId: string) {
    setBusy(true);
    await fetch(`/api/admin/payment/${paymentId}/mark-paid`, { method: "POST" });
    await load();
    setBusy(false);
  }

  async function confirmPaymentAndAccept() {
    setBusy(true);
    // 1) mark first pending payment paid (or all)
    const pending = (payments ?? []).filter((p: any) => p.status !== "paid");
    for (const p of pending) {
      await fetch(`/api/admin/payment/${p.id}/mark-paid`, { method: "POST" });
    }
    // 2) accept app
    await fetch(`/api/admin/application/${application.id}/accept`, { method: "POST" });
    await load();
    setBusy(false);
    toast.success("Application Accepted")
    router.back()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Application Review</h1>
        <div className="flex gap-2">
          <button disabled={busy} className="px-3 py-2 hover:cursor-pointer hover:bg-red-400 rounded bg-[#6B0F10] text-white" onClick={confirmPaymentAndAccept}>
            <CheckCircle className="w-4 h-4 inline mr-2" /> Confirm payment & Accept
          </button>
          <button className="px-3 py-2 hover:cursor-pointer hover:bg-gray-400 hover:text-white rounded border" onClick={() => router.back()}>Back</button>
        </div>
      </div>

      {/* Profile */}
      <Section title="Applicant">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name" value={`${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`} />
          <Field label="Email" value={profile?.email} />
          <Field label="Phone" value={profile?.phone} />
          <Field label="Status" value={application?.status} />
        </div>
      </Section>

      {/* Education */}
      <Section title="Education history">
        {(education ?? []).length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {education.map((e: any) => (
              <div key={e.id} className="p-3 border rounded">
                <div className="font-semibold">{e.institution}</div>
                <div className="text-sm text-gray-600">{e.degree} • {e.field_of_study}</div>
                <div className="text-xs text-gray-500">{e.start_year} – {e.end_year}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Test scores */}
      <Section title="Test scores">
        {!testScores ? <Empty /> : (
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {["sat","act","gre","gmat","toefl","ielts"].map(k => (
              <Field key={k} label={k.toUpperCase()} value={testScores[k] || "—"} />
            ))}
          </div>
        )}
      </Section>

      {/* Preferences */}
      <Section title="Institution preferences">
        {!preferences ? <Empty /> : (
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Field label="Program" value={preferences.preferred_program} />
            <Field label="Degree level" value={preferences.degree_level} />
            <Field label="Start term" value={preferences.start_term} />
            <Field label="Institutions" value={(preferences.selected_institution_ids ?? []).join(", ")} />
            <Field label="Info" value={preferences.additional_info} />
          </div>
        )}
      </Section>

      {/* Documents */}
      <Section title="Documents">
        {(documents ?? []).length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {documents.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.doc_type} • {d.status}</div>
                </div>
                {d.storage_path && (
                  <button onClick={() => viewDoc(d.storage_path)} className="px-3 py-1 rounded border">
                    <Download className="w-4 h-4 inline mr-1" /> View
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Payments */}
      <Section title="Payments">
        {(payments ?? []).length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{p.payment_type}</div>
                  <div className="text-xs text-gray-500">Status: {p.status} • Amount: ₵{Number(p.amount_ghs||0).toLocaleString()}</div>
                </div>
                {p.status !== "paid" && (
                  <button disabled={busy} onClick={() => markPaid(p.id)} className="px-3 py-1 rounded bg-white border">
                    <CreditCard className="w-4 h-4 inline mr-1" /> Mark paid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="bg-white rounded shadow">
      <div className="border-b px-6 py-3 font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
function Empty() {
  return <div className="text-sm text-gray-500">No data.</div>;
}
