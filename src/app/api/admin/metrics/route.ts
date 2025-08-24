import { NextResponse } from "next/server";
import { getAdminClient } from "../_util";

export async function GET(): Promise<NextResponse> {
  const admin = await getAdminClient() as any;
  if (admin?.error) return admin.error as NextResponse;

  const { supabase } = admin as { supabase: any };

  const countOnly = { count: "exact" as const, head: true };

  const [apps, appsAccepted, users, paysPending, docsToReview] = await Promise.all([
    supabase.from("applications").select("id", countOnly),
    supabase.from("applications").select("id", countOnly).eq("status", "accepted"),
    supabase.from("student_profiles").select("user_id", countOnly),
    supabase.from("payments").select("id", countOnly).in("status", ["pending", "overdue"]),
    supabase.from("documents").select("id", countOnly).in("status", ["uploaded", "rejected"]),
  ]);

  // (optional) surface the first error if any:
  const firstErr =
    apps.error || appsAccepted.error || users.error || paysPending.error || docsToReview.error;
  if (firstErr) return NextResponse.json({ error: firstErr.message }, { status: 500 });

  return NextResponse.json({
    totals: {
      applications: apps.count ?? 0,
      applicationsAccepted: appsAccepted.count ?? 0,
      students: users.count ?? 0,
      paymentsPending: paysPending.count ?? 0,
      documentsToReview: docsToReview.count ?? 0,
    },
  });
}
