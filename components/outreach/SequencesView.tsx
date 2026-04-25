'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pct, relTime, Sequence, SequenceStats } from './types';

type StatRow = { id: string; stats: SequenceStats; enrollments: number };

export default function SequencesView() {
  const [seqs, setSeqs] = useState<Sequence[]>([]);
  const [stats, setStats] = useState<Record<string, StatRow>>({});
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const r = await fetch('/api/admin/outreach/sequences', { cache: 'no-store' });
      const j = await r.json();
      setSeqs(j.sequences ?? []);
      const map: Record<string, StatRow> = {};
      for (const s of j.stats ?? []) map[s.id] = s;
      setStats(map);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  return (
    <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link href="/admin/outreach" className="text-xs text-white/45 hover:text-white/70">← Outreach</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sequences</h1>
          <p className="mt-1 text-sm text-white/55">Multi-step email cadences. Open one to edit, enroll contacts, or watch performance.</p>
        </div>
        <Link
          href="/admin/outreach/sequences/new"
          className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
        >
          New sequence
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-white/45">Loading…</div>
        ) : seqs.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
            <div className="text-base font-semibold text-white/85">No sequences yet</div>
            <div className="max-w-sm text-sm text-white/55">Sequences are sets of emails sent on a delay to enrolled contacts.</div>
            <Link href="/admin/outreach/sequences/new" className="mt-3 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90">
              Create your first sequence
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-left text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Steps</th>
                <th className="px-5 py-3">Enrolled</th>
                <th className="px-5 py-3">Sent</th>
                <th className="px-5 py-3">Open</th>
                <th className="px-5 py-3">Reply</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {seqs.map((s) => {
                const st = stats[s.id];
                return (
                  <tr key={s.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/outreach/sequences/${s.id}`} className="block">
                        <div className="font-medium text-white/95">{s.name}</div>
                        <div className="text-xs text-white/55">{s.description || ''}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3"><StatusPill s={s.status} /></td>
                    <td className="px-5 py-3 text-white/70">{s.steps.length}</td>
                    <td className="px-5 py-3 text-white/70">{st?.enrollments ?? 0}</td>
                    <td className="px-5 py-3 text-white/70">{st?.stats.sent ?? 0}</td>
                    <td className="px-5 py-3 text-white/70">{st ? pct(st.stats.open_rate) : '—'}</td>
                    <td className="px-5 py-3 text-white/70">{st ? pct(st.stats.reply_rate) : '—'}</td>
                    <td className="px-5 py-3 text-xs text-white/55">{relTime(s.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function StatusPill({ s }: { s: Sequence['status'] }) {
  if (s === 'active') return <span className="rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[10px] text-[#86efac]">Active</span>;
  if (s === 'paused') return <span className="rounded-full bg-[#f59e0b]/15 px-2 py-0.5 text-[10px] text-[#fbbf24]">Paused</span>;
  return <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/65">Draft</span>;
}
