import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  // Auth (must await in Next 15)
  const userClient = await supabaseRoute();
  const {
    data: { user },
    error: uErr,
  } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin gate via RPC
  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Filters & pagination
  const url = new URL(req.url);
  const rawQ = (url.searchParams.get("q") || "").trim();
  // Strip commas/parentheses to keep .or() happy
  const q = rawQ.replace(/[(),]/g, "");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Service-role for cross-tenant listing
  const adminDb = supabaseAdmin();

  let qry = adminDb
    .from("student_profiles")
    .select("user_id,first_name,last_name,email,phone,created_at,is_admin", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    // Search across email, first_name, last_name, phone
    qry = qry.or(
      `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data, error, count } = await qry;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    students: data ?? [],
    page,
    limit,
    total: count ?? 0,
  });
}
