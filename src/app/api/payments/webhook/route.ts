// app/api/paystack/webhook/route.ts
export const runtime = 'nodejs';         // needed for Node crypto
export const dynamic = 'force-dynamic';  // avoid caching

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
// import type { Database } from '@/lib/supabase/types'; // <-- if you have types

function timingSafeEqualHex(aHex: string, bHex: string) {
  // Normalize lengths to avoid throw in timingSafeEqual
  if (aHex.length !== bHex.length) return false;
  const a = Buffer.from(aHex, 'hex');
  const b = Buffer.from(bHex, 'hex');
  return crypto.timingSafeEqual(a, b);
}

function getServiceClient(): SupabaseClient /* <Database> */ {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
    }

    // 1) Read raw body FIRST (required for signature validation)
    const raw = await req.text();

    // 2) Verify signature in constant time
    const incoming = req.headers.get('x-paystack-signature') || '';
    const signature = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    if (!incoming || !timingSafeEqualHex(signature, incoming)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3) Parse event after verification
    const evt = JSON.parse(raw);

    // 4) Handle event(s)
    if (evt?.event === 'charge.success') {
      const meta = evt?.data?.metadata ?? {};
      const payId: string | undefined = meta.payment_id;
      const paidAt = evt?.data?.paid_at ? new Date(evt.data.paid_at) : new Date();
      const method = evt?.data?.channel ?? null;
      const receipt = evt?.data?.receipt_number ?? null;

      if (payId) {
        const supabase = getServiceClient(); // service role client (no cookies/RLS bypass)

        const { error } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            paid_at: paidAt.toISOString(),
            method,
            receipt_url: receipt,
          })
          .eq('id', payId);

        if (error) {
          // Return 500 to let Paystack retry if your DB was temporarily unavailable
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    // 5) Always acknowledge
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
