import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: app } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!app) return NextResponse.json({ error: 'No application' }, { status: 400 });

  const { error } = await supabase
    .from('test_scores')
    .upsert({ application_id: app.id, ...body }, { onConflict: 'application_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
