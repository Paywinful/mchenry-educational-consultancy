// src/lib/auth/require-admin.ts
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { supabaseRoute } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AdminOk = { ok: true; supabase: SupabaseClient<Database>; user: User };
type AdminErr = { ok: false; res: NextResponse };

export async function getAdminClient(): Promise<AdminOk | AdminErr> {
  const supabase = await supabaseRoute(); // your server-side client (reads cookies)

  // 1) Auth
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr) {
    return { ok: false, res: NextResponse.json({ error: uErr.message }, { status: 500 }) };
  }
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // 2) Admin check via RPC (uses your RLS-aware function public.is_admin)
  const { data: isAdmin, error: aErr } = await supabase.rpc("is_admin");
  if (aErr) {
    return { ok: false, res: NextResponse.json({ error: aErr.message }, { status: 500 }) };
  }
  if (!isAdmin) {
    return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, supabase, user };
}

/**
 * Route wrapper that enforces admin access.
 * Usage:
 *   export const GET = withAdmin(async ({ supabase, user, req }) => { ... })
 */
export function withAdmin<
  Fn extends (ctx: { supabase: SupabaseClient<Database>; user: User; req: NextRequest }) => Promise<NextResponse> | NextResponse
>(handler: Fn) {
  return async (req: NextRequest) => {
    const gate = await getAdminClient();
    if (!gate.ok) return gate.res;
    return handler({ supabase: gate.supabase, user: gate.user, req });
  };
}
