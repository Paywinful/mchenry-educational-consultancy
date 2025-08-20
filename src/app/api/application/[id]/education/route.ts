import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/server';

type Ctx = { params: { id: string } };

interface EducationHistoryInput {
    id?: string; 
    institution: string;
    degree?: string;
    field_of_study?: string;
    start_year?: string;
    end_year?: string;
    gpa?: string;
}


export async function POST(req: Request, ctx: Ctx) {
    const supabase = supabaseRoute();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ensure the app belongs to the user
    const { data: app } = await supabase.from('applications').select('id,user_id').eq('id', ctx.params.id).eq('user_id', user.id).maybeSingle();
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { items = [] }: { items: EducationHistoryInput[] } = await req.json();

    const rows = items.map(({ id: _, ...rest }) => ({
        ...rest,
        application_id: app.id,
    }));


    const { error } = await supabase.from('education_history').insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, ctx: Ctx) {
    const supabase = supabaseRoute();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items = [] } = await req.json();
    // update only rows for this app
    for (const u of items) {
        const { id, ...rest } = u;
        await supabase.from('education_history').update(rest).eq('id', id).eq('application_id', ctx.params.id);
    }
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
    const supabase = supabaseRoute();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ids = [] } = await req.json();
    await supabase.from('education_history').delete().in('id', ids).eq('application_id', ctx.params.id);
    return NextResponse.json({ ok: true });
}
