import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import { formatMoney, getPaymentsSummary, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  if (!isAdminFromCookies(cookies())) {
    redirect('/admin/login');
  }

  let data: Awaited<ReturnType<typeof getPaymentsSummary>> | null = null;
  let error: string | null = null;
  try {
    data = await getPaymentsSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not load payments';
  }

  const configured = isStripeConfigured();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              Back to dashboard
            </Link>
          </div>
          <div className="text-sm font-semibold">Collected payments</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 pb-24 pt-8">
        {!configured && (
          <div className="mb-6 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.08] px-4 py-3 text-sm text-[#fbbf24]">
            <span className="font-medium">Stripe not configured.</span>{' '}
            <span className="text-[#fbbf24]/80">
              Add <code className="font-mono text-xs">STRIPE_SECRET_KEY</code> to your Vercel
              environment to load real payment data. The Stripe account is{' '}
              <code className="font-mono text-xs">acct_1TOTfW54qLQ2cDt8</code>.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/[0.08] px-4 py-3 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SummaryCard
            label="Total collected"
            value={data ? formatMoney(data.total_cents, data.currency) : '—'}
            accent="from-[#22c55e]/60 to-transparent"
          />
          <SummaryCard
            label="Successful charges"
            value={data ? data.total_count.toLocaleString() : '—'}
            accent="from-[#6366f1]/50 to-transparent"
          />
          <SummaryCard
            label="Currency"
            value={data ? data.currency.toUpperCase() : 'CAD'}
            accent="from-white/30 to-white/5"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            Recent payments
          </div>
          {data && data.payments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-left text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white/70">{new Date(p.created).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-3 text-white/85">{p.name || '—'}</td>
                    <td className="px-5 py-3 text-white/65">{p.email || '—'}</td>
                    <td className="px-5 py-3 text-white/55">{p.description || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums text-white">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <div className="text-base font-semibold text-white/85">
                {configured ? 'No payments yet' : 'Connect Stripe to see payments'}
              </div>
              <div className="max-w-sm text-sm text-white/50">
                {configured
                  ? 'Successful charges from your Stripe account will appear here.'
                  : 'Once STRIPE_SECRET_KEY is set, completed checkouts will show up automatically.'}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent}`} />
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
