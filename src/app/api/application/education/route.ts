import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure application exists
  const { data: app } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!app) return NextResponse.json({ error: 'No application' }, { status: 400 });

  const rows = (body.items ?? []).map((e: any) => ({ ...e, application_id: app.id }));
  const { error } = await supabase.from('education_history').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = body.items ?? [];
  for (const u of updates) {
    const { id, ...rest } = u;
    await supabase.from('education_history').update(rest).eq('id', id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { ids } = await req.json();
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await supabase.from('education_history').delete().in('id', ids);
  return NextResponse.json({ ok: true });
}
