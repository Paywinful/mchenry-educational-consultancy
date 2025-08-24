import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

function createSupabaseInMiddleware(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options?: CookieOptions) {
          response.cookies.set({ name, value: "", maxAge: 0, ...options });
        },
      },
    }
  );
}

// Helper: keep refreshed cookies when returning a redirect
function withRefreshedCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

export async function middleware(request: NextRequest) {
  // Prepare a response so Supabase can refresh cookies onto it
  const response = NextResponse.next({ request });
  const supabase = createSupabaseInMiddleware(request, response);

  // 1) Refresh tokens if needed and get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/portal/dashboard");

  // 2) Gate the whole dashboard
  if (isDashboard && !user) {
    const url = new URL("/portal", request.url);
    url.searchParams.set("redirect", path);
    return withRefreshedCookies(response, NextResponse.redirect(url));
  }

  // 3) Only check admin when it matters (admin area or root redirect)
  let isAdmin = false;
  const needsAdminCheck =
    !!user &&
    (path.startsWith("/portal/dashboard/admin") ||
      path === "/portal/dashboard" ||
      path === "/portal/dashboard/");

  if (needsAdminCheck) {
    const { data: rpcIsAdmin } = await supabase.rpc("is_admin");
    isAdmin = !!rpcIsAdmin;
  }

  // 4) Protect admin area
  if (path.startsWith("/portal/dashboard/admin") && !isAdmin) {
    const url = new URL("/portal/dashboard/student", request.url);
    return withRefreshedCookies(response, NextResponse.redirect(url));
  }

  // 5) Smart default: /portal/dashboard -> role home
  if (path === "/portal/dashboard" || path === "/portal/dashboard/") {
    const url = new URL(
      isAdmin ? "/portal/dashboard/admin" : "/portal/dashboard/student",
      request.url
    );
    return withRefreshedCookies(response, NextResponse.redirect(url));
  }

  // Return the response so any refreshed cookies reach the browser
  return response;
}

export const config = {
  matcher: ["/portal/dashboard/:path*"],
};
