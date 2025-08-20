import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseRoute } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET as string)
    .update(raw)
    .digest('hex');
  const incoming = req.headers.get('x-paystack-signature');
  if (signature !== incoming) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const evt = JSON.parse(raw);
  const supabase = supabaseRoute();

  if (evt.event === 'charge.success') {
    const meta = evt.data.metadata || {};
    const payId = meta.payment_id as string | undefined;
    const paidAt = evt.data.paid_at ? new Date(evt.data.paid_at) : new Date();
    if (payId) {
      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: paidAt.toISOString(), method: evt.data.channel, receipt_url: evt.data.receipt_number || null })
        .eq('id', payId);
    }
  }

  return NextResponse.json({ received: true });
}

//
