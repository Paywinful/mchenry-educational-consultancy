import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const userClient = supabaseRoute();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await userClient
    .from("student_profiles").select("is_admin").eq("user_id", user.id).maybeSingle();
  if (!me?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;

  const adminDb = supabaseAdmin();
  let q = adminDb.from("applications")
    .select("id,user_id,status,progress,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // attach student basic info
  const userIds = [...new Set((data ?? []).map(a => a.user_id).filter(Boolean))] as string[];
  let profiles: Record<string, any> = {};
  if (userIds.length) {
    const { data: profs } = await adminDb
      .from("student_profiles")
      .select("user_id,first_name,last_name,email")
      .in("user_id", userIds);
    for (const p of (profs ?? [])) profiles[p.user_id] = p;
  }

  return NextResponse.json({
    applications: (data ?? []).map(a => ({
      ...a,
      profile: profiles[a.user_id] ?? null
    }))
  });
}
