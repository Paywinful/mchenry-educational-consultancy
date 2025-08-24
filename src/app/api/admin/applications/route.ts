/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  // 1) Auth with user-scoped client (await!)
  const userClient = await supabaseRoute();
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2) Admin gate via RPC (no extra RLS needed)
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 3) Parse filters & pagination
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // (optional) narrow to known statuses if you want to validate
  // const allowed = new Set(["draft","submitted","accepted","rejected","pending"]);
  // const statusFilter = status && allowed.has(status) ? status : undefined;

  // 4) Use service-role client for cross-tenant listing
  const adminDb = supabaseAdmin();

  let q = adminDb
    .from("applications")
    .select("id,user_id,status,progress,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 5) Attach basic student info (second call), robust even without FK joins
  const userIds = [...new Set((data ?? []).map((a) => a.user_id).filter(Boolean))] as string[];
  const profiles: Record<string, any> = {};

  if (userIds.length) {
    const { data: profs, error: pErr } = await adminDb
      .from("student_profiles")
      .select("user_id,first_name,last_name,email")
      .in("user_id", userIds);
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    for (const p of profs ?? []) profiles[p.user_id] = p;
  }

  return NextResponse.json({
    applications: (data ?? []).map((a) => ({
      ...a,
      profile: profiles[a.user_id] ?? null,
    })),
    page,
    limit,
  });
}
