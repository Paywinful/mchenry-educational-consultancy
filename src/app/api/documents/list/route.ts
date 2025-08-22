import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await supabaseRoute(); // remove await if supabaseRoute is sync
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params: ?status=required,rejected&limit=50
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const limitParam = url.searchParams.get("limit");

    const statuses = statusParam
      ? statusParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    let limit = Number(limitParam ?? 50);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    if (limit > 200) limit = 200;

    let query = supabase
      .from("documents")
      .select(
        "id,name,doc_type,status,uploaded_at,reviewer_note,storage_path,user_id"
      )
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .limit(limit);

    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses as string[]);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
