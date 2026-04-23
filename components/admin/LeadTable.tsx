'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AdminLead, packageLabel, relativeTime, statusOf } from './types';

type Props = {
  leads: AdminLead[];
  newIds: Set<string>;
};

function StatusBadge({ status }: { status: 'complete' | 'in_progress' | 'abandoned' }) {
  const style =
    status === 'complete'
      ? 'bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/20'
      : status === 'in_progress'
      ? 'bg-[#f59e0b]/15 text-[#fbbf24] ring-[#f59e0b]/25'
      : 'bg-[#ef4444]/15 text-[#f87171] ring-[#ef4444]/25';
  const label =
    status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'Abandoned';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'complete' ? 'bg-[#22c55e]' : status === 'in_progress' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`} />
      {label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 100
      ? 'from-[#22c55e] to-[#4ade80]'
      : value >= 60
      ? 'from-[#6366f1] to-[#a855f7]'
      : value >= 30
      ? 'from-[#f59e0b] to-[#fbbf24]'
      : 'from-white/30 to-white/50';
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-8 text-right text-[11px] tabular-nums text-white/55">{value}%</span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '??';
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-[11px] font-semibold text-white/85 ring-1 ring-white/10">
      {initials}
    </div>
  );
}

export default function LeadTable({ leads, newIds }: Props) {
  return (
    <div className="divide-y divide-white/5">
      <div className="hidden grid-cols-[minmax(260px,1.6fr)_140px_1fr_180px_150px_120px] items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40 lg:grid">
        <div>Lead</div>
        <div>Status</div>
        <div>Progress</div>
        <div>Package</div>
        <div>Last step</div>
        <div className="text-right">Updated</div>
      </div>

      {leads.map((l, i) => {
        const status = statusOf(l);
        const isNew = newIds.has(l.id);
        return (
          <motion.div
            key={l.id}
            layout
            initial={isNew ? { opacity: 0, y: -6, backgroundColor: 'rgba(99,102,241,0.12)' } : false}
            animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,255,255,0)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: isNew ? 0 : Math.min(i * 0.01, 0.15) }}
          >
          <Link
            href={`/admin/leads/${l.id}`}
            className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] lg:grid-cols-[minmax(260px,1.6fr)_140px_1fr_180px_150px_120px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={l.name || l.email || 'Anonymous'} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium text-white">
                    {l.name || <span className="text-white/50">Anonymous</span>}
                  </div>
                  {l.contacted && (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/70">
                      contacted
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-white/50">
                  {l.email || <span className="italic text-white/30">no email yet</span>}
                </div>
              </div>
            </div>

            <div className="hidden lg:block"><StatusBadge status={status} /></div>
            <div className="hidden lg:block"><ProgressBar value={l.progress} /></div>
            <div className="hidden truncate text-xs text-white/70 lg:block">{packageLabel(l.package)}</div>
            <div className="hidden truncate text-xs text-white/50 lg:block">{l.last_step}</div>
            <div className="hidden text-right text-xs text-white/50 lg:block">{relativeTime(l.updated_at)}</div>

            <div className="flex flex-col items-end gap-1 lg:hidden">
              <StatusBadge status={status} />
              <div className="text-[11px] text-white/45">{l.progress}%</div>
              <div className="text-[11px] text-white/40">{relativeTime(l.updated_at)}</div>
            </div>
          </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
