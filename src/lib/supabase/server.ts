// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/** Read Supabase envs from either NEXT_PUBLIC_* or server-only names */
function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Make the failure obvious in logs/deploys
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "(or SUPABASE_URL and SUPABASE_ANON_KEY) in Vercel → Project → Settings → Environment Variables."
    );
  }
  return { url, anon };
}

async function createServerSupabase() {
  // Next.js 15: cookies() is async
  const store = await cookies();
  const { url, anon } = getSupabaseEnv();

  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        store.set({ name, value, ...options });
      },
      remove(name: string, options?: CookieOptions) {
        store.set({ name, value: "", maxAge: 0, ...options });
      },
    },
  });
}

// Keep your original exports
export const supabaseRoute = createServerSupabase;   // for route handlers
export const supabaseServer = createServerSupabase;  // for server components
