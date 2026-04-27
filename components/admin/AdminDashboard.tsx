'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLead, Segment, SortBy, statusOf } from './types';
import TopBar from './TopBar';
import AnalyticsHeader from './AnalyticsHeader';
import SegmentTabs from './SegmentTabs';
import FiltersBar from './FiltersBar';
import LeadTable from './LeadTable';

type Props = { hasBackend: boolean };

const REFRESH_MS = 10_000;

export default function AdminDashboard({ hasBackend }: Props) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'basic' | 'monthly' | 'unlimited'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [lastSeen, setLastSeen] = useState<number>(Date.now());

  const fetchLeads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch('/api/admin/leads', { cache: 'no-store' });
      if (!r.ok) throw new Error('fetch failed');
      const j = (await r.json()) as { leads: AdminLead[] };
      setLeads(j.leads ?? []);
      setErr(null);
    } catch (e) {
      setErr('Could not load leads');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const t = setInterval(() => fetchLeads(true), REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLastSeen(Date.now()), 1500);
    return () => clearTimeout(t);
  }, [leads.length]);

  const newLeadIds = useMemo(() => {
    return new Set(leads.filter((l) => l.created_at > lastSeen - 30_000).map((l) => l.id));
  }, [leads, lastSeen]);

  const patchLead = useCallback(async (id: string, patch: Partial<AdminLead>) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? ({ ...l, ...patch, updated_at: Date.now() } as AdminLead) : l)),
    );
    try {
      const r = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw new Error('patch failed');
      const j = (await r.json()) as { lead: AdminLead };
      setLeads((prev) => prev.map((l) => (l.id === id ? j.lead : l)));
    } catch {
      // Revert on failure
      fetchLeads(true);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = [...leads];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.role.some((r) => r.toLowerCase().includes(q)),
      );
    }
    if (packageFilter !== 'all') list = list.filter((l) => l.package === packageFilter);
    const now = Date.now();
    if (segment !== 'all') list = list.filter((l) => statusOf(l, now) === segment);
    if (sortBy === 'recent') list.sort((a, b) => b.updated_at - a.updated_at);
    if (sortBy === 'created') list.sort((a, b) => b.created_at - a.created_at);
    if (sortBy === 'intent') list.sort((a, b) => b.progress - a.progress || b.updated_at - a.updated_at);
    return list;
  }, [leads, query, packageFilter, segment, sortBy]);

  return (
    <div className="min-h-screen">
      <TopBar query={query} onQuery={setQuery} />
      <main className="mx-auto max-w-[1500px] px-6 pb-24 pt-6">
        {!hasBackend && (
          <div className="mb-6 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.08] px-4 py-3 text-sm text-[#fbbf24]">
            <span className="font-medium">Demo mode.</span>{' '}
            <span className="text-[#fbbf24]/80">
              Database isn&rsquo;t configured — data resets between requests. Add the{' '}
              <strong>Neon</strong> integration in Vercel (provisions{' '}
              <code className="font-mono text-xs">DATABASE_URL</code>) to persist.
            </span>
          </div>
        )}

        <AnalyticsHeader leads={leads} />

        <div className="mt-8">
          <SegmentTabs
            leads={leads}
            value={segment}
            onChange={setSegment}
          />
        </div>

        <div className="mt-4">
          <FiltersBar
            packageFilter={packageFilter}
            onPackageFilter={setPackageFilter}
            sortBy={sortBy}
            onSort={setSortBy}
            count={filtered.length}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-white/50">Loading…</div>
          ) : err ? (
            <div className="flex h-64 items-center justify-center text-[#f87171]">{err}</div>
          ) : filtered.length === 0 ? (
            <EmptyState segment={segment} />
          ) : (
            <LeadTable leads={filtered} newIds={newLeadIds} onPatch={patchLead} />
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ segment }: { segment: Segment }) {
  const copy: Record<Segment, { title: string; subtitle: string }> = {
    all: { title: 'No leads yet', subtitle: 'New onboarding submissions will appear here in real time.' },
    lead: { title: 'No new leads', subtitle: 'Brand-new visitors who landed on onboarding but haven\u2019t answered yet.' },
    in_progress: { title: 'No leads in progress', subtitle: 'People mid-funnel will land here while they fill out the intake.' },
    complete: { title: 'No intake-complete leads', subtitle: 'Submitters who finished the form but haven\u2019t paid yet.' },
    paid: { title: 'No paid orders', subtitle: 'Stripe purchases will surface here once you mark them paid (or wire a webhook).' },
    delivered: { title: 'Nothing delivered yet', subtitle: 'Mark a lead as delivered when their HirePage ships.' },
    abandoned: { title: 'No drop-offs', subtitle: 'Nobody has gone quiet for more than 24 hours. Nice.' },
  };
  const c = copy[segment];
  return (
    <div className="flex h-80 flex-col items-center justify-center gap-2 text-center">
      <div className="text-lg font-semibold text-white/90">{c.title}</div>
      <div className="max-w-sm text-sm text-white/50">{c.subtitle}</div>
    </div>
  );
}
