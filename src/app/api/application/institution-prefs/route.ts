import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

// Match your table:
// selected_institution_ids text[],
// preferred_program text, degree_level text, start_term text, additional_info text
type PrefsBody = {
  selected_institution_ids?: string[] | null;
  preferred_program?: string | null;
  degree_level?: string | null;
  start_term?: string | null;
  additional_info?: string | null;
};

function sanitize(body: PrefsBody): PrefsBody {
  return {
    selected_institution_ids: Array.isArray(body.selected_institution_ids)
      ? body.selected_institution_ids
      : body.selected_institution_ids ?? null,
    preferred_program: body.preferred_program ?? null,
    degree_level: body.degree_level ?? null,
    start_term: body.start_term ?? null,
    additional_info: body.additional_info ?? null,
  };
}

export async function POST(req: Request) {
  // Parse JSON safely
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = sanitize((raw ?? {}) as PrefsBody);

  // Supabase + auth
  const supabase = await supabaseRoute(); // if your helper isn't async, remove await
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user's application (adjust if you have multiple apps per user)
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "No application" }, { status: 400 });

  // Upsert the 1:1 preferences row keyed by application_id
  const { error } = await supabase
    .from("institution_preferences")
    .upsert(
      { application_id: app.id, ...body },
      { onConflict: "application_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
