/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
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
function Field({
  label,
  value,
  onChange,
  className = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  type?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
/* /shims */

type AdminStudentRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone?: string | null;
  is_admin?: boolean | null; // <-- include admin flag for modal
  created_at?: string | null;
  updated_at?: string | null;
  applications_count?: number | null;
};

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // search
  const [q, setQ] = useState("");

  // modal edit state
  const [editing, setEditing] = useState<AdminStudentRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch("/api/admin/students", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      console.log(json)
      setRows(json.students || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    const norm = (v?: string | null) => (v ?? "").toLowerCase();

    return rows.filter((r) => {
      const name = `${norm(r.first_name)} ${norm(r.last_name)}`;
      const email = norm(r.email);
      const id = norm(r.user_id);
      const phone = norm(r.phone || "");
      return (
        name.includes(s) ||
        email.includes(s) ||
        id.includes(s) ||
        phone.includes(s)
      );
    });
  }, [q, rows]);

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

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      setBusy(true);
      const payload = {
        first_name: editing.first_name ?? "",
        last_name: editing.last_name ?? "",
        email: editing.email ?? "",
        phone: editing.phone ?? "",
        is_admin: !!editing.is_admin,
      };
      const res = await fetch(`/api/admin/students/${editing.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Update failed");
    } finally {
      setBusy(false);
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
            placeholder="Search by name, email, phone, or user id…"
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
                      <Td>
                        {s.updated_at ? new Date(s.updated_at).toLocaleString() : "—"}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {/* Edit via modal */}
                          <button
                            onClick={() => setEditing(s)}
                            className="inline-flex items-center px-2 hover:cursor-pointer py-1 rounded border hover:bg-gray-50"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(s.user_id)}
                            className="inline-flex items-center px-2 hover:cursor-pointer py-1 rounded border hover:bg-gray-50 text-red-600"
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

      {/* Modal Editor */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setEditing(null);
          }}
        >
          <div className="bg-white rounded shadow w-full max-w-lg">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Edit student</h2>
            </div>
            <form onSubmit={onSaveEdit} className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  value={editing.first_name || ""}
                  onChange={(v) => setEditing({ ...editing, first_name: v })}
                />
                <Field
                  label="Last name"
                  value={editing.last_name || ""}
                  onChange={(v) => setEditing({ ...editing, last_name: v })}
                />
                <Field
                  className="col-span-2"
                  label="Email"
                  value={editing.email || ""}
                  onChange={(v) => setEditing({ ...editing, email: v })}
                  type="email"
                />
                <Field
                  className="col-span-2"
                  label="Phone"
                  value={editing.phone || ""}
                  onChange={(v) => setEditing({ ...editing, phone: v })}
                />
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    id="is_admin"
                    type="checkbox"
                    checked={!!editing.is_admin}
                    onChange={(e) =>
                      setEditing({ ...editing, is_admin: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_admin" className="text-sm">
                    Is admin
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-2 border rounded"
                  onClick={() => !busy && setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  className="px-3 py-2 hover:cursor-pointer hover:bg-red-400S bg-[#6B0F10] text-white rounded disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
