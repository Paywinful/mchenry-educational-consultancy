import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Prepare a response so we can write refreshed cookies to it
  const response = NextResponse.next({ request });

  // Supabase client wired to read from the incoming request cookies
  // and write refreshed cookies to the outgoing response.
  const supabase = createServerClient(
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

  // 1) This call refreshes tokens if needed and ensures cookies are up-to-date
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2) Protect your dashboard
  const isDashboard = request.nextUrl.pathname.startsWith("/portal/dashboard");
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Return the response so the refreshed cookies reach the browser
  return response;
}

export const config = {
  matcher: ["/portal/dashboard/:path*"],
};
