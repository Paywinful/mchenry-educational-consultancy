/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

type InitBody = {
  amountGhs?: number | string;
  paymentType?: string;
  paymentId?: string; // optional; we’ll let db generate if not provided
};

function toNumber(n: unknown): number | null {
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

export async function POST(req: Request) {
  try {
    // Parse and validate input
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { amountGhs, paymentType, paymentId } = (raw ?? {}) as InitBody;

    if (!paymentType || typeof paymentType !== "string" || paymentType.trim() === "") {
      return NextResponse.json({ error: "Missing paymentType" }, { status: 400 });
    }

    const amountNum = toNumber(amountGhs);
    if (!amountNum || amountNum <= 0) {
      return NextResponse.json({ error: "amountGhs must be a positive number" }, { status: 400 });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfig: PAYSTACK_SECRET_KEY is not set" }, { status: 500 });
    }
    if (!PAYSTACK_CALLBACK_URL) {
      return NextResponse.json({ error: "Server misconfig: PAYSTACK_CALLBACK_URL is not set" }, { status: 500 });
    }

    // Auth
    const supabase = await supabaseRoute();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.email) {
      return NextResponse.json({ error: "User email is required for payment" }, { status: 400 });
    }

    // Convert to minor units (pesewas) for GHS
    const pesewas = Math.round(amountNum * 100);

    // Initialize or ensure a payments row
    const { data: payRow, error: upErr } = await supabase
      .from("payments")
      .upsert(
        {
          id: paymentId, // if undefined, DB default can generate one
          user_id: user.id,
          payment_type: paymentType,
          amount_ghs: amountNum,
          status: "pending",
          currency: "GHS",
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Call Paystack initialize endpoint
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: pesewas, // minor units
        currency: "GHS",
        callback_url: PAYSTACK_CALLBACK_URL,
        metadata: {
          payment_id: payRow.id,
          user_id: user.id,
          payment_type: paymentType,
        },
      }),
    });

    // Handle non-2xx from Paystack
    if (!initRes.ok) {
      const text = await initRes.text().catch(() => "");
      // Best effort parse to surface Paystack error message
      let apiMsg = text;
      try {
        const parsed = JSON.parse(text);
        apiMsg = parsed?.message || parsed?.data?.message || text || "Paystack initialize failed";
      } catch {
        /* ignore parse errors */
      }
      return NextResponse.json({ error: apiMsg || "Paystack initialize failed" }, { status: 502 });
    }

    const initJson: any = await initRes.json().catch(() => ({}));
    const authUrl: string | undefined = initJson?.data?.authorization_url;
    const reference: string | undefined = initJson?.data?.reference;

    if (!authUrl || !reference) {
      return NextResponse.json(
        { error: "Unexpected Paystack response: missing authorization_url or reference" },
        { status: 502 }
      );
    }

    // Save provider reference for reconciliation
    const { error: updErr } = await supabase
      .from("payments")
      .update({ provider_ref: reference })
      .eq("id", payRow.id);

    if (updErr) {
      // Not fatal to the payment flow; return URL anyway but surface the issue
      return NextResponse.json(
        { url: authUrl, warning: "Payment initialized, but failed to persist provider reference" },
        { status: 200 }
      );
    }

    return NextResponse.json({ url: authUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
