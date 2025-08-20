import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

type Ctx = { params: { id: string } };

async function ensureOwnApp(supabase: ReturnType<typeof supabaseRoute>, id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, app: null, status: 401 as const };
  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!app) return { user, app: null, status: 404 as const };
  return { user, app, status: 200 as const };
}

export async function GET(_req: Request, ctx: Ctx) {
  const supabase = supabaseRoute();
  const { status, app } = await ensureOwnApp(supabase, ctx.params.id);
  if (status !== 200) return NextResponse.json({ error: status === 404 ? 'Not found' : 'Unauthorized' }, { status });

  const [{ data: education }, { data: testScores }, { data: prefs }, { data: docs }] = await Promise.all([
    supabase.from('education_history').select('*').eq('application_id', app.id).order('start_year', { ascending: true }),
    supabase.from('test_scores').select('*').eq('application_id', app.id).maybeSingle(),
    supabase.from('institution_preferences').select('*').eq('application_id', app.id).maybeSingle(),
    supabase.from('documents').select('*').eq('application_id', app.id).order('uploaded_at', { ascending: false }),
  ]);

  return NextResponse.json({
    application: app,
    education: education ?? [],
    testScores: testScores ?? null,
    preferences: prefs ?? null,
    documents: docs ?? [],
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const supabase = supabaseRoute();
  const { status, app } = await ensureOwnApp(supabase, ctx.params.id);
  if (status !== 200) return NextResponse.json({ error: status === 404 ? 'Not found' : 'Unauthorized' }, { status });

  const body = await req.json(); // e.g. { status, progress }
  const { error, data } = await supabase
    .from('applications')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', app.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
