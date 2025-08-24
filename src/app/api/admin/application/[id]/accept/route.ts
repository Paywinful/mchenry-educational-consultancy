import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // Next 15: params are async
) {
  const { id: appId } = await ctx.params;

  // (optional) quick UUID sanity check
  if (!/^[0-9a-fA-F-]{36}$/.test(appId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Must await in Next 15 (cookies are async)
  const userClient = await supabaseRoute();
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prefer RPC gate (no profile select policy needed)
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminDb = supabaseAdmin();

  // Only accept if not already accepted
  const { data: row, error } = await adminDb
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", appId)
    .neq("status", "accepted")
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!row) {
    // Distinguish not found vs already accepted
    const { data: existing, error: e2 } = await adminDb
      .from("applications")
      .select("id,status,user_id")
      .eq("id", appId)
      .maybeSingle();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "Application already accepted" }, { status: 409 });
    }
    return NextResponse.json({ error: "Nothing to update" }, { status: 409 });
  }

  // Optional: notify applicant (service role bypasses RLS)
  await adminDb
    .from("notifications")
    .insert({
      user_id: row.user_id,
      title: "Application accepted",
      body: "Congrats! Your application has been accepted.",
      type: "application",
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, application: row });
}
