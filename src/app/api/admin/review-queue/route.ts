import { NextResponse } from "next/server";
import { getAdminClient } from "../_util";

export async function GET() {
  const admin = await getAdminClient();
  if ("error" in admin) return admin.error;
  const { supabase } = admin;

  // Payments with receipts (likely pending)
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("id,user_id,application_id,payment_type,amount_ghs,status,due_date,paid_at,receipt_url,method,provider_ref")
    .or("status.eq.pending,status.eq.overdue")
    .order("due_date", { ascending: true });

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // Applications not yet accepted
  const { data: applications, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id,status,progress,created_at,updated_at")
    .neq("status", "accepted")
    .order("created_at", { ascending: false });

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  return NextResponse.json({ payments: payments ?? [], applications: applications ?? [] });
}
