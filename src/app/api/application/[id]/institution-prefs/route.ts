/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

// Body shape matches your SQL columns (all optional on input)
type PrefsBody = {
  selected_institution_ids?: string[] | null;
  preferred_program?: string | null;
  degree_level?: string | null;
  start_term?: string | null;
  additional_info?: string | null;
};

function coerceId(raw: string | string[] | undefined): string | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

// Minimal sanitization to only keep allowed keys and normalize undefined→null
function sanitize(body: PrefsBody): PrefsBody {
  return {
    selected_institution_ids:
      Array.isArray(body.selected_institution_ids) ? body.selected_institution_ids : body.selected_institution_ids ?? null,
    preferred_program: body.preferred_program ?? null,
    degree_level: body.degree_level ?? null,
    start_term: body.start_term ?? null,
    additional_info: body.additional_info ?? null,
  };
}

export async function POST(req: Request, ctx: any) {
  const appId = coerceId(ctx?.params?.id);
  if (!appId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseRoute();

  // Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ownership check
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", appId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse & sanitize body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = sanitize((raw ?? {}) as PrefsBody);

  // Upsert 1:1 record by application_id
  const { error: upErr } = await supabase
    .from("institution_preferences")
    .upsert(
      { application_id: app.id, ...body },
      { onConflict: "application_id" } // relies on UNIQUE(application_id)
    );

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Optional: set application.title to first selected institution name (if present)
  const firstId =
    Array.isArray(body.selected_institution_ids) && body.selected_institution_ids.length > 0
      ? body.selected_institution_ids[0]
      : undefined;

  if (firstId) {
    const { data: inst, error: instErr } = await supabase
      .from("institutions")
      .select("name")
      .eq("id", firstId)
      .maybeSingle();

    if (!instErr && inst?.name) {
      // Best-effort; ignore failure to keep endpoint idempotent
      await supabase
        .from("applications")
        .update({ title: inst.name, updated_at: new Date().toISOString() })
        .eq("id", app.id);
    }
  }

  return NextResponse.json({ ok: true });
}
