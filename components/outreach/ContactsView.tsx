'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Contact, fullName, relTime } from './types';
import Composer from './Composer';

type Status = 'all' | 'active' | 'unsubscribed' | 'bounced';

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<{ gmail_connected: boolean; gmail_email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState<'none' | 'single' | 'bulk'>('none');
  const [showCompose, setShowCompose] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const reload = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/outreach/contacts', { cache: 'no-store' }),
        fetch('/api/admin/outreach/stats', { cache: 'no-store' }),
      ]);
      const j1 = await r1.json();
      const j2 = await r2.json();
      setContacts(j1.contacts ?? []);
      setStats({ gmail_connected: !!j2.gmail_connected, gmail_email: j2.gmail_email ?? null });
    } catch {}
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const c of contacts) for (const t of c.tags) s.add(t);
    return Array.from(s).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (status === 'active' && (c.unsubscribed || c.bounced)) return false;
      if (status === 'unsubscribed' && !c.unsubscribed) return false;
      if (status === 'bounced' && !c.bounced) return false;
      if (tagFilter && !c.tags.includes(tagFilter)) return false;
      if (!q) return true;
      const hay = [c.email, fullName(c), c.company, c.title, c.linkedin, c.tags.join(' ')].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, query, status, tagFilter]);

  const selectedContacts = useMemo(() => contacts.filter((c) => selected.has(c.id)), [contacts, selected]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} contact${selected.size === 1 ? '' : 's'}?`)) return;
    await Promise.all(Array.from(selected).map((id) => fetch(`/api/admin/outreach/contacts/${id}`, { method: 'DELETE' })));
    setSelected(new Set());
    reload();
  };

  const bulkAI = async () => {
    setAiBusy(true);
    setAiSummary(null);
    try {
      const r = await fetch('/api/admin/outreach/ai/intro/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contact_ids: Array.from(selected), overwrite: false }),
      });
      const j = await r.json();
      if (!r.ok) setAiSummary(j.error || 'Failed');
      else setAiSummary(`Generated ${j.generated} · skipped ${j.skipped} · errors ${j.errors}`);
      await reload();
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] px-6 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/outreach" className="text-xs text-white/45 hover:text-white/70">← Outreach</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-white/55">
            {contacts.length.toLocaleString()} total · {contacts.filter((c) => !c.unsubscribed && !c.bounced && !!c.email).length.toLocaleString()} sendable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd('bulk')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10">
            Paste / import
          </button>
          <button onClick={() => setShowAdd('single')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10">
            Add contact
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company, title…"
            className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none transition-all placeholder:text-white/35 focus:border-white/25"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-white/25">
            <option value="all">All</option>
            <option value="active">Sendable</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          {allTags.length > 0 && (
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none focus:border-white/25">
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <div className="ml-auto text-xs text-white/45">{filtered.length} shown · {selected.size} selected</div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-2 text-sm">
            <span className="text-white/65">{selected.size} selected</span>
            <button
              onClick={() => setShowCompose(true)}
              className="ml-2 rounded-lg bg-white px-3 py-1 text-xs font-medium text-black hover:bg-white/90"
            >
              Compose &amp; send
            </button>
            <button
              onClick={bulkAI}
              disabled={aiBusy}
              className="rounded-lg border border-[#a855f7]/40 bg-[#a855f7]/10 px-3 py-1 text-xs text-[#d8b4fe] hover:bg-[#a855f7]/20 disabled:opacity-50"
              title="Generate AI personalized intros for selected contacts"
            >
              {aiBusy ? 'Generating…' : '✨ AI intros'}
            </button>
            <button
              onClick={bulkDelete}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 transition-all hover:border-[#ef4444]/40 hover:text-[#fca5a5]"
            >
              Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-1 text-xs text-white/45 hover:text-white/75">Clear</button>
            {aiSummary && <span className="ml-2 text-xs text-white/65">{aiSummary}</span>}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center text-white/45">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
            <div className="text-base font-semibold text-white/85">No contacts yet</div>
            <div className="max-w-sm text-sm text-white/55">Add a single contact or paste a list of emails / LinkedIn URLs to get started.</div>
            <button onClick={() => setShowAdd('bulk')} className="mt-3 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90">
              Paste a list
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-left text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="cursor-pointer" />
                  </th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Company / title</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} onClick={(e) => e.stopPropagation()} className="cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/outreach/contacts/${c.id}`} className="block">
                        <div className="font-medium text-white/95">{fullName(c) || c.email || '—'}</div>
                        <div className="text-xs text-white/55">{c.email || c.linkedin || '—'}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      <div>{c.company || '—'}</div>
                      <div className="text-xs text-white/45">{c.title || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/65">{t}</span>
                        ))}
                        {c.tags.length > 3 && <span className="text-[10px] text-white/40">+{c.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge contact={c} />
                    </td>
                    <td className="px-4 py-3 text-xs text-white/55">{relTime(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd === 'single' && <AddSingleModal onClose={() => setShowAdd('none')} onAdded={reload} />}
        {showAdd === 'bulk' && <BulkImportModal onClose={() => setShowAdd('none')} onDone={reload} />}
      </AnimatePresence>

      {showCompose && (
        <Composer
          contacts={selectedContacts}
          fromEmail={stats?.gmail_email ?? null}
          gmailConnected={!!stats?.gmail_connected}
          onClose={() => setShowCompose(false)}
          onSent={() => { setSelected(new Set()); reload(); }}
        />
      )}
    </main>
  );
}

function StatusBadge({ contact }: { contact: Contact }) {
  if (contact.unsubscribed) return <span className="rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[10px] text-[#fca5a5]">Unsubscribed</span>;
  if (contact.bounced) return <span className="rounded-full bg-[#f59e0b]/15 px-2 py-0.5 text-[10px] text-[#fbbf24]">Bounced</span>;
  return <span className="rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[10px] text-[#86efac]">Sendable</span>;
}

function Modal({ children, onClose, title, footer }: { children: React.ReactNode; onClose: () => void; title: string; footer?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-white/55 hover:bg-white/5 hover:text-white">×</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/5 px-5 py-3">{footer}</div>}
      </motion.div>
    </motion.div>
  );
}

function AddSingleModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', linkedin: '', company: '', title: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    setSaving(true); setErr(null);
    try {
      const r = await fetch('/api/admin/outreach/contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'failed');
      onAdded();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  };
  const inp = 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25';
  return (
    <Modal
      title="Add contact"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">Cancel</button>
          <button onClick={submit} disabled={saving} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save contact'}
          </button>
        </>
      }
    >
      {err && <div className="mb-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#fca5a5]">{err}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormRow label="First name"><input className={inp} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></FormRow>
        <FormRow label="Last name"><input className={inp} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></FormRow>
        <FormRow label="Email" full><input className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" /></FormRow>
        <FormRow label="LinkedIn URL" full><input className={inp} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/…" /></FormRow>
        <FormRow label="Company"><input className={inp} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></FormRow>
        <FormRow label="Title"><input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormRow>
        <FormRow label="Tags (comma separated)" full><input className={inp} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="bdr, finance, q1-2026" /></FormRow>
      </div>
    </Modal>
  );
}

function FormRow({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</div>
      {children}
    </div>
  );
}

function BulkImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const submit = async () => {
    setBusy(true); setSummary(null);
    try {
      const r = await fetch('/api/admin/outreach/contacts/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      setSummary(j.summary);
      onDone();
    } finally { setBusy(false); }
  };
  return (
    <Modal
      title="Paste contacts"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">Close</button>
          <button onClick={submit} disabled={busy || !text.trim()} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">
            {busy ? 'Importing…' : 'Import'}
          </button>
        </>
      }
    >
      <p className="mb-3 text-xs text-white/55">
        One per line, or CSV with a header row. Supported columns: <code className="text-white/75">email, first_name, last_name, linkedin, company, title</code>. Mixed lines (just emails, just LinkedIn URLs, or both) are auto-detected.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={`alex@example.com
jane@example.com
https://linkedin.com/in/john-doe
email,first_name,last_name,company,title
sara@acme.com,Sara,Lee,Acme,VP Marketing`}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 font-mono text-xs outline-none focus:border-white/25"
      />
      {summary && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/75">
          Added {summary.added} · Updated {summary.updated} · Skipped {summary.skipped} · Invalid {summary.invalid}
        </div>
      )}
    </Modal>
  );
}
