/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw, Search, Users, Pencil, Trash2 } from "lucide-react";

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
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-2 font-medium text-gray-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 align-top">{children}</td>;
}
/* /shims */

type AdminStudentRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  applications_count?: number | null;
};

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 🔎 same search inputs/logic as accepted apps page
  const [q, setQ] = useState("");

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      // This endpoint should return a list of students (joined from student_profiles)
      // If you named it differently, just update the URL.
      const res = await fetch("/api/admin/students", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setRows(json.students || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);


  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    const norm = (v?: string | null) => (v ?? "").toLowerCase();

    return rows.filter((r) => {
      const name = `${norm(r.first_name)} ${norm(r.last_name)}`;
    //   const email = norm(r.email);
    //   const id = norm(r.user_id);
      // (optionally also search phone) const phone = norm(r.phone);
    //   return name.includes(s) || email.includes(s) || id.includes(s);
      return name.includes(s) 
    });
  }, [q, rows]);

  // actions (wire to your existing endpoints if you already have them)
  async function onDelete(userId: string) {
    if (!confirm("Delete this student profile? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/students/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#6B0F10]" />
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-gray-500">Manage all student profiles</p>
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
            placeholder="Search by name, email, or user id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="text-sm text-gray-500">{filtered.length} of {rows.length} shown</div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : err ? (
            <div className="text-sm text-red-600">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>User ID</Th>
                    <Th>Phone</Th>
                    <Th>Applications</Th>
                    <Th>Updated</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.user_id} className="border-b">
                      <Td>
                        <div className="font-medium">
                          {(s.first_name || "") + " " + (s.last_name || "")}
                        </div>
                      </Td>
                      <Td>{s.email || "—"}</Td>
                      <Td>{s.user_id.slice(0, 8)}…</Td>
                      <Td>{s.phone || "—"}</Td>
                      <Td>{s.applications_count ?? 0}</Td>
                      <Td>{s.updated_at ? new Date(s.updated_at).toLocaleString() : "—"}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/portal/dashboard/admin/students/${s.user_id}`}
                            className="inline-flex items-center px-2 py-1 rounded border hover:bg-gray-50"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => onDelete(s.user_id)}
                            className="inline-flex items-center px-2 py-1 rounded border hover:bg-gray-50 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
