import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

const APPLICATION_FEE_GHS = 250;

export async function GET() {
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

export async function POST() {
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1) Create a brand-new application
  const { data: app, error: insErr } = await supabase
    .from("applications")
    .insert({ user_id: user.id, status: "in_progress", progress: 0 })
    .select("*")
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // 2) Ensure an outstanding "Application Fee" exists for this app
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("application_id", app.id)
    .eq("payment_type", "Application Fee")
    .maybeSingle();

  if (!existing) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { error: payErr } = await supabase.from("payments").insert({
      user_id: user.id,
      application_id: app.id,
      payment_type: "Application Fee",
      amount_ghs: APPLICATION_FEE_GHS,
      status: "pending",
      due_date: today,
    });
    if (payErr) {
      // Not fatal for app creation, but return info so you can log if needed
      return NextResponse.json(
        { application: app, warning: `Payment row not created: ${payErr.message}` },
        { status: 201 }
      );
    }
  }

  return NextResponse.json({ application: app }, { status: 201 });
}
