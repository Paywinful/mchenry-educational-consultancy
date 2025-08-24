// src/app/api/applications/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

/** Optional: GET one app (helpful for debugging) */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;           // ✅ await params
  const supabase = await supabaseRoute();    // ✅ await supabase

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ application: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await supabaseRoute();

  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admins may delete any app; students only their own.
  const { data: isAdmin, error: aErr } = await supabase.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const appQuery = supabase
    .from("applications")
    .select("id,user_id,status")
    .eq("id", params.id)
    .maybeSingle();

  const { data: app, error: appErr } = isAdmin
    ? await appQuery
    : await appQuery.eq("user_id", user.id);

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Students cannot delete accepted apps; admins can.
  if (!isAdmin && app.status === "accepted") {
    return NextResponse.json(
      { error: "Accepted applications cannot be deleted." },
      { status: 409 } // conflict with resource state
    );
  }

  // If you have FK payments(application_id) REFERENCES applications(id) ON DELETE CASCADE,
  // you can remove this explicit payments delete.
  const { error: payDelErr } = await supabase
    .from("payments")
    .delete()
    .eq("application_id", app.id);
  if (payDelErr) return NextResponse.json({ error: payDelErr.message }, { status: 500 });

  const { error: delErr } = await supabase
    .from("applications")
    .delete()
    .eq("id", app.id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}