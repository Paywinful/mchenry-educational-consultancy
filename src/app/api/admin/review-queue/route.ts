import { NextResponse } from "next/server";
import { getAdminClient } from "../_util";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const admin = (await getAdminClient()) as any;
  if (admin?.error) return admin.error as NextResponse;

  const { supabase } = admin as { supabase: any };

  // Payments needing attention
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select(
      "id,user_id,application_id,payment_type,amount_ghs,status,due_date,paid_at,receipt_url,method,provider_ref"
    )
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true });
  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // Applications not yet accepted
  const { data: applications, error: appErr } = await supabase
    .from("applications")
    .select("id,user_id,status,progress,created_at,updated_at")
    .neq("status", "accepted")
    .order("created_at", { ascending: false });
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  return NextResponse.json({
    payments: payments ?? [],
    applications: applications ?? [],
  });
}
