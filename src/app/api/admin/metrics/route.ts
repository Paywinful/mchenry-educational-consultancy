import { NextResponse } from "next/server";
import { getAdminClient } from "../_util";

export async function GET() {
  const admin = await getAdminClient();
  if ("error" in admin) return admin.error;
  const { supabase } = admin;

  const [apps, appsAccepted, users, paysPending, docsToReview] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("student_profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("payments").select("id", { count: "exact", head: true }).in("status", ["pending","overdue"]),
    supabase.from("documents").select("id", { count: "exact", head: true }).in("status", ["uploaded","rejected"])
  ]);

  return NextResponse.json({
    totals: {
      applications: apps.count ?? 0,
      applicationsAccepted: appsAccepted.count ?? 0,
      students: users.count ?? 0,
      paymentsPending: paysPending.count ?? 0,
      documentsToReview: docsToReview.count ?? 0,
    }
  });
}
