'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pct, SequenceStats } from './types';

type Stats = {
  contacts: number;
  unsubscribed: number;
  bounced: number;
  sequences: number;
  active_sequences: number;
  enrollments: number;
  active_enrollments: number;
  email_configured: boolean;
  ai_configured?: boolean;
  google_oauth_configured?: boolean;
  gmail_connected?: boolean;
  gmail_email?: string | null;
  warmup?: { enabled: boolean; day: number | null; cap: number | null; sent_today: number; remaining_today: number | null };
  from: string;
  stats: SequenceStats;
};

export default function OutreachOverview() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/outreach/stats', { cache: 'no-store' });
        const j = await r.json();
        if (!cancelled) setData(j);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    const t = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const runQueue = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const r = await fetch('/api/admin/outreach/process', { method: 'POST' });
      const j = await r.json();
      setRunResult(`Processed ${j.processed} · sent ${j.sent} · drafts ${j.draft} · errors ${j.errors}`);
    } catch {
      setRunResult('Failed to run queue');
    } finally {
      setRunning(false);
    }
  };

  const cards = [
    { label: 'Contacts', value: data ? data.contacts.toLocaleString() : '—', accent: 'from-white/30 to-white/5', href: '/admin/outreach/contacts' },
    { label: 'Active sequences', value: data ? data.active_sequences.toLocaleString() : '—', accent: 'from-[#22c55e]/45 to-transparent', href: '/admin/outreach/sequences' },
    { label: 'Active enrollments', value: data ? data.active_enrollments.toLocaleString() : '—', accent: 'from-[#0ea5e9]/45 to-transparent' },
    { label: 'Open rate', value: data ? pct(data.stats.open_rate) : '—', accent: 'from-[#a855f7]/40 to-transparent' },
    { label: 'Reply rate', value: data ? pct(data.stats.reply_rate) : '—', accent: 'from-[#f97316]/40 to-transparent' },
  ];

  return (
    <main className="mx-auto max-w-[1500px] px-6 pb-24 pt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">Cold outreach</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Outreach</h1>
          <p className="mt-1 text-sm text-white/55">
            Build sequences, enroll contacts, track opens / clicks / replies.{' '}
            {data && !data.email_configured && (
              <span className="text-[#fbbf24]">RESEND_API_KEY not set — emails are queued in draft mode only.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/outreach/settings"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            Settings
          </Link>
          <Link
            href="/admin/outreach/contacts"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            Add contacts
          </Link>
          <Link
            href="/admin/outreach/sequences/new"
            className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            New sequence
          </Link>
        </div>
      </div>

      {data?.warmup?.enabled && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0ea5e9]/25 bg-[#0ea5e9]/[0.06] px-4 py-3 text-sm">
          <div>
            <span className="font-medium text-[#7dd3fc]">Sender warm-up · day {data.warmup.day ?? '—'}</span>
            <span className="text-[#7dd3fc]/75"> · today&rsquo;s cap {data.warmup.cap ?? '—'} · sent {data.warmup.sent_today} · {data.warmup.remaining_today ?? 0} remaining</span>
          </div>
          <Link href="/admin/outreach/settings" className="text-xs text-[#7dd3fc] hover:underline">Adjust →</Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => {
          const Inner = (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.28 }}
              className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 ${c.href ? 'transition-all hover:border-white/15 hover:bg-white/[0.05]' : ''}`}
            >
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.accent}`} />
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">{c.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{loading ? '…' : c.value}</div>
            </motion.div>
          );
          return c.href ? <Link key={c.label} href={c.href}>{Inner}</Link> : <div key={c.label}>{Inner}</div>;
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link
          href="/admin/outreach/contacts"
          className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" /></svg>
          </div>
          <div className="text-base font-semibold">Contacts</div>
          <div className="text-sm text-white/55">
            Add LinkedIn URLs, paste email lists, import CSV. Tag, filter, bulk-enroll.
          </div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">
            Open contacts →
          </div>
        </Link>

        <Link
          href="/admin/outreach/sequences"
          className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 8h18" /><path d="M8 12h8" /><path d="M8 16h5" /></svg>
          </div>
          <div className="text-base font-semibold">Sequences</div>
          <div className="text-sm text-white/55">
            Multi-step email cadences with delays, personalization, A/B-ready.
          </div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">
            Open sequences →
          </div>
        </Link>

        <Link
          href="/admin/outreach/templates"
          className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /></svg>
          </div>
          <div className="text-base font-semibold">Templates</div>
          <div className="text-sm text-white/55">
            Save reusable subject + body. Drop them into any sequence step.
          </div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">
            Open templates →
          </div>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Send queue</div>
              <div className="mt-1 text-xs text-white/55">
                Auto-runs every 15 min. Run now to flush due sends immediately.
              </div>
            </div>
            <button
              onClick={runQueue}
              disabled={running}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
            >
              {running ? 'Running…' : 'Run queue now'}
            </button>
          </div>
          {runResult && <div className="mt-2 text-xs text-white/65">{runResult}</div>}
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">
                Reply detection
                {data?.gmail_connected ? (
                  <span className="ml-2 rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[10px] text-[#86efac]">Connected</span>
                ) : (
                  <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/55">Off</span>
                )}
              </div>
              <div className="mt-1 text-xs text-white/55">
                {data?.gmail_connected
                  ? <>Watching <span className="font-mono text-white/75">{data.gmail_email}</span> · auto-pauses sequences on reply</>
                  : 'Connect Gmail to auto-pause sequences when contacts reply.'}
              </div>
            </div>
            <Link
              href="/admin/outreach/settings"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              {data?.gmail_connected ? 'Manage' : 'Connect'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
