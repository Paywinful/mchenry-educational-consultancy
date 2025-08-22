/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types"; // adjust path if different

type Ctx = { params: { id: string } };

type EnsureOk = {
  status: 200;
  user: NonNullable<Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"]>;
  app: any;
};
type EnsureErr =
  | { status: 401 }
  | { status: 404 }
  | { status: 500; message: string };

async function ensureOwnApp(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<EnsureOk | EnsureErr> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { status: 401 };

  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return { status: 500, message: appErr.message };
  if (!app) return { status: 404 };
  return { status: 200, user, app };
}

export async function GET(_req: Request, ctx: any) {
  const supabase = await supabaseRoute(); // ✅ await the async helper
  const ensure = await ensureOwnApp(supabase, ctx.params.id);

  if (ensure.status !== 200) {
    const msg =
      ensure.status === 404
        ? "Not found"
        : ensure.status === 401
        ? "Unauthorized"
        : (ensure as any).message || "Server error";
    return NextResponse.json({ error: msg }, { status: ensure.status });
  }

  const { app } = ensure;

  const [
    { data: education },
    { data: testScores },
    { data: prefs },
    { data: docs },
  ] = await Promise.all([
    supabase
      .from("education_history")
      .select("*")
      .eq("application_id", app.id)
      .order("start_year", { ascending: true }),
    supabase.from("test_scores").select("*").eq("application_id", app.id).maybeSingle(),
    supabase
      .from("institution_preferences")
      .select("*")
      .eq("application_id", app.id)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("*")
      .eq("application_id", app.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  return NextResponse.json({
    application: app,
    education: education ?? [],
    testScores: testScores ?? null,
    preferences: prefs ?? null,
    documents: docs ?? [],
  });
}

export async function PUT(req: Request, ctx: any) {
  const supabase = await supabaseRoute(); // ✅ await the async helper
  const ensure = await ensureOwnApp(supabase, ctx.params.id);

  if (ensure.status !== 200) {
    const msg =
      ensure.status === 404
        ? "Not found"
        : ensure.status === 401
        ? "Unauthorized"
        : (ensure as any).message || "Server error";
    return NextResponse.json({ error: msg }, { status: ensure.status });
  }

  const { app } = ensure;

  let body: any;
  try {
    body = await req.json(); // e.g., { status, progress }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", app.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
