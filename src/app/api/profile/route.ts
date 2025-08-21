/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await supabaseRoute(); // ✅ await, no args

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PUT(req: Request) {
  const supabase = await supabaseRoute(); // ✅ await, no args

  let body: any;
  try { body = await req.json(); } catch { 
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = { ...body, user_id: user.id, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
