import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

interface EducationHistoryInput {
  id?: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
  gpa?: string;
}

type PostBody = { items?: EducationHistoryInput[] };
type PutBody  = { items?: (EducationHistoryInput & { id: string })[] };
type DeleteBody = { ids?: string[] };

type Ctx = { params: { id: string } };

/**
 * Create education history rows for a specific application (params.id),
 * after verifying the application belongs to the current user.
 */
export async function POST(req: Request, ctx: unknown) {
  const { params } = ctx as Ctx;
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure the application belongs to the user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app)  return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { items = [] }: PostBody = await req.json();

  // Whitelist fields; drop incoming id; attach application_id
  const rows = items.map((e) => ({
    institution: e.institution,
    degree: e.degree,
    field_of_study: e.field_of_study,
    start_year: e.start_year,
    end_year: e.end_year,
    gpa: e.gpa,
    application_id: app.id,
  }));

  const { error } = await supabase.from("education_history").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/**
 * Update education rows by id, constrained to the current application.
 */
export async function PUT(req: Request, ctx: unknown) {
  const { params } = ctx as Ctx;
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Defense-in-depth: verify app ownership
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app)  return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { items = [] }: PutBody = await req.json();

  // Update only rows that belong to this application
  for (const u of items) {
    const { id, ...rest } = u;
    const { error: updErr } = await supabase
      .from("education_history")
      .update(rest)
      .eq("id", id)
      .eq("application_id", params.id);

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Delete education rows by id array, constrained to the current application.
 */
export async function DELETE(req: Request, ctx: unknown) {
  const { params } = ctx as Ctx;
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Defense-in-depth: verify app ownership
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app)  return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { ids = [] }: DeleteBody = await req.json();

  const { error } = await supabase
    .from("education_history")
    .delete()
    .in("id", ids)
    .eq("application_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
