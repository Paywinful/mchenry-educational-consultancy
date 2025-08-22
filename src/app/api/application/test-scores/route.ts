import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

// Match your table exactly
type TestScoresBody = {
  sat?: string | null;
  act?: string | null;
  gre?: string | null;
  gmat?: string | null;
  toefl?: string | null;
  ielts?: string | null;
};

function sanitize(body: Partial<TestScoresBody>): TestScoresBody {
  return {
    sat: body.sat ?? null,
    act: body.act ?? null,
    gre: body.gre ?? null,
    gmat: body.gmat ?? null,
    toefl: body.toefl ?? null,
    ielts: body.ielts ?? null,
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
  const body = sanitize((raw ?? {}) as Partial<TestScoresBody>);

  const supabase = await supabaseRoute();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the user has an application
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "No application" }, { status: 400 });

  // Upsert the 1:1 record by application_id
  const { error } = await supabase
    .from("test_scores")
    .upsert(
      { application_id: app.id, ...body },
      { onConflict: "application_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
