import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseRoute } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = supabaseRoute();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { amountGhs, paymentType, paymentId } = body; // amount in GHS
  if (!amountGhs || !paymentType) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const kobo = Math.round(Number(amountGhs) * 100); // pesewas for GHS

  // Ensure a payments row exists (or create one) for tracking
  const { data: payRow, error: insErr } = await supabase
    .from('payments')
    .upsert({ id: paymentId, user_id: user.id, payment_type: paymentType, amount_ghs: amountGhs, status: 'pending' }, { onConflict: 'id' })
    .select('*')
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const initRes = await axios.post('https://api.paystack.co/transaction/initialize', {
    email: user.email,
    amount: kobo,
    currency: 'GHS',
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
    metadata: {
      payment_id: payRow.id,
      user_id: user.id,
      payment_type: paymentType,
    },
  }, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });

  const { authorization_url, reference } = initRes.data.data;

  // Save provider ref
  await supabase.from('payments').update({ provider_ref: reference }).eq('id', payRow.id);

  return NextResponse.json({ url: authorization_url });
}
