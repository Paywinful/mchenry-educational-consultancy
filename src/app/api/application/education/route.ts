/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

interface EducationHistoryInput {
  id?: string;               // client may send it for updates
  institution?: string | null;
  degree?: string | null;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  gpa?: string | null;
}

type PostBody = { items?: EducationHistoryInput[] };
type PutBody  = { items?: (EducationHistoryInput & { id: string })[] };
type DeleteBody = { ids?: string[] };

async function getAuthedApp() {
  const supabase = await supabaseRoute();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { supabase, status: 401 as const, error: "Unauthorized" as const };

  // If users can have multiple apps, you may want to specify which one.
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (appErr) return { supabase, status: 500 as const, error: appErr.message as const };
  if (!app)   return { supabase, status: 400 as const, error: "No application" as const };

  return { supabase, appId: app.id as string };
}

export async function POST(req: Request) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await getAuthedApp();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const { supabase, appId } = res;

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ ok: true });

  // Build rows explicitly; ignore client-provided id on insert
  const rows = items.map((e) => ({
    institution: e.institution ?? null,
    degree: e.degree ?? null,
    field_of_study: e.field_of_study ?? null,
    start_year: e.start_year ?? null,
    end_year: e.end_year ?? null,
    gpa: e.gpa ?? null,
    application_id: appId,
  }));

  const { error } = await supabase.from("education_history").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  let body: PutBody;
  try {
    body = (await req.json()) as PutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await getAuthedApp();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const { supabase, appId } = res;

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ ok: true });

  // Upsert in batch; ensure each item includes id and is scoped to this application
  const rows = items.map((u) => ({
    id: u.id,
    institution: u.institution ?? null,
    degree: u.degree ?? null,
    field_of_study: u.field_of_study ?? null,
    start_year: u.start_year ?? null,
    end_year: u.end_year ?? null,
    gpa: u.gpa ?? null,
    application_id: appId,
  }));

  const { error } = await supabase
    .from("education_history")
    .upsert(rows, { onConflict: "id" })
    .eq("application_id", appId)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  let body: DeleteBody;
  try {
    body = (await req.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await getAuthedApp();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const { supabase, appId } = res;

  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("education_history")
    .delete()
    .in("id", ids)
    .eq("application_id", appId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
