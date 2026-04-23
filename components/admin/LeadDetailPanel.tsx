'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AdminLead, packageLabel, relativeTime, statusOf } from './types';

type Props = {
  lead: AdminLead;
  onClose: () => void;
  onPatched: (l: AdminLead) => void;
};

export default function LeadDetailPanel({ lead, onClose, onPatched }: Props) {
  const [notes, setNotes] = useState(lead.notes);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const status = statusOf(lead);

  useEffect(() => {
    setNotes(lead.notes);
  }, [lead.id, lead.notes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = async (body: { notes?: string; contacted?: boolean }) => {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const j = (await r.json()) as { lead: AdminLead };
        onPatched(j.lead);
        setSavedAt(Date.now());
      }
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = () => patch({ notes });
  const toggleContacted = () => patch({ contacted: !lead.contacted });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(lead, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lead.name || lead.email || lead.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mailto = lead.email
    ? `mailto:${lead.email}?subject=${encodeURIComponent('Your HirePage — quick follow-up')}&body=${encodeURIComponent(
        `Hi ${lead.name?.split(' ')[0] || 'there'},\n\nJust checking in on your HirePage setup. Let me know if you'd like to pick up where you left off.\n\n— HirePage`,
      )}`
    : undefined;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-white/10 bg-[#0b0b0e] shadow-[-20px_0_60px_-10px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold tracking-tight">
                {lead.name || 'Anonymous'}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                status === 'complete'
                  ? 'bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/25'
                  : status === 'abandoned'
                  ? 'bg-[#ef4444]/15 text-[#f87171] ring-[#ef4444]/25'
                  : 'bg-[#f59e0b]/15 text-[#fbbf24] ring-[#f59e0b]/25'
              }`}>
                {status === 'complete' ? 'Complete' : status === 'abandoned' ? 'Abandoned' : 'In Progress'}
              </span>
            </div>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="mt-0.5 block truncate text-sm text-white/60 hover:text-white"
              >
                {lead.email}
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="-m-1.5 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-5">
            <Section title="Overview">
              <KV label="Progress">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                      style={{ width: `${lead.progress}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-white/60">{lead.progress}%</span>
                </div>
              </KV>
              <KV label="Last step">{lead.last_step}</KV>
              <KV label="Package">{packageLabel(lead.package)}</KV>
              <KV label="Created">{new Date(lead.created_at).toLocaleString()}</KV>
              <KV label="Updated">{relativeTime(lead.updated_at)}</KV>
            </Section>

            <Section title="Personal info">
              <KV label="Name">{lead.name || <Dim />}</KV>
              <KV label="Email">{lead.email || <Dim />}</KV>
              <KV label="Phone">{lead.phone ? `${lead.phone_country || ''} ${lead.phone}` : <Dim />}</KV>
              <KV label="LinkedIn">{renderLink(lead.linkedin)}</KV>
              <KV label="GitHub">{renderLink(lead.github)}</KV>
            </Section>

            <Section title="Responses">
              <KV label="Roles">
                {lead.role.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {lead.role.map((r) => (
                      <span key={r} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                        {r}
                      </span>
                    ))}
                  </div>
                ) : <Dim />}
              </KV>
              <KV label="Style">{lead.style || <Dim />}</KV>
              <KV label="Colors">
                {lead.colors.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.colors.map((c) => (
                      <span key={c} className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs text-white/80">
                        <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: c }} />
                        {c}
                      </span>
                    ))}
                  </div>
                ) : <Dim />}
              </KV>
              <KV label="Custom requests">
                {lead.custom_requests ? (
                  <div className="whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-sm text-white/85">
                    {lead.custom_requests}
                  </div>
                ) : <Dim />}
              </KV>
            </Section>

            <Section title="Files">
              <div className="grid grid-cols-1 gap-2">
                <FileCard label="Resume" name={lead.resume_name} size={lead.resume_size} url={lead.resume_url} />
                <FileCard label="Headshot" name={lead.headshot_name} size={undefined} url={lead.headshot_url} />
              </div>
            </Section>

            <Section title="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Internal notes about this lead…"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/90 outline-none transition-all placeholder:text-white/30 focus:border-white/25"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  {savedAt ? `Saved ${relativeTime(savedAt)}` : saving ? 'Saving…' : ' '}
                </div>
                <button
                  onClick={saveNotes}
                  disabled={saving || notes === lead.notes}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save note
                </button>
              </div>
            </Section>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 bg-[#0b0b0e] px-6 py-4">
          <button
            onClick={toggleContacted}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              lead.contacted
                ? 'bg-[#22c55e]/15 text-[#4ade80] ring-1 ring-inset ring-[#22c55e]/25 hover:bg-[#22c55e]/20'
                : 'bg-white/10 text-white/85 hover:bg-white/15'
            }`}
          >
            {lead.contacted ? '✓ Contacted' : 'Mark as contacted'}
          </button>
          {mailto && (
            <a
              href={mailto}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:bg-white/15"
            >
              Send follow-up
            </a>
          )}
          <button
            onClick={exportData}
            className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-all hover:border-white/25 hover:text-white"
          >
            Export JSON
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
        {title}
      </div>
      <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">{children}</div>
    </section>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-4 text-sm">
      <div className="pt-0.5 text-xs text-white/45">{label}</div>
      <div className="min-w-0 text-white/90">{children}</div>
    </div>
  );
}

function Dim() {
  return <span className="text-white/30">—</span>;
}

function renderLink(url: string) {
  if (!url) return <Dim />;
  const href = url.startsWith('http') ? url : `https://${url}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-[#a5b4fc] hover:underline">
      {url}
    </a>
  );
}

function FileCard({ label, name, size, url }: { label: string; name?: string; size?: number; url?: string }) {
  if (!name) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40">
        <span>{label}</span>
        <span>Not uploaded</span>
      </div>
    );
  }
  const sizeStr = size ? (size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`) : '';
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/75">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-white/55">{label}</div>
        <div className="truncate text-sm text-white/90">{name}</div>
      </div>
      <div className="text-xs text-white/45">{sizeStr}</div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-white/25 hover:text-white"
        >
          Open
        </a>
      )}
    </div>
  );
}
