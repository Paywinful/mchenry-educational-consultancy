import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: paymentId } = await ctx.params; // Next 15: params is async
  if (!/^[0-9a-fA-F-]{36}$/.test(paymentId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const userClient = await supabaseRoute(); // must await for cookies in Next 15
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin gate via RPC (avoids needing profile SELECT policy)
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminDb = supabaseAdmin();
  const now = new Date().toISOString();

  // Avoid double-marking: only update if not already paid
  const { data: row, error } = await adminDb
    .from("payments")
    .update({ status: "paid", paid_at: now, method: "admin" })
    .eq("id", paymentId)
    .neq("status", "paid")
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) {
    // Either not found or already paid
    // Check if it exists to return a better code
    const { data: exists, error: e2 } = await adminDb
      .from("payments")
      .select("id,status")
      .eq("id", paymentId)
      .maybeSingle();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (exists.status === "paid") {
      return NextResponse.json({ error: "Payment already marked as paid" }, { status: 409 });
    }
    return NextResponse.json({ error: "Nothing to update" }, { status: 409 });
  }

  // Optional: notify the user (service role bypasses RLS)
  await adminDb
    .from("notifications")
    .insert({
      user_id: row.user_id,
      title: "Payment confirmed",
      body: `Your payment (${row.payment_type || "Payment"}) has been marked as paid.`,
      type: "payment",
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, payment: row });
}
