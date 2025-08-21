// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

async function createServerSupabase() {
  const store = await cookies(); // <-- await in Next.js 15

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}

// Keep your original names:
export const supabaseRoute = createServerSupabase;    // for route handlers
export const supabaseServer = createServerSupabase;   // for server components
