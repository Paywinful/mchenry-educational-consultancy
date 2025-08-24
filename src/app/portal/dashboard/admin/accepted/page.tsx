/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, RefreshCcw, User } from "lucide-react";

/* tiny UI shims */
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
);
const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b px-6 py-4" {...props}>{children}</div>
);
const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-xl font-bold flex items-center gap-2" {...props}>{children}</h2>
);
const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="p-6" {...props}>{children}</div>
);
/* /shims */

type AdminAppRow = {
  id: string;
  user_id: string;
  status: string;
  progress: number | null;
  created_at: string;
  updated_at: string;
  profile?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
};

export default function AdminAcceptedApplicationsPage() {
  const [rows, setRows] = useState<AdminAppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch("/api/admin/applications?status=accepted", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setRows(json.applications || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => {
      const name = `${r.profile?.first_name ?? ""} ${r.profile?.last_name ?? ""}`.toLowerCase();
      const email = (r.profile?.email ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || r.id.toLowerCase().includes(s);
    });
  }, [q, rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">Accepted Applications</h1>
            <p className="text-sm text-gray-500">All applications marked as accepted</p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center px-3 py-2 rounded border bg-white hover:bg-gray-50"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            className="w-full border rounded pl-9 pr-3 py-2"
            placeholder="Search by name, email, or application id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="text-sm text-gray-500">
          {filtered.length} of {rows.length} shown
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : err ? (
            <div className="text-sm text-red-600">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No accepted applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <Th>Applicant</Th>
                    <Th>Email</Th>
                    <Th>Application ID</Th>
                    <Th>Updated</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b">
                      <Td>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {(a.profile?.first_name || "") + " " + (a.profile?.last_name || "")}
                          </span>
                        </div>
                      </Td>
                      <Td>{a.profile?.email || "—"}</Td>
                      <Td className="font-mono">{a.id.slice(0, 8)}…</Td>
                      <Td>{new Date(a.updated_at).toLocaleString()}</Td>
                      <Td>
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                          {a.status}
                        </span>
                      </Td>
                      <Td>
                        <Link
                          href={`/portal/dashboard/admin/review/${a.id}`}
                          className="px-3 py-1 rounded border text-[#6B0F10] hover:bg-gray-50"
                        >
                          Open
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-2 font-medium text-gray-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 align-top">{children}</td>;
}
