const STRIPE_API = 'https://api.stripe.com/v1';

export type StripeCharge = {
  id: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  currency: string;
  paid: boolean;
  refunded: boolean;
  status: string;
  created: number;
  receipt_email?: string | null;
  description?: string | null;
  customer?: string | null;
  payment_intent?: string | null;
  billing_details?: { email?: string | null; name?: string | null };
};

export type PaymentSummary = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  email?: string | null;
  name?: string | null;
  description?: string | null;
};

export type PaymentsResponse = {
  configured: boolean;
  total_cents: number;
  total_count: number;
  currency: string;
  payments: PaymentSummary[];
};

function key(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

export function isStripeConfigured(): boolean {
  return !!key();
}

async function fetchPage(after?: string): Promise<{ data: StripeCharge[]; has_more: boolean }> {
  const k = key();
  if (!k) throw new Error('stripe not configured');
  const params = new URLSearchParams({ limit: '100' });
  if (after) params.set('starting_after', after);
  const r = await fetch(`${STRIPE_API}/charges?${params.toString()}`, {
    headers: { Authorization: `Bearer ${k}` },
    cache: 'no-store',
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`stripe error ${r.status}: ${text.slice(0, 200)}`);
  }
  return (await r.json()) as { data: StripeCharge[]; has_more: boolean };
}

export async function listCharges(maxPages = 10): Promise<StripeCharge[]> {
  const all: StripeCharge[] = [];
  let after: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchPage(after);
    if (!page.data?.length) break;
    all.push(...page.data);
    if (!page.has_more) break;
    after = page.data[page.data.length - 1].id;
  }
  return all;
}

export async function getPaymentsSummary(): Promise<PaymentsResponse> {
  if (!isStripeConfigured()) {
    return { configured: false, total_cents: 0, total_count: 0, currency: 'cad', payments: [] };
  }
  const charges = await listCharges();
  const succeeded = charges.filter(
    (c) => c.status === 'succeeded' && c.paid && !c.refunded,
  );
  const total_cents = succeeded.reduce(
    (sum, c) => sum + Math.max(0, (c.amount_captured ?? c.amount) - (c.amount_refunded ?? 0)),
    0,
  );
  const currency = succeeded[0]?.currency ?? 'cad';
  const payments: PaymentSummary[] = succeeded.map((c) => ({
    id: c.id,
    amount: Math.max(0, (c.amount_captured ?? c.amount) - (c.amount_refunded ?? 0)),
    currency: c.currency,
    status: c.status,
    created: c.created * 1000,
    email: c.billing_details?.email ?? c.receipt_email ?? null,
    name: c.billing_details?.name ?? null,
    description: c.description ?? null,
  }));
  payments.sort((a, b) => b.created - a.created);
  return { configured: true, total_cents, total_count: succeeded.length, currency, payments };
}

export function formatMoney(cents: number, currency = 'cad'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(dollars);
}
