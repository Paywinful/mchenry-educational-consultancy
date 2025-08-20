import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

type Ctx = { params: { id: string } };

export async function POST(req: Request, ctx: Ctx) {
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: app } = await supabase.from('applications').select('id,user_id').eq('id', ctx.params.id).eq('user_id', user.id).maybeSingle();
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { error } = await supabase
    .from('test_scores')
    .upsert({ application_id: app.id, ...body }, { onConflict: 'application_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
