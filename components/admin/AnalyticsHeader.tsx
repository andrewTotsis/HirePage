'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { AdminLead, packageRevenue, statusOf } from './types';

type Props = { leads: AdminLead[] };

export default function AnalyticsHeader({ leads }: Props) {
  const stats = useMemo(() => {
    const now = Date.now();
    const total = leads.length;
    const complete = leads.filter((l) => statusOf(l, now) === 'complete').length;
    const abandoned = leads.filter((l) => statusOf(l, now) === 'abandoned').length;
    const rate = total > 0 ? Math.round((complete / total) * 100) : 0;
    const dropoff = total > 0 ? Math.round((abandoned / total) * 100) : 0;
    const revenue = leads.filter((l) => statusOf(l, now) === 'complete').reduce((sum, l) => sum + packageRevenue(l.package), 0);
    return [
      { label: 'Total signups', value: total.toLocaleString(), accent: 'from-white/30 to-white/5' },
      { label: 'Completion rate', value: `${rate}%`, accent: 'from-[#22c55e]/50 to-transparent' },
      { label: 'Drop-off rate', value: `${dropoff}%`, accent: 'from-[#ef4444]/40 to-transparent' },
      { label: 'Projected revenue', value: `$${revenue.toLocaleString()}`, accent: 'from-[#6366f1]/50 to-transparent' },
    ];
  }, [leads]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
    </div>
  );
}
