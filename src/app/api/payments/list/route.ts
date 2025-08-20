// src/app/api/payments/list/route.ts
export const runtime = 'nodejs';           // ensure Node runtime
export const dynamic = 'force-dynamic';    // avoid any static caching

import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseRoute();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ payments: data ?? [] });
  } catch (e: any) {
    // if anything throws, still send JSON (never HTML)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
