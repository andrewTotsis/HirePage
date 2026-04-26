'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Stats = {
  contacts: number;
  sendable: number;
  unsubscribed: number;
  bounced: number;
  sent_total: number;
  sent_today: number;
  ai_configured: boolean;
  google_oauth_configured: boolean;
  gmail_connected: boolean;
  gmail_email: string | null;
};

export default function OutreachOverview() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
    const t = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const cards = [
    { label: 'Contacts', value: data ? data.contacts.toLocaleString() : '—', accent: 'from-white/30 to-white/5', href: '/admin/outreach/contacts' },
    { label: 'Sendable', value: data ? data.sendable.toLocaleString() : '—', accent: 'from-[#22c55e]/45 to-transparent' },
    { label: 'Sent today', value: data ? data.sent_today.toLocaleString() : '—', accent: 'from-[#0ea5e9]/45 to-transparent' },
    { label: 'Sent total', value: data ? data.sent_total.toLocaleString() : '—', accent: 'from-[#a855f7]/40 to-transparent' },
  ];

  return (
    <main className="mx-auto max-w-[1500px] px-6 pb-24 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">Cold outreach</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Outreach</h1>
          <p className="mt-1 text-sm text-white/55">
            Manage contacts, write emails, send through your own Gmail.
            {data && data.gmail_connected && (
              <> Sending from <span className="font-mono text-white/80">{data.gmail_email}</span>.</>
            )}
            {data && !data.gmail_connected && (
              <> <Link href="/admin/outreach/settings" className="text-[#7dd3fc] hover:underline">Connect Gmail</Link> to start sending.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/outreach/settings" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10">
            Settings
          </Link>
          <Link href="/admin/outreach/templates" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10">
            Templates
          </Link>
          <Link href="/admin/outreach/contacts" className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black transition-all hover:bg-white/90">
            Send outreach →
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c, i) => {
          const inner = (
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
          return c.href ? <Link key={c.label} href={c.href}>{inner}</Link> : <div key={c.label}>{inner}</div>;
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Link href="/admin/outreach/contacts" className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" /></svg>
          </div>
          <div className="text-base font-semibold">Contacts</div>
          <div className="text-sm text-white/55">Add LinkedIn URLs, paste lists, import CSV. Tag, filter, select, send.</div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">Open contacts →</div>
        </Link>

        <Link href="/admin/outreach/templates" className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /></svg>
          </div>
          <div className="text-base font-semibold">Templates</div>
          <div className="text-sm text-white/55">Reusable subject + body. Drop into the composer with one click.</div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">Open templates →</div>
        </Link>

        <Link href="/admin/outreach/settings" className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </div>
          <div className="text-base font-semibold">Settings</div>
          <div className="text-sm text-white/55">Connect Gmail · check service status. AI intros via Anthropic.</div>
          <div className="mt-2 text-xs text-white/40 transition-colors group-hover:text-white/60">Open settings →</div>
        </Link>
      </div>
    </main>
  );
}
