/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const supabase = await supabaseRoute(); // ✅ await the async helper

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ensure the app belongs to the user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items: any[] = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ ok: true });

  const rows = items.map((e) => {
    const { id: _drop, ...rest } = e;
    return { ...rest, application_id: app.id };
  });

  const { error } = await supabase.from("education_history").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: Ctx) {
  const supabase = await supabaseRoute(); // ✅

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ensure the app belongs to the user (protects updates)
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items: any[] = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ ok: true });

  // Use upsert to batch update rows (each item must include its `id`)
  const rows = items.map((u) => {
    const { id, ...rest } = u;
    return { id, ...rest, application_id: app.id };
  });

  const { error } = await supabase
    .from("education_history")
    .upsert(rows, { onConflict: "id" })
    .eq("application_id", app.id) // extra guard
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const supabase = await supabaseRoute(); // ✅

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ensure the app belongs to the user (protects deletes)
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("education_history")
    .delete()
    .in("id", ids)
    .eq("application_id", app.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
