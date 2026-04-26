'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ActivityEvent, Contact, fullName, relTime } from './types';
import Composer from './Composer';

type Detail = { contact: Contact; events: ActivityEvent[] };

export default function ContactDetailView({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null);
  const [stats, setStats] = useState<{ gmail_connected: boolean; gmail_email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/outreach/contacts/${id}`, { cache: 'no-store' }),
        fetch('/api/admin/outreach/stats', { cache: 'no-store' }),
      ]);
      const j1 = await r1.json();
      const j2 = await r2.json();
      setData({ contact: j1.contact, events: j1.events ?? [] });
      setStats({ gmail_connected: !!j2.gmail_connected, gmail_email: j2.gmail_email ?? null });
      setNotesDraft(j1.contact?.notes ?? '');
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading || !data) return <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-10 text-white/55">Loading…</main>;
  const { contact, events } = data;

  const generateIntro = async () => {
    setAiBusy(true); setAiError(null);
    try {
      const r = await fetch('/api/admin/outreach/ai/intro', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contact_id: contact.id, extra_context: aiContext, persist: true }),
      });
      const j = await r.json();
      if (!r.ok) { setAiError(j.error || 'failed'); return; }
      await load();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'failed');
    } finally {
      setAiBusy(false);
    }
  };

  const saveNotes = async () => {
    await fetch(`/api/admin/outreach/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setEditingNotes(false);
    await load();
  };

  const remove = async () => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/admin/outreach/contacts/${contact.id}`, { method: 'DELETE' });
    window.location.href = '/admin/outreach/contacts';
  };

  const toggleUnsubscribed = async () => {
    await fetch(`/api/admin/outreach/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ unsubscribed: !contact.unsubscribed }),
    });
    await load();
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/outreach/contacts" className="text-xs text-white/45 hover:text-white/70">← Contacts</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{fullName(contact) || contact.email || 'Unnamed contact'}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
            {contact.email && <span>{contact.email}</span>}
            {contact.title && <span className="text-white/40">·</span>}
            {contact.title && <span>{contact.title}</span>}
            {contact.company && <span className="text-white/40">·</span>}
            {contact.company && <span>{contact.company}</span>}
            {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-[#7dd3fc] hover:underline">LinkedIn ↗</a>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {contact.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/65">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompose(true)}
            disabled={!contact.email || contact.unsubscribed || contact.bounced}
            className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-40"
          >
            Compose &amp; send
          </button>
          <button
            onClick={toggleUnsubscribed}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 hover:bg-white/10"
          >
            {contact.unsubscribed ? 'Mark sendable' : 'Mark unsubscribed'}
          </button>
          <button onClick={remove} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition-all hover:border-[#ef4444]/40 hover:text-[#fca5a5]">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">AI personalized intro</div>
                <p className="mt-0.5 text-xs text-white/55">
                  Saved as <code className="text-white/75">{`{{ai_intro}}`}</code> on this contact. Reference it in any email body.
                </p>
              </div>
              <button onClick={() => setAiOpen((v) => !v)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">
                {aiOpen ? 'Hide' : 'Open'}
              </button>
            </div>
            {aiOpen && (
              <div className="mt-3 space-y-3">
                {contact.custom?.ai_intro && (
                  <div className="rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/[0.05] p-3 text-sm">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#86efac]">Current intro</div>
                    <div className="mt-1 text-white/90 whitespace-pre-wrap">{contact.custom.ai_intro}</div>
                  </div>
                )}
                <textarea
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  rows={4}
                  placeholder="(optional) Paste their LinkedIn About / headline / a recent post for sharper personalization."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-sm outline-none focus:border-white/25"
                />
                <div className="flex items-center gap-2">
                  <button onClick={generateIntro} disabled={aiBusy} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">
                    {aiBusy ? 'Generating…' : contact.custom?.ai_intro ? 'Regenerate' : 'Generate intro'}
                  </button>
                  {aiError && <span className="text-xs text-[#fca5a5]">{aiError}</span>}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="text-sm font-semibold">Activity</div>
            <ol className="mt-3 space-y-2">
              {events.length === 0 && <li className="text-xs text-white/45">No activity yet.</li>}
              {events.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3 text-sm">
                  <EventDot type={ev.type} />
                  <div className="flex-1">
                    <div className="font-medium text-white/90">{prettyType(ev.type)}</div>
                    <div className="text-xs text-white/55">
                      {relTime(ev.ts)}
                      {ev.meta && (ev.meta as any).subject && ` · "${String((ev.meta as any).subject).slice(0, 80)}"`}
                      {ev.meta && (ev.meta as any).error && ` · ${String((ev.meta as any).error).slice(0, 100)}`}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Notes</div>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)} className="text-xs text-white/55 hover:text-white">Edit</button>
              )}
            </div>
            {editingNotes ? (
              <>
                <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-sm outline-none focus:border-white/25" />
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => { setEditingNotes(false); setNotesDraft(contact.notes); }} className="rounded-lg px-2 py-1 text-xs text-white/55 hover:text-white">Cancel</button>
                  <button onClick={saveNotes} className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-black hover:bg-white/90">Save</button>
                </div>
              </>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{contact.notes || <span className="text-white/35">No notes yet.</span>}</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="text-sm font-semibold">Status</div>
            <div className="mt-2 space-y-1.5 text-xs">
              <KV k="Source" v={contact.source} />
              <KV k="Created" v={new Date(contact.created_at).toLocaleString()} />
              <KV k="Updated" v={new Date(contact.updated_at).toLocaleString()} />
              <KV k="Unsubscribed" v={contact.unsubscribed ? 'Yes' : 'No'} />
              <KV k="Bounced" v={contact.bounced ? 'Yes' : 'No'} />
            </div>
          </section>
        </aside>
      </div>

      {showCompose && (
        <Composer
          contacts={[contact]}
          fromEmail={stats?.gmail_email ?? null}
          gmailConnected={!!stats?.gmail_connected}
          onClose={() => setShowCompose(false)}
          onSent={() => load()}
        />
      )}
    </main>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-white/65">
      <span className="text-white/40">{k}</span>
      <span className="text-right text-white/80">{v}</span>
    </div>
  );
}

function EventDot({ type }: { type: string }) {
  const color =
    type === 'sent' ? '#0ea5e9' :
    type === 'replied' ? '#f59e0b' :
    type === 'bounced' ? '#ef4444' :
    type === 'unsubscribed' ? '#ef4444' :
    type === 'note' ? '#94a3b8' :
    '#64748b';
  return <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }} />;
}

function prettyType(t: string): string {
  if (t === 'sent') return 'Email sent';
  if (t === 'replied') return 'Replied';
  if (t === 'bounced') return 'Bounced';
  if (t === 'unsubscribed') return 'Unsubscribed';
  if (t === 'note') return 'Note';
  return t.charAt(0).toUpperCase() + t.slice(1);
}
