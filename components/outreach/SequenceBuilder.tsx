'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Contact, Enrollment, fullName, pct, relTime, Sequence, SequenceStats, SequenceStep } from './types';

type Detail = { sequence: Sequence; enrollments: Enrollment[]; stats: SequenceStats };

export default function SequenceBuilder({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'edit' | 'enrollments'>('edit');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [status, setStatus] = useState<Sequence['status']>('draft');
  const [showEnrollPicker, setShowEnrollPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [testEmail, setTestEmail] = useState('');
  const [testStep, setTestStep] = useState(0);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/outreach/sequences/${id}`, { cache: 'no-store' }),
        fetch('/api/admin/outreach/contacts', { cache: 'no-store' }),
      ]);
      const j1 = await r1.json();
      const j2 = await r2.json();
      setDetail(j1);
      setContacts(j2.contacts ?? []);
      const s = j1.sequence as Sequence;
      setName(s.name);
      setDescription(s.description);
      setSteps(s.steps);
      setStatus(s.status);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const dirty = useMemo(() => {
    if (!detail) return false;
    const s = detail.sequence;
    return (
      name !== s.name ||
      description !== s.description ||
      status !== s.status ||
      JSON.stringify(steps) !== JSON.stringify(s.steps)
    );
  }, [detail, name, description, status, steps]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/outreach/sequences/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, description, status, steps }),
      });
      if (r.ok) {
        setSavedAt(Date.now());
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { id: cryptoId(), ord: prev.length, delay_days: 3, subject: '', body: '' }]);
  };
  const removeStep = (idx: number) => setSteps((prev) => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, patch: Partial<SequenceStep>) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const moveStep = (idx: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const cp = prev.slice();
      [cp[idx], cp[j]] = [cp[j], cp[idx]];
      return cp;
    });

  const remove = async () => {
    if (!confirm('Delete this sequence and unenroll all contacts?')) return;
    await fetch(`/api/admin/outreach/sequences/${id}`, { method: 'DELETE' });
    window.location.href = '/admin/outreach/sequences';
  };

  const enroll = async () => {
    const ids = Array.from(pickerSelected);
    if (!ids.length) return;
    await fetch(`/api/admin/outreach/sequences/${id}/enroll`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contact_ids: ids }),
    });
    setPickerSelected(new Set());
    setShowEnrollPicker(false);
    await load();
  };

  const updateEnrollment = async (en: Enrollment, newStatus: 'paused' | 'active' | 'stopped') => {
    await fetch(`/api/admin/outreach/sequences/${id}/enroll`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enrollment_id: en.id, status: newStatus }),
    });
    await load();
  };

  const sendTest = async () => {
    setTestMsg(null);
    if (!testEmail) return;
    const r = await fetch(`/api/admin/outreach/sequences/${id}/test-send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: testEmail, step_idx: testStep }),
    });
    const j = await r.json();
    if (r.ok) setTestMsg(`Test sent. Resend id: ${j.providerId ?? '—'}`);
    else setTestMsg(`Failed: ${j.error || r.statusText}`);
  };

  if (loading || !detail) return <main className="mx-auto max-w-[1200px] px-6 py-10 text-white/55">Loading…</main>;

  const enrollableContacts = contacts.filter((c) => !c.unsubscribed && !c.bounced && c.email);
  const filteredPicker = enrollableContacts.filter((c) => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return true;
    return [c.email, fullName(c), c.company, c.title].join(' ').toLowerCase().includes(q);
  });

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <Link href="/admin/outreach/sequences" className="text-xs text-white/45 hover:text-white/70">← Sequences</Link>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sequence name"
            className="mt-2 block w-full rounded-lg bg-transparent text-2xl font-semibold tracking-tight text-white outline-none placeholder:text-white/25 hover:bg-white/[0.03] focus:bg-white/[0.04] focus:px-2 focus:py-1"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="mt-1 block w-full rounded-lg bg-transparent text-sm text-white/70 outline-none placeholder:text-white/30 hover:bg-white/[0.03] focus:bg-white/[0.04] focus:px-2 focus:py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Sequence['status'])}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs outline-none"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <button onClick={remove} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 hover:border-[#ef4444]/40 hover:text-[#fca5a5]">Delete</button>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : dirty ? 'Save' : savedAt ? `Saved ${relTime(savedAt)}` : 'Saved'}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1">
        <button onClick={() => setTab('edit')} className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${tab === 'edit' ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>Steps</button>
        <button onClick={() => setTab('enrollments')} className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${tab === 'enrollments' ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>
          Enrolled · {detail.enrollments.length}
        </button>
        <div className="ml-auto grid grid-cols-3 gap-2 text-xs">
          <Stat label="Sent" value={detail.stats.sent} />
          <Stat label="Open rate" value={pct(detail.stats.open_rate)} />
          <Stat label="Reply rate" value={pct(detail.stats.reply_rate)} />
        </div>
      </div>

      {tab === 'edit' && (
        <>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold">{idx + 1}</span>
                  <div className="text-sm font-medium">Email {idx + 1}</div>
                  <div className="ml-2 flex items-center gap-1.5 text-xs text-white/55">
                    <span>Wait</span>
                    <input
                      type="number"
                      value={step.delay_days}
                      onChange={(e) => updateStep(idx, { delay_days: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-xs outline-none focus:border-white/25"
                    />
                    <span>day{step.delay_days === 1 ? '' : 's'} {idx === 0 ? 'after enrollment' : 'after previous'}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="rounded-md px-2 py-1 text-xs text-white/55 hover:bg-white/5 hover:text-white disabled:opacity-30">↑</button>
                    <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="rounded-md px-2 py-1 text-xs text-white/55 hover:bg-white/5 hover:text-white disabled:opacity-30">↓</button>
                    <button onClick={() => removeStep(idx)} className="rounded-md px-2 py-1 text-xs text-white/55 hover:bg-white/5 hover:text-[#fca5a5]">Remove</button>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <input
                    value={step.subject}
                    onChange={(e) => updateStep(idx, { subject: e.target.value })}
                    placeholder="Subject (you can use {{first_name}}, {{company}}, {{title}})"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
                  />
                  <textarea
                    value={step.body}
                    onChange={(e) => updateStep(idx, { body: e.target.value })}
                    placeholder={`Hi {{first_name}},\n\nI saw you're at {{company}} and wanted to reach out about…\n\nHirePage builds personal websites that help recruiters instantly understand your value.\n\nWorth a 10-min look?\n\nThanks,\nAndrew`}
                    rows={9}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-[ui-monospace,SFMono-Regular,Menlo,monospace] leading-relaxed outline-none focus:border-white/25"
                  />
                  <div className="text-xs text-white/40">
                    Tokens: <code>{`{{first_name}}`}</code> <code>{`{{last_name}}`}</code> <code>{`{{full_name}}`}</code> <code>{`{{company}}`}</code> <code>{`{{title}}`}</code> <code>{`{{linkedin}}`}</code> <code className="text-[#d8b4fe]">{`{{ai_intro}}`}</code>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addStep}
              className="w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.01] py-4 text-sm text-white/55 transition-all hover:border-white/30 hover:bg-white/[0.03] hover:text-white/85"
            >
              + Add another email
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="text-sm font-semibold">Send test</div>
            <p className="mt-1 text-xs text-white/55">Send the chosen step to your own email for proofing. Personalization tokens are filled with placeholder values.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@hirepage.app"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
              />
              <select
                value={testStep}
                onChange={(e) => setTestStep(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-sm outline-none focus:border-white/25"
              >
                {steps.map((_, i) => <option key={i} value={i}>Step {i + 1}</option>)}
              </select>
              <button onClick={sendTest} disabled={!testEmail || steps.length === 0} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">
                Send test
              </button>
              {testMsg && <div className="text-xs text-white/65">{testMsg}</div>}
            </div>
          </div>
        </>
      )}

      {tab === 'enrollments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/65">{detail.enrollments.length} enrolled</div>
            <button onClick={() => setShowEnrollPicker(true)} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90">
              Enroll contacts
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-left text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Step</th>
                  <th className="px-5 py-3">Next send</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {detail.enrollments.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-white/45">Nobody enrolled yet.</td></tr>
                )}
                {detail.enrollments.map((en) => {
                  const c = contacts.find((c) => c.id === en.contact_id);
                  return (
                    <tr key={en.id} className="border-b border-white/[0.04]">
                      <td className="px-5 py-3">
                        {c ? (
                          <Link href={`/admin/outreach/contacts/${c.id}`} className="block">
                            <div className="font-medium text-white/95">{fullName(c) || c.email}</div>
                            <div className="text-xs text-white/55">{c.email}</div>
                          </Link>
                        ) : <span className="text-white/55">contact deleted</span>}
                      </td>
                      <td className="px-5 py-3 text-xs"><EnrollmentPill status={en.status} /></td>
                      <td className="px-5 py-3 text-white/70">{en.current_step + 1} / {detail.sequence.steps.length}</td>
                      <td className="px-5 py-3 text-xs text-white/55">
                        {en.next_send_at && en.status === 'active' ? new Date(en.next_send_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {en.status === 'active' && <button onClick={() => updateEnrollment(en, 'paused')} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">Pause</button>}
                          {en.status === 'paused' && <button onClick={() => updateEnrollment(en, 'active')} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">Resume</button>}
                          {(en.status === 'active' || en.status === 'paused') && <button onClick={() => updateEnrollment(en, 'stopped')} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65 hover:text-[#fca5a5]">Stop</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEnrollPicker && (
        <div onClick={() => setShowEnrollPicker(false)} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="text-sm font-semibold">Enroll contacts</div>
              <button onClick={() => setShowEnrollPicker(false)} className="text-white/55 hover:text-white">×</button>
            </div>
            <div className="border-b border-white/5 p-3">
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search contacts…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredPicker.length === 0 ? (
                <div className="p-10 text-center text-sm text-white/45">No matching contacts.</div>
              ) : filteredPicker.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 border-b border-white/[0.03] px-5 py-2.5 hover:bg-white/[0.02]">
                  <input
                    type="checkbox"
                    checked={pickerSelected.has(c.id)}
                    onChange={() => {
                      const s = new Set(pickerSelected);
                      if (s.has(c.id)) s.delete(c.id); else s.add(c.id);
                      setPickerSelected(s);
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{fullName(c) || c.email}</div>
                    <div className="text-xs text-white/55">{c.email}{c.company ? ` · ${c.company}` : ''}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/5 px-5 py-3">
              <div className="text-xs text-white/55">{pickerSelected.size} selected</div>
              <div className="flex gap-2">
                <button onClick={() => setShowEnrollPicker(false)} className="rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">Cancel</button>
                <button onClick={enroll} disabled={pickerSelected.size === 0} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">
                  Enroll {pickerSelected.size}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.025] px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function EnrollmentPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    active: ['#22c55e', 'Active'],
    paused: ['#f59e0b', 'Paused'],
    completed: ['#0ea5e9', 'Completed'],
    stopped: ['#94a3b8', 'Stopped'],
    bounced: ['#ef4444', 'Bounced'],
    unsubscribed: ['#ef4444', 'Unsubscribed'],
  };
  const [color, label] = map[status] ?? ['#94a3b8', status];
  return <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: `${color}22`, color }}>{label}</span>;
}

function cryptoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
