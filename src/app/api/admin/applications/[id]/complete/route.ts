import { NextResponse } from "next/server";
import { getAdminClient } from "../../../_util";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminClient();
  if ("error" in admin) return admin.error;
  const { supabase } = admin;

  // Get application + user
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id,status")
    .eq("id", params.id)
    .maybeSingle();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find a likely "Application Fee" pending payment (or any pending with receipt)
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("application_id", app.id)
    .in("status", ["pending","overdue"])
    .order("due_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  // 1) Mark payment paid if we found one
  if (payment) {
    const { error: payErr } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        method: payment.method || "receipt_verified"
      })
      .eq("id", payment.id);

    if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  // 2) Accept application
  const { error: updAppErr } = await supabase
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", app.id);
  if (updAppErr) return NextResponse.json({ error: updAppErr.message }, { status: 500 });

  // 3) Notify the student
  const { error: notifErr } = await supabase
    .from("notifications")
    .insert({
      user_id: app.user_id,
      type: "application_complete",
      title: "Application accepted",
      body: payment
        ? "Your payment has been confirmed and your application is accepted. 🎉"
        : "Your application is accepted. 🎉"
    });
  if (notifErr) return NextResponse.json({ error: notifErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
