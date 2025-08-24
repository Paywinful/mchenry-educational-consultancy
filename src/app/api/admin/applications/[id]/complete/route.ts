import { NextResponse } from "next/server";
import { getAdminClient } from "../../../_util";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // <- Next 15: params is async
) {
  const { id } = await ctx.params;

  const admin = await getAdminClient();
  if ("error" in admin) return admin.error;
  const { supabase } = admin;

  // 1) Get application + user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id,status")
    .eq("id", id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status === "accepted") {
    return NextResponse.json({ error: "Application already accepted" }, { status: 409 });
  }

  // 2) Find a pending/overdue payment (earliest due)
  const { data: payment, error: pFindErr } = await supabase
    .from("payments")
    .select("*")
    .eq("application_id", app.id)
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pFindErr) return NextResponse.json({ error: pFindErr.message }, { status: 500 });

  // 3) Mark payment paid if found (but not if already paid)
  if (payment) {
    const { error: payErr } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        method: payment.method || "receipt_verified",
      })
      .eq("id", payment.id)
      .neq("status", "paid");
    if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  // 4) Accept application
  const { error: updAppErr } = await supabase
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", app.id)
    .neq("status", "accepted");
  if (updAppErr) return NextResponse.json({ error: updAppErr.message }, { status: 500 });

  // 5) Notify the student
  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id: app.user_id,
    type: "application_complete",
    title: "Application accepted",
    body: payment
      ? "Your payment has been confirmed and your application is accepted. 🎉"
      : "Your application is accepted. 🎉",
  });
  if (notifErr) return NextResponse.json({ error: notifErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
