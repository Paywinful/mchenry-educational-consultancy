/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  // Auth (must await in Next 15)
  const userClient = await supabaseRoute();
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin gate via RPC
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;

  const adminDb = supabaseAdmin();

  let q = adminDb
    .from("applications")
    .select("id,user_id,status,progress,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // attach student basic info
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
  });
}
