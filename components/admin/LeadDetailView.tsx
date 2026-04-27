'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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

type Props = { initialLead: AdminLead };

const PACKAGE_OPTIONS: { id: 'basic' | 'monthly' | 'unlimited' | ''; label: string }[] = [
  { id: '', label: '— No plan picked —' },
  { id: 'basic', label: 'Basic · $50' },
  { id: 'monthly', label: 'Monthly Edits · $50 + $5/mo' },
  { id: 'unlimited', label: 'Unlimited Edits · $50 + $10/mo' },
];

export default function LeadDetailView({ initialLead }: Props) {
  const router = useRouter();
  const [lead, setLead] = useState<AdminLead>(initialLead);
  const [notesDraft, setNotesDraft] = useState(initialLead.notes);
  const [name, setName] = useState(initialLead.name);
  const [email, setEmail] = useState(initialLead.email);
  const [phone, setPhone] = useState(initialLead.phone);
  const [linkedin, setLinkedin] = useState(initialLead.linkedin);
  const [github, setGithub] = useState(initialLead.github);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = statusOf(lead);

  const patch = async (body: Partial<AdminLead>) => {
    setSaving(true);
    // optimistic
    setLead((prev) => ({ ...prev, ...body, updated_at: Date.now() } as AdminLead));
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const j = (await r.json()) as { lead: AdminLead };
        setLead(j.lead);
        setSavedAt(Date.now());
      }
    } finally {
      setSaving(false);
    }
  };

  const saveIdentity = () =>
    patch({
      name,
      email,
      phone,
      linkedin,
      github,
    });

  const saveNotes = () => patch({ notes: notesDraft });
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

  const doDelete = async () => {
    setDeleting(true);
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' });
      if (r.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  };

  const mailto = lead.email
    ? `mailto:${lead.email}?subject=${encodeURIComponent('Your HirePage — quick follow-up')}&body=${encodeURIComponent(
        `Hi ${lead.name?.split(' ')[0] || 'there'},\n\nJust checking in on your HirePage setup. Let me know if you'd like to pick up where you left off.\n\n— HirePage`,
      )}`
    : undefined;

  const initials =
    (lead.name || lead.email || '??')
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || '??';

  const identityDirty =
    name !== lead.name ||
    email !== lead.email ||
    phone !== lead.phone ||
    linkedin !== lead.linkedin ||
    github !== lead.github;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-6 py-4">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to leads
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-white/25 hover:text-white"
            >
              Export JSON
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1.5 text-xs font-medium text-[#f87171] transition-all hover:border-[#ef4444]/50 hover:bg-[#ef4444]/15"
            >
              Delete lead
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 to-white/5 text-lg font-semibold text-white ring-1 ring-white/15">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    {lead.name || 'Anonymous lead'}
                  </h1>
                  <StatusPill status={status} />
                  {lead.contacted && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/75">
                      contacted
                    </span>
                  )}
                </div>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="mt-1 inline-block text-sm text-white/60 hover:text-white">
                    {lead.email}
                  </a>
                ) : (
                  <div className="mt-1 text-sm italic text-white/35">no email yet</div>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                  <span>Created {new Date(lead.created_at).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Updated {relativeTime(lead.updated_at)}</span>
                  <span>·</span>
                  <span>{packageLabel(lead.package)}</span>
                  {lead.paid && lead.paid_at ? (
                    <>
                      <span>·</span>
                      <span className="text-[#86efac]">Paid {new Date(lead.paid_at).toLocaleDateString()}</span>
                    </>
                  ) : null}
                  {lead.delivered && lead.delivered_at ? (
                    <>
                      <span>·</span>
                      <span className="text-[#7dd3fc]">Delivered {new Date(lead.delivered_at).toLocaleDateString()}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleContacted}
                disabled={saving}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  lead.contacted
                    ? 'bg-[#22c55e]/15 text-[#4ade80] ring-1 ring-inset ring-[#22c55e]/25 hover:bg-[#22c55e]/20'
                    : 'bg-white px-3 py-2 text-black hover:bg-white/90'
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
            </div>
          </div>

          <div className="relative mt-8">
            <div className="mb-2 flex items-end justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                Onboarding intake
              </div>
              <div className="text-xs tabular-nums text-white/55">
                {lead.progress}% · last step <span className="text-white/75">{lead.last_step}</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lead.progress}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  lead.progress >= 100
                    ? 'from-[#22c55e] to-[#4ade80]'
                    : lead.progress >= 60
                    ? 'from-[#6366f1] to-[#a855f7]'
                    : lead.progress >= 30
                    ? 'from-[#f59e0b] to-[#fbbf24]'
                    : 'from-white/30 to-white/60'
                }`}
              />
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Section title="Personal info">
              <FieldRow label="Name">
                <Input value={name} onChange={setName} placeholder="Full name" />
              </FieldRow>
              <FieldRow label="Email">
                <Input value={email} onChange={setEmail} type="email" placeholder="email@example.com" />
              </FieldRow>
              <FieldRow label="Phone">
                <Input value={phone} onChange={setPhone} placeholder="+1 555…" />
              </FieldRow>
              <FieldRow label="LinkedIn">
                <Input value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/…" />
              </FieldRow>
              <FieldRow label="GitHub">
                <Input value={github} onChange={setGithub} placeholder="github.com/…" />
              </FieldRow>
              <FieldRow label="Showcase opt-in">
                <ShowcaseEdit
                  value={lead.showcase}
                  onChange={(v) => patch({ showcase: v })}
                />
              </FieldRow>
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-xs text-white/40">
                  {savedAt ? `Saved ${relativeTime(savedAt)}` : saving ? 'Saving…' : ' '}
                </span>
                <button
                  onClick={saveIdentity}
                  disabled={!identityDirty || saving}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </Section>

            <Section title="Sales pipeline">
              <FieldRow label="Status">
                <StatusSelect value={status} onChange={(v) => patch({ status_override: v })} />
                {lead.status_override && (
                  <button
                    onClick={() => patch({ status_override: null })}
                    className="ml-2 text-[11px] text-white/45 underline-offset-2 hover:text-white/75 hover:underline"
                  >
                    clear override
                  </button>
                )}
              </FieldRow>
              <FieldRow label="Package">
                <select
                  value={lead.package ?? ''}
                  onChange={(e) =>
                    patch({
                      package: (e.target.value || undefined) as 'basic' | 'monthly' | 'unlimited' | undefined,
                    })
                  }
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/90 outline-none transition-all focus:border-white/25"
                >
                  {PACKAGE_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0f0f12]">
                      {p.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Paid">
                <YesNoToggle
                  value={lead.paid}
                  onChange={(v) => patch({ paid: v })}
                  color="emerald"
                  withLabel
                />
              </FieldRow>
              <FieldRow label="Delivered">
                <YesNoToggle
                  value={lead.delivered}
                  onChange={(v) => patch({ delivered: v })}
                  color="sky"
                  withLabel
                />
              </FieldRow>
              <FieldRow label="Intake %">
                <IntakeNumberInput
                  value={lead.progress}
                  onChange={(v) => patch({ progress: v })}
                />
              </FieldRow>
            </Section>

            <Section title="Responses">
              <KV label="Target roles">
                {lead.role.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {lead.role.map((r) => (
                      <span key={r} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/85">
                        {r}
                      </span>
                    ))}
                  </div>
                ) : <Dim />}
              </KV>
              <KV label="Style">{lead.style ? <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/85">{lead.style}</span> : <Dim />}</KV>
              <KV label="Colors">
                {lead.colors.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.colors.map((c) => (
                      <span key={c} className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs text-white/85">
                        <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: c }} />
                        {c}
                      </span>
                    ))}
                  </div>
                ) : <Dim />}
              </KV>
              <KV label="Custom requests">
                {lead.custom_requests ? (
                  <div className="whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-sm leading-relaxed text-white/90">
                    {lead.custom_requests}
                  </div>
                ) : <Dim />}
              </KV>
            </Section>

            <Section title="Files">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <FileCard label="Resume" name={lead.resume_name} size={lead.resume_size} url={lead.resume_url} />
                <FileCard label="Headshot" name={lead.headshot_name} size={undefined} url={lead.headshot_url} />
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Internal notes">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={8}
                placeholder="Notes about this lead…"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/90 outline-none transition-all placeholder:text-white/30 focus:border-white/25"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  {savedAt ? `Saved ${relativeTime(savedAt)}` : saving ? 'Saving…' : ' '}
                </div>
                <button
                  onClick={saveNotes}
                  disabled={saving || notesDraft === lead.notes}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save note
                </button>
              </div>
            </Section>

            <Section title="Timeline">
              <TimelineRow label="Created" value={new Date(lead.created_at).toLocaleString()} />
              <TimelineRow label="Last updated" value={`${new Date(lead.updated_at).toLocaleString()} · ${relativeTime(lead.updated_at)}`} />
              <TimelineRow label="Last step" value={lead.last_step} />
              <TimelineRow label="Package" value={packageLabel(lead.package)} />
              {lead.paid_at ? <TimelineRow label="Paid" value={new Date(lead.paid_at).toLocaleString()} /> : null}
              {lead.delivered_at ? <TimelineRow label="Delivered" value={new Date(lead.delivered_at).toLocaleString()} /> : null}
            </Section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => !deleting && setConfirmDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] shadow-2xl"
            >
              <div className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef4444]/15 ring-1 ring-[#ef4444]/25">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Delete this lead?</h2>
                <p className="mt-1 text-sm text-white/60">
                  Permanently removes <span className="text-white/90">{lead.name || lead.email || lead.id}</span> and all their onboarding data. This can&rsquo;t be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-white/5 bg-white/[0.02] px-6 py-4">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={doDelete}
                  disabled={deleting}
                  className="rounded-lg bg-[#ef4444] px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-[#dc2626] disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------- Helpers -------------- */

function ShowcaseEdit({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const opt = (val: boolean | null, label: string, isOn: boolean, color?: string) => (
    <button
      onClick={() => onChange(val)}
      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-all ${
        isOn
          ? color === 'green'
            ? 'bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/25'
            : color === 'red'
            ? 'bg-[#ef4444]/15 text-[#f87171] ring-[#ef4444]/25'
            : 'bg-white/15 text-white ring-white/20'
          : 'bg-white/5 text-white/55 ring-white/10 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-1.5">
      {opt(true, 'Yes — feature', value === true, 'green')}
      {opt(false, 'No', value === false, 'red')}
      {opt(null, 'Not asked', value === null)}
    </div>
  );
}

function StatusPill({ status }: { status: FunnelStatus }) {
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

function StatusSelect({
  value,
  onChange,
}: {
  value: FunnelStatus;
  onChange: (v: FunnelStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FunnelStatus)}
      className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/90 outline-none transition-all focus:border-white/25"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s} className="bg-[#0f0f12]">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

function YesNoToggle({
  value,
  onChange,
  color,
  withLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color: 'emerald' | 'sky';
  withLabel?: boolean;
}) {
  const yesCls =
    color === 'emerald'
      ? 'bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/25'
      : 'bg-[#0ea5e9]/15 text-[#7dd3fc] ring-[#0ea5e9]/25';
  const yesDot = color === 'emerald' ? 'bg-[#22c55e]' : 'bg-[#0ea5e9]';
  return (
    <button
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-all ${
        value ? yesCls : 'bg-white/5 text-white/55 ring-white/10 hover:bg-white/10'
      }`}
      aria-pressed={value}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${value ? yesDot : 'bg-white/30'}`} />
      {value ? 'Yes' : 'No'}
      {withLabel && <span className="text-white/35">· tap to toggle</span>}
    </button>
  );
}

function IntakeNumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = Math.max(0, Math.min(100, parseInt(draft, 10) || 0));
          if (n !== value) onChange(n);
        }}
        className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
      />
      <span className="text-xs text-white/45">%</span>
    </div>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/90 outline-none transition-all placeholder:text-white/30 focus:border-white/25"
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
        {title}
      </div>
      <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">{children}</div>
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4 text-sm">
      <div className="text-xs text-white/45">{label}</div>
      <div className="flex min-w-0 items-center">{children}</div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-4 text-sm">
      <div className="pt-0.5 text-xs text-white/45">{label}</div>
      <div className="min-w-0 text-white/90">{children}</div>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="text-xs text-white/45">{label}</div>
      <div className="text-right text-xs text-white/85">{value}</div>
    </div>
  );
}

function Dim() {
  return <span className="text-white/30">—</span>;
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/75">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-white/55">{label}</div>
        <div className="truncate text-sm text-white/90">{name}</div>
      </div>
      {sizeStr && <div className="shrink-0 text-xs text-white/45">{sizeStr}</div>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-white/25 hover:text-white"
        >
          Open
        </a>
      )}
    </div>
  );
}
