/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

/** Update a student's profile (admin only) */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ user_id: string }> } // Next 15: params are async
) {
  const { user_id } = await ctx.params;
  if (!/^[0-9a-fA-F-]{36}$/.test(user_id)) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));

  const userClient = await supabaseRoute();
  const { data: { user }, error: uErr } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prefer RPC gate (no profile policy needed)
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminDb = supabaseAdmin();

  // Fetch target profile to know current admin status
  const { data: target, error: tErr } = await adminDb
    .from("student_profiles")
    .select("user_id,is_admin")
    .eq("user_id", user_id)
    .maybeSingle();
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If changing is_admin → false, ensure we're not removing the last admin
  if ("is_admin" in body && body.is_admin === false && target.is_admin === true) {
    const { count, error: cErr } = await adminDb
      .from("student_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("is_admin", true);
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 409 });
    }
  }

  // Build partial update object to avoid unintended overwrites
  const now = new Date().toISOString();
  const updates: Record<string, any> = { updated_at: now };
  if ("first_name" in body) updates.first_name = body.first_name;
  if ("last_name" in body) updates.last_name = body.last_name;
  if ("email" in body) updates.email = body.email;
  if ("phone" in body) updates.phone = body.phone;
  if ("is_admin" in body) updates.is_admin = !!body.is_admin;

  const { data, error } = await adminDb
    .from("student_profiles")
    .update(updates)
    .eq("user_id", user_id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

/** Delete a student's profile (admin only) */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ user_id: string }> } // Next 15: params are async
) {
  const { user_id } = await ctx.params;
  if (!/^[0-9a-fA-F-]{36}$/.test(user_id)) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  const userClient = await supabaseRoute();
  const { data: { user }, error: uErr } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Optional: prevent deleting yourself from this endpoint
  if (user_id === user.id) {
    return NextResponse.json({ error: "Refusing to delete the current admin user" }, { status: 409 });
  }

  const adminDb = supabaseAdmin();

  // Check if target is admin & last admin
  const { data: target, error: tErr } = await adminDb
    .from("student_profiles")
    .select("user_id,is_admin")
    .eq("user_id", user_id)
    .maybeSingle();
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.is_admin) {
    const { count, error: cErr } = await adminDb
      .from("student_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("is_admin", true);
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 409 });
    }
  }

  // Delete profile (ensure your FKs have ON DELETE CASCADE if you rely on it)
  const { error } = await adminDb.from("student_profiles").delete().eq("user_id", user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optional: also delete the auth user (uncomment when ready)
  // await adminDb.auth.admin.deleteUser(user_id).catch(() => {});

  return NextResponse.json({ ok: true });
}
