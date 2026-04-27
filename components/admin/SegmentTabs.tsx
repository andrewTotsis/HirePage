'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { AdminLead, FunnelStatus, STATUS_LABELS, Segment, statusOf } from './types';

type Props = {
  leads: AdminLead[];
  value: Segment;
  onChange: (s: Segment) => void;
};

const ORDER: { id: Segment; label: string }[] = [
  { id: 'all', label: 'All leads' },
  { id: 'lead', label: STATUS_LABELS.lead },
  { id: 'in_progress', label: STATUS_LABELS.in_progress },
  { id: 'complete', label: STATUS_LABELS.complete },
  { id: 'paid', label: STATUS_LABELS.paid },
  { id: 'delivered', label: STATUS_LABELS.delivered },
  { id: 'abandoned', label: STATUS_LABELS.abandoned },
];

export default function SegmentTabs({ leads, value, onChange }: Props) {
  const counts = useMemo(() => {
    const now = Date.now();
    const m: Record<Segment, number> = {
      all: leads.length,
      lead: 0,
      in_progress: 0,
      complete: 0,
      paid: 0,
      delivered: 0,
      abandoned: 0,
    };
    for (const l of leads) {
      const s = statusOf(l, now) as FunnelStatus;
      m[s]++;
    }
    return m;
  }, [leads]);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1">
      {ORDER.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              active ? 'text-white' : 'text-white/55 hover:text-white/85'
            }`}
          >
            {active && (
              <motion.span
                layoutId="segment-pill"
                className="absolute inset-0 rounded-lg bg-white/10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                }`}
              >
                {counts[t.id]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
