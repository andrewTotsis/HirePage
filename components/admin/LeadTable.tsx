'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AdminLead,
  FunnelStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_STYLES,
  packageLabel,
  relativeTime,
  statusOf,
} from './types';

type Props = {
  leads: AdminLead[];
  newIds: Set<string>;
  onPatch: (id: string, patch: Partial<AdminLead>) => Promise<void> | void;
};

const GRID_COLS =
  'minmax(160px,180px) minmax(220px,1.4fr) minmax(160px,1fr) 84px 102px minmax(130px,180px) minmax(100px,140px) minmax(80px,100px)';

export default function LeadTable({ leads, newIds, onPatch }: Props) {
  return (
    <div className="divide-y divide-white/5">
      <div
        className="hidden items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40 lg:grid"
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        <div>Status</div>
        <div>Lead</div>
        <div>Intake</div>
        <div>Paid</div>
        <div>Delivered</div>
        <div>Package</div>
        <div>Last Step</div>
        <div className="text-right">Updated</div>
      </div>

      {leads.map((l, i) => (
        <Row key={l.id} lead={l} isNew={newIds.has(l.id)} index={i} onPatch={onPatch} />
      ))}
    </div>
  );
}

const ROW_LG_GRID =
  'lg:grid-cols-[minmax(160px,180px)_minmax(220px,1.4fr)_minmax(160px,1fr)_84px_102px_minmax(130px,180px)_minmax(100px,140px)_minmax(80px,100px)]';

function Row({
  lead,
  isNew,
  index,
  onPatch,
}: {
  lead: AdminLead;
  isNew: boolean;
  index: number;
  onPatch: (id: string, patch: Partial<AdminLead>) => Promise<void> | void;
}) {
  const router = useRouter();
  const status = statusOf(lead);

  const open = () => router.push(`/admin/leads/${lead.id}`);

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -6, backgroundColor: 'rgba(99,102,241,0.12)' } : false}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,255,255,0)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: isNew ? 0 : Math.min(index * 0.01, 0.15) }}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') open();
      }}
      className={`group grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-white/[0.03] ${ROW_LG_GRID}`}
    >
      <div className="hidden lg:block" onClick={stop}>
        <StatusEdit value={status} onChange={(v) => onPatch(lead.id, { status_override: v })} />
      </div>

      <LeadCell lead={lead} />

      <div className="hidden lg:block" onClick={stop}>
        <IntakeEdit lead={lead} onChange={(v) => onPatch(lead.id, { progress: v })} />
      </div>

      <div className="hidden lg:block" onClick={stop}>
        <YesNoToggle
          value={lead.paid}
          onChange={(v) => onPatch(lead.id, { paid: v })}
          color="emerald"
        />
      </div>

      <div className="hidden lg:block" onClick={stop}>
        <YesNoToggle
          value={lead.delivered}
          onChange={(v) => onPatch(lead.id, { delivered: v })}
          color="sky"
        />
      </div>

      <div className="hidden truncate text-xs text-white/70 lg:block">{packageLabel(lead.package)}</div>
      <div className="hidden truncate text-[11px] text-white/45 lg:block">{lead.last_step}</div>
      <div className="hidden text-right text-[11px] text-white/45 lg:block">
        {relativeTime(lead.updated_at)}
      </div>

      <div className="flex flex-col items-end gap-1 lg:hidden">
        <StatusBadge status={status} />
        <div className="text-[11px] text-white/45">{lead.progress}%</div>
        <div className="text-[11px] text-white/40">{relativeTime(lead.updated_at)}</div>
      </div>
    </motion.div>
  );
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/* -------------------- Lead identity cell -------------------- */

function LeadCell({ lead }: { lead: AdminLead }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={lead.name || lead.email || 'Anonymous'} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-white">
            {lead.name || <span className="text-white/50">Anonymous</span>}
          </div>
          {lead.contacted && (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/70">
              contacted
            </span>
          )}
        </div>
        <div className="truncate text-xs text-white/50">
          {lead.email || <span className="italic text-white/30">no email yet</span>}
        </div>
      </div>
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

/* -------------------- Status badge / inline dropdown -------------------- */

export function StatusBadge({ status }: { status: FunnelStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${s.ring} ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function StatusEdit({
  value,
  onChange,
}: {
  value: FunnelStatus;
  onChange: (v: FunnelStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full transition-opacity hover:opacity-90"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StatusBadge status={value} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-[170px] overflow-hidden rounded-xl border border-white/10 bg-[#0f0f12] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]">
          {STATUS_ORDER.map((s) => {
            const active = s === value;
            const sty = STATUS_STYLES[s];
            return (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  if (s !== value) onChange(s);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-white/5 ${
                  active ? 'bg-white/[0.04]' : ''
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${sty.dot}`} />
                <span className={sty.text}>{STATUS_LABELS[s]}</span>
                {active && <span className="ml-auto text-[10px] text-white/40">current</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------- Intake (inline-editable progress) -------------------- */

function IntakeEdit({
  lead,
  onChange,
}: {
  lead: AdminLead;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(lead.progress));

  const commit = () => {
    const n = Math.max(0, Math.min(100, parseInt(draft, 10) || 0));
    setEditing(false);
    if (n !== lead.progress) onChange(n);
  };

  const value = lead.progress;
  const color =
    value >= 100
      ? 'from-[#22c55e] to-[#4ade80]'
      : value >= 60
      ? 'from-[#6366f1] to-[#a855f7]'
      : value >= 30
      ? 'from-[#f59e0b] to-[#fbbf24]'
      : 'from-white/30 to-white/50';

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="number"
          min={0}
          max={100}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(String(lead.progress));
              setEditing(false);
            }
          }}
          className="w-14 rounded-md border border-white/15 bg-white/[0.04] px-1.5 py-1 text-[11px] text-white outline-none focus:border-white/40"
          onClick={stop}
        />
        <span className="text-[11px] text-white/40">%</span>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setDraft(String(value));
        setEditing(true);
      }}
      className="flex w-full items-center gap-2 rounded-md py-0.5 transition-colors hover:bg-white/[0.03]"
      title="Click to override"
    >
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-9 text-right text-[11px] tabular-nums text-white/55">{value}%</span>
    </button>
  );
}

/* -------------------- Yes/No toggle pill -------------------- */

function YesNoToggle({
  value,
  onChange,
  color,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color: 'emerald' | 'sky';
}) {
  const yesCls =
    color === 'emerald'
      ? 'bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/25'
      : 'bg-[#0ea5e9]/15 text-[#7dd3fc] ring-[#0ea5e9]/25';
  const yesDot = color === 'emerald' ? 'bg-[#22c55e]' : 'bg-[#0ea5e9]';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-all ${
        value ? yesCls : 'bg-white/5 text-white/55 ring-white/10 hover:bg-white/10'
      }`}
      aria-pressed={value}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${value ? yesDot : 'bg-white/30'}`} />
      {value ? 'Yes' : 'No'}
    </button>
  );
}
