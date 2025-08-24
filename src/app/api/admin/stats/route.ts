// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const supabase = await supabaseRoute();                      // user-scoped
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin, error: aErr } = await supabase.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminDb = supabaseAdmin();                             // service role
  const countOnly = { count: "exact" as const, head: true };

  const [students, apps, paid, pending, overdue, docs, accepted] = await Promise.all([
    adminDb.from("student_profiles").select("user_id", countOnly),
    adminDb.from("applications").select("id", countOnly),
    adminDb.from("payments").select("id", countOnly).eq("status","paid"),
    adminDb.from("payments").select("id", countOnly).eq("status","pending"),
    adminDb.from("payments").select("id", countOnly).eq("status","overdue"),
    adminDb.from("documents").select("id", countOnly).in("status",["uploaded"]),
    adminDb.from("applications").select("id", countOnly).eq("status","accepted"),
  ]);

  const firstErr = students.error || apps.error || paid.error || pending.error ||
                   overdue.error || docs.error || accepted.error;
  if (firstErr) return NextResponse.json({ error: firstErr.message }, { status: 500 });

  return NextResponse.json({
    totals: {
      students: students.count ?? 0,
      applications: apps.count ?? 0,
      payments: { paid: paid.count ?? 0, pending: pending.count ?? 0, overdue: overdue.count ?? 0 },
      docsToVerify: docs.count ?? 0,
      acceptedApps: accepted.count ?? 0,
    },
  });
}
