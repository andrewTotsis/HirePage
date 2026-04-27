'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminLead, packageRevenue, statusOf } from './types';

type Props = { leads: AdminLead[] };

type PaymentsState = {
  loading: boolean;
  configured: boolean;
  total_cents: number;
  total_count: number;
  currency: string;
};

const initialPayments: PaymentsState = {
  loading: true,
  configured: false,
  total_cents: 0,
  total_count: 0,
  currency: 'cad',
};

function formatMoney(cents: number, currency: string): string {
  const dollars = cents / 100;
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: (currency || 'cad').toUpperCase(),
      maximumFractionDigits: 0,
    }).format(dollars);
  } catch {
    return `$${Math.round(dollars).toLocaleString()}`;
  }
}

export default function AnalyticsHeader({ leads }: Props) {
  const [payments, setPayments] = useState<PaymentsState>(initialPayments);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/payments', { cache: 'no-store' });
        const j = await r.json();
        if (cancelled) return;
        setPayments({
          loading: false,
          configured: !!j.configured,
          total_cents: j.total_cents ?? 0,
          total_count: j.total_count ?? 0,
          currency: j.currency ?? 'cad',
        });
      } catch {
        if (!cancelled) setPayments((p) => ({ ...p, loading: false }));
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const total = leads.length;
    // "Complete" for analytics = intake done OR further down funnel (paid/delivered).
    const intakeDone = leads.filter((l) => {
      const s = statusOf(l, now);
      return s === 'complete' || s === 'paid' || s === 'delivered';
    });
    const abandoned = leads.filter((l) => statusOf(l, now) === 'abandoned').length;
    const rate = total > 0 ? Math.round((intakeDone.length / total) * 100) : 0;
    const dropoff = total > 0 ? Math.round((abandoned / total) * 100) : 0;
    const revenue = intakeDone.reduce((sum, l) => sum + packageRevenue(l.package), 0);
    return [
      { label: 'Total signups', value: total.toLocaleString(), accent: 'from-white/30 to-white/5' },
      { label: 'Completion rate', value: `${rate}%`, accent: 'from-[#22c55e]/50 to-transparent' },
      { label: 'Drop-off rate', value: `${dropoff}%`, accent: 'from-[#ef4444]/40 to-transparent' },
      { label: 'Projected revenue', value: `$${revenue.toLocaleString()}`, accent: 'from-[#6366f1]/50 to-transparent' },
    ];
  }, [leads]);

  const collected = payments.loading
    ? '…'
    : payments.configured
    ? formatMoney(payments.total_cents, payments.currency)
    : '—';

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.28 }}
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5"
        >
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.accent}`} />
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
            {s.label}
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 * 4, duration: 0.28 }}
      >
        <Link
          href="/admin/payments"
          className="group relative block overflow-hidden rounded-2xl border border-[#22c55e]/25 bg-gradient-to-br from-[#22c55e]/[0.08] to-white/[0.02] p-5 transition-all hover:border-[#22c55e]/40 hover:from-[#22c55e]/[0.14]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#22c55e]/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#bbf7d0]/80">
              Collected payments
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/40 transition-all group-hover:translate-x-0.5 group-hover:text-white/70"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{collected}</div>
          <div className="mt-1 text-[11px] text-white/45">
            {payments.loading
              ? 'Querying Stripe…'
              : payments.configured
              ? `${payments.total_count.toLocaleString()} successful charge${payments.total_count === 1 ? '' : 's'} · view details`
              : 'Stripe not configured · click to set up'}
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
