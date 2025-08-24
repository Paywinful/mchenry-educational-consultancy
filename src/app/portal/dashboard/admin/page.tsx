"use client";

import { useEffect, useState } from "react";
import { FileText, CreditCard, Users, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/applications?status=in_progress").then(r => r.json()),
      ]);
      setStats(s?.totals ?? null);
      setApps(a?.applications ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Students" value={stats?.students} icon={<Users className="w-5 h-5" />} />
        <Card title="Applications" value={stats?.applications} icon={<FileText className="w-5 h-5" />} />
        <Card title="Docs to verify" value={stats?.docsToVerify} icon={<AlertCircle className="w-5 h-5" />} />
        <Card title="Payments (pending)" value={stats?.payments?.pending} icon={<CreditCard className="w-5 h-5" />} />
        <Card title="Payments (overdue)" value={stats?.payments?.overdue} icon={<CreditCard className="w-5 h-5" />} />
        <Card title="Accepted apps" value={stats?.acceptedApps} icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      <div className="bg-white rounded shadow">
        <div className="border-b px-6 py-4 font-semibold">In-progress applications</div>
        <div className="p-4 space-y-2">
          {apps.length === 0 ? (
            <div className="text-sm text-gray-500">None.</div>
          ) : apps.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-semibold">{a.profile?.first_name} {a.profile?.last_name} <span className="text-gray-500 text-sm">({a.profile?.email})</span></div>
                <div className="text-xs text-gray-500">Updated {new Date(a.updated_at).toLocaleString()}</div>
              </div>
              <Link href={`/portal/dashboard/admin/review/${a.id}`} className="text-[#6B0F10] border px-3 py-1 rounded">Review</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center gap-2 text-gray-600">{icon}<span>{title}</span></div>
      <div className="mt-2 text-2xl font-bold">{value ?? 0}</div>
    </div>
  );
}
