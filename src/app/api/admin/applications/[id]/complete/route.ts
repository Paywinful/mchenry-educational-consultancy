// _util.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AdminOk = { ok: true; supabase: SupabaseClient<Database>; user: User };
type AdminErr = { ok: false; res: NextResponse };

export async function getAdminClient(): Promise<AdminOk | AdminErr> {
  const supabase = await supabaseRoute();
  const { data: { user }, error: uErr } = await supabase.auth.getUser();
  if (uErr) return { ok: false, res: NextResponse.json({ error: uErr.message }, { status: 500 }) };
  if (!user) return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: isAdmin, error: aErr } = await supabase.rpc("is_admin");
  if (aErr) return { ok: false, res: NextResponse.json({ error: aErr.message }, { status: 500 }) };
  if (!isAdmin) return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  return { ok: true, supabase, user };
}
