import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { markPaidByEmail } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook: auto-mark leads as Paid when a Stripe Checkout session
 * completes.
 *
 * Setup:
 * 1. Stripe Dashboard → Developers → Webhooks → Add endpoint
 *    - URL: https://hirepage.app/api/stripe/webhook
 *    - Events: checkout.session.completed
 *               (also: checkout.session.async_payment_succeeded for delayed
 *                payment methods, harmless to subscribe to)
 * 2. Copy the signing secret (whsec_…) → set STRIPE_WEBHOOK_SECRET in Vercel.
 *
 * Matching strategy:
 *   - We pre-set client_reference_id on every Payment Link to the submitter's
 *     email — that's our primary key. Customers can't change it at checkout,
 *     so it's the strongest match.
 *   - Fallback: customer_details.email (what the customer typed at Stripe).
 *
 * Idempotency: markPaidByEmail() short-circuits when the lead is already
 * paid, so Stripe retrying delivery is harmless.
 *
 * Package inference: if the lead already has a package, we leave it alone.
 * Otherwise we map the recurring/one-time price IDs from CLAUDE.md to a plan.
 */

// price IDs from CLAUDE.md — keep in sync if Stripe products are recreated
const PRICE_TO_PLAN: Record<string, 'basic' | 'monthly' | 'unlimited'> = {
  price_1TOUM854qLQ2cDt8OOM8tcYT: 'basic',
  price_1TOUM854qLQ2cDt8AIybljft: 'monthly', // monthly setup fee
  price_1TOUM954qLQ2cDt8SJkBDhgo: 'monthly', // $5/mo recurring
  price_1TOUMA54qLQ2cDt8QtchVYLS: 'unlimited', // unlimited setup fee
  price_1TOUMA54qLQ2cDt8cGuBRdk0: 'unlimited', // $10/mo recurring
};

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify a Stripe-Signature header against the raw body.
 * Header format: t=<timestamp>,v1=<sig>[,v1=<sig>...]
 */
function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): { ok: boolean; reason?: string } {
  if (!header) return { ok: false, reason: 'missing signature header' };
  const parts = header.split(',').map((p) => p.trim());
  let t: string | null = null;
  const sigs: string[] = [];
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k === 't') t = v;
    else if (k === 'v1') sigs.push(v);
  }
  if (!t || sigs.length === 0) return { ok: false, reason: 'malformed signature header' };
  const ts = parseInt(t, 10);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad timestamp' };
  const ageSec = Math.abs(Date.now() / 1000 - ts);
  if (ageSec > toleranceSeconds) return { ok: false, reason: 'timestamp outside tolerance' };

  const signedPayload = `${t}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  for (const sig of sigs) {
    if (timingSafeEqual(sig, expected)) return { ok: true };
  }
  return { ok: false, reason: 'no matching signature' };
}

async function fetchSessionLineItems(
  sessionId: string,
  secret: string,
): Promise<Array<{ price?: { id?: string } }>> {
  const r = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items.data.price`,
    { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' },
  );
  if (!r.ok) return [];
  const j = (await r.json()) as { line_items?: { data?: Array<{ price?: { id?: string } }> } };
  return j.line_items?.data ?? [];
}

async function inferPlanFromSession(sessionId: string): Promise<'basic' | 'monthly' | 'unlimited' | undefined> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return undefined;
  try {
    const items = await fetchSessionLineItems(sessionId, secret);
    for (const item of items) {
      const pid = item.price?.id;
      if (pid && PRICE_TO_PLAN[pid]) return PRICE_TO_PLAN[pid];
    }
  } catch {
    // best effort
  }
  return undefined;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  // Stripe requires the raw body for signature verification.
  const rawBody = await req.text();
  const sigHeader = req.headers.get('stripe-signature');

  const verify = verifyStripeSignature(rawBody, sigHeader, secret);
  if (!verify.ok) {
    return NextResponse.json({ error: `invalid signature: ${verify.reason}` }, { status: 400 });
  }

  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const session = (event.data?.object ?? {}) as Record<string, unknown>;
  const clientRefId = (session.client_reference_id as string | null) || null;
  const customerDetails = (session.customer_details as { email?: string | null } | null) || null;
  const email = (clientRefId || customerDetails?.email || '').trim().toLowerCase();
  const sessionId = (session.id as string | null) || null;

  if (!email) {
    return NextResponse.json({ ok: false, error: 'no email on session' }, { status: 200 });
  }

  // Only fetch the session detail if we need to infer the plan.
  let plan: 'basic' | 'monthly' | 'unlimited' | undefined;
  if (sessionId) plan = await inferPlanFromSession(sessionId);

  try {
    const result = await markPaidByEmail(email, plan, { source: 'stripe_webhook' });
    return NextResponse.json({
      ok: true,
      lead_id: result.lead.id,
      created: result.created,
      already_paid: result.alreadyPaid,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET for sanity-check — Stripe Dashboard "Test endpoint" hits POST, but
// having a 200 here helps confirm the route is deployed.
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'stripe webhook', method: 'POST' });
}
