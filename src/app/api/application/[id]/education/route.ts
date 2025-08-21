/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

interface EducationHistoryInput {
  id?: string; // client may send it, but we ignore on insert
  institution?: string | null;
  degree?: string | null;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  gpa?: string | null;
}

type PostBody = { items?: EducationHistoryInput[] };
type PutBody = { items?: (EducationHistoryInput & { id: string })[] };
type DeleteBody = { ids?: string[] };

function coerceId(raw: string | string[] | undefined): string | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

/** ---------- POST /api/application/[id]/education ---------- */
export async function POST(req: Request, ctx: any) {
  const id = coerceId(ctx?.params?.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseRoute();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ensure the app belongs to the user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ ok: true });

  // Build rows explicitly (never keep client-provided id on insert)
  const rows = items.map((e) => ({
    institution: e.institution ?? null,
    degree: e.degree ?? null,
    field_of_study: e.field_of_study ?? null,
    start_year: e.start_year ?? null,
    end_year: e.end_year ?? null,
    gpa: e.gpa ?? null,
    application_id: app.id,
  }));

  const { error } = await supabase.from("education_history").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** ---------- PUT /api/application/[id]/education ---------- */
export async function PUT(req: Request, ctx: any) {
  const id = coerceId(ctx?.params?.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseRoute();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // verify ownership
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: PutBody;
  try {
    body = (await req.json()) as PutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ ok: true });

  // Upsert: each must include id
  const rows = items.map((u) => ({
    id: u.id,
    institution: u.institution ?? null,
    degree: u.degree ?? null,
    field_of_study: u.field_of_study ?? null,
    start_year: u.start_year ?? null,
    end_year: u.end_year ?? null,
    gpa: u.gpa ?? null,
    application_id: app.id,
  }));

  const { error } = await supabase
    .from("education_history")
    .upsert(rows, { onConflict: "id" })
    .eq("application_id", app.id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** ---------- DELETE /api/application/[id]/education ---------- */
export async function DELETE(req: Request, ctx: any) {
  const id = coerceId(ctx?.params?.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseRoute();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // verify ownership
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: DeleteBody;
  try {
    body = (await req.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("education_history")
    .delete()
    .in("id", ids)
    .eq("application_id", app.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
