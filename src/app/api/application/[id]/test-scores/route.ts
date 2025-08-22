/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

function coerceId(raw: string | string[] | undefined): string | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

export async function POST(req: Request, ctx: any) {
  const appId = coerceId(ctx?.params?.id);
  if (!appId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseRoute(); // if your helper is async

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // verify the application belongs to the user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", appId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // upsert test_scores by unique application_id
  const { error } = await supabase
    .from("test_scores")
    .upsert({ application_id: app.id, ...(body as Record<string, unknown>) }, { onConflict: "application_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
