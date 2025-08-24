// src/app/api/applications/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

/**
 * List all applications for the current user
 */
export async function GET() {
  const supabase = await supabaseRoute(); // <-- await
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, title, status, progress, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

/**
 * Create a new application for the current user AND
 * seed a pending "Application Fee" payment (+ a notification).
 */
export async function POST() {
  const supabase = await supabaseRoute(); // <-- await
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1) Create the application
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .insert({ user_id: user.id, status: "in_progress", progress: 0 })
    .select("*")
    .single();

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  // 2) Ensure a pending Application Fee payment exists for this application
  const APPLICATION_FEE_GHS = 250;
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
    .toISOString()
    .slice(0, 10); // 'YYYY-MM-DD'

  // Check if it already exists
  const { data: existingPayment, error: findPayErr } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("application_id", app.id)
    .eq("payment_type", "Application Fee")
    .maybeSingle();

  if (!findPayErr && !existingPayment) {
    await supabase.from("payments").insert({
      user_id: user.id,
      application_id: app.id,
      payment_type: "Application Fee",
      amount_ghs: APPLICATION_FEE_GHS,
      status: "pending",
      due_date: dueDate,
    });
  }

  // 3) Create a notification (best-effort)
  try {
    // If you ADDED a 'link' column to notifications, keep this object as-is.
    // If not, remove the 'link' line.
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "payment",
      title: "Application fee created",
      body: `Please pay ₵${APPLICATION_FEE_GHS.toLocaleString()} to continue your application.`,
      // link: "/portal/dashboard/student/payments", // <-- comment out if column doesn't exist
    });
  } catch {
    // ignore to keep endpoint resilient
  }

  return NextResponse.json({ application: app });
}
