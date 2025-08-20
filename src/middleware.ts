import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  const isDashboard = req.nextUrl.pathname.startsWith('/portal/dashboard');
  if (isDashboard && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/portal/dashboard/:path*']
};
