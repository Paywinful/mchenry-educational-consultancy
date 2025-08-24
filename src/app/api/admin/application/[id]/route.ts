import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // <- async params in Next 15
) {
  const { id: appId } = await ctx.params;          // <- must await
  // (optional) quick UUID sanity check
  if (!/^[0-9a-fA-F-]{36}$/.test(appId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // user-scoped client (await cookies)
  const userClient = await supabaseRoute();
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // admin gate via RPC
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminDb = supabaseAdmin();

  const [
    appRes,
    eduRes,
    scoresRes,
    prefsRes,
    docsRes,
    paysRes,
  ] = await Promise.all([
    adminDb.from("applications").select("*").eq("id", appId).maybeSingle(),
    adminDb.from("education_history").select("*").eq("application_id", appId),
    adminDb.from("test_scores").select("*").eq("application_id", appId).maybeSingle(),
    adminDb.from("institution_preferences").select("*").eq("application_id", appId).maybeSingle(),
    adminDb.from("documents").select("*").eq("application_id", appId),
    adminDb.from("payments").select("*").eq("application_id", appId),
  ]);

  const firstErr =
    appRes.error ||
    eduRes.error ||
    scoresRes.error ||
    prefsRes.error ||
    docsRes.error ||
    paysRes.error;
  if (firstErr) return NextResponse.json({ error: firstErr.message }, { status: 500 });

  if (!appRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profileRes = await adminDb
    .from("student_profiles")
    .select("*")
    .eq("user_id", appRes.data.user_id)
    .maybeSingle();

  if (profileRes.error) {
    return NextResponse.json({ error: profileRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    application: appRes.data,
    profile: profileRes.data ?? null,
    education: eduRes.data ?? [],
    testScores: scoresRes.data ?? null,
    preferences: prefsRes.data ?? null,
    documents: docsRes.data ?? [],
    payments: paysRes.data ?? [],
  });
}
