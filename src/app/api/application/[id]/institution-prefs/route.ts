import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

type Ctx = { params: { id: string } };

export async function POST(req: Request, ctx: Ctx) {
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ensure the app belongs to the user
  const { data: app } = await supabase
    .from('applications')
    .select('id,user_id')
    .eq('id', ctx.params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  // save / update preferences
  const { error: upErr } = await supabase
    .from('institution_preferences')
    .upsert({ application_id: app.id, ...body }, { onConflict: 'application_id' });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // ---- NEW: set application.title to the first selected university's name ----
  const firstId: string | undefined =
    Array.isArray(body?.selected_institution_ids) && body.selected_institution_ids.length > 0
      ? body.selected_institution_ids[0]
      : undefined;

  if (firstId) {
    // Look up in the institutions table; if found, set as title
    const { data: inst } = await supabase
      .from('institutions')
      .select('name, type')
      .eq('id', firstId)
      .maybeSingle();

    // only set a human title if we have a name (typically tertiary/university rows)
    if (inst?.name) {
      await supabase
        .from('applications')
        .update({ title: inst.name, updated_at: new Date().toISOString() })
        .eq('id', app.id);
    }
  }

  return NextResponse.json({ ok: true });
}
