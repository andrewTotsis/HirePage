'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { AdminLead, Segment, statusOf } from './types';

type Props = {
  leads: AdminLead[];
  value: Segment;
  onChange: (s: Segment) => void;
};

export default function SegmentTabs({ leads, value, onChange }: Props) {
  const counts = useMemo(() => {
    const now = Date.now();
    return {
      all: leads.length,
      hot: leads.filter((l) => l.progress >= 60 && statusOf(l, now) !== 'complete').length,
      dropoff: leads.filter((l) => statusOf(l, now) === 'abandoned').length,
      complete: leads.filter((l) => statusOf(l, now) === 'complete').length,
      contacted: leads.filter((l) => l.contacted).length,
    };
  }, [leads]);

  const tabs: { id: Segment; label: string; hint?: string }[] = [
    { id: 'all', label: 'All leads' },
    { id: 'hot', label: 'Hot leads', hint: 'Reached 60%+ but didn\u2019t finish' },
    { id: 'dropoff', label: 'Recent drop-offs', hint: 'Inactive 24h+' },
    { id: 'complete', label: 'Completed' },
    { id: 'contacted', label: 'Contacted' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={t.hint}
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
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                active ? 'bg-white text-black' : 'bg-white/10 text-white/60'
              }`}>
                {counts[t.id]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
