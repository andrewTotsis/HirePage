'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TEMPLATES = [
  {
    id: 'cold-3step',
    name: 'Cold outreach · 3 emails',
    description: 'Intro, value follow-up, breakup. Good first sequence.',
    steps: [
      { delay_days: 0, subject: 'quick idea for {{company}}', body: `Hi {{first_name}},\n\nI saw you're {{title}} at {{company}} and wanted to share a quick idea.\n\nWe build done-for-you personal websites for ambitious students and graduates — clean, recruiter-friendly, shipped in 24 hours. Wondering if it could be useful for your team's outreach.\n\nWorth a 10-min look?\n\nThanks,\nAndrew\nHirePage` },
      { delay_days: 3, subject: 'following up — HirePage for {{company}}', body: `Hi {{first_name}},\n\nFloating this back up. Happy to send a couple of examples we've shipped recently.\n\nIf this isn't on your radar right now, no worries — just let me know and I won't keep nudging.\n\nAndrew` },
      { delay_days: 5, subject: 'closing the loop', body: `Hi {{first_name}},\n\nThis is my last note in this thread. If timing's off, totally fine — feel free to ping me whenever.\n\nAll the best,\nAndrew` },
    ],
  },
  {
    id: 'linkedin-followup',
    name: 'LinkedIn → email follow-up',
    description: 'Use after a LinkedIn message, when they accept the connect but don\'t reply.',
    steps: [
      { delay_days: 0, subject: 'following up from LinkedIn', body: `Hi {{first_name}},\n\nThanks for connecting. Wanted to reach out properly here — I think what we're building at HirePage could be useful for {{company}}.\n\nQuick context: we turn resumes into professional personal websites for students and graduates. Most clients ship within 24 hours.\n\nOpen to a quick chat?\n\nAndrew` },
      { delay_days: 4, subject: 're: linkedin connect', body: `Hi {{first_name}},\n\nQuick bump. Happy to share examples or skip if not relevant — let me know.\n\nAndrew` },
    ],
  },
  {
    id: 'blank',
    name: 'Blank sequence',
    description: 'One empty step. Build it from scratch.',
    steps: [{ delay_days: 0, subject: '', body: '' }],
  },
];

export default function NewSequenceForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string>('cold-3step');
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await fetch('/api/admin/outreach/sequences', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const j = await r.json();
      const seqId = j.sequence?.id;
      if (!seqId) throw new Error('no id');

      const tmpl = TEMPLATES.find((t) => t.id === picked);
      if (tmpl && tmpl.steps.length > 0) {
        await fetch(`/api/admin/outreach/sequences/${seqId}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            steps: tmpl.steps.map((s, i) => ({
              id: cryptoId(),
              ord: i,
              delay_days: s.delay_days,
              subject: s.subject,
              body: s.body,
            })),
          }),
        });
      }
      router.push(`/admin/outreach/sequences/${seqId}`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-24 pt-10">
      <Link href="/admin/outreach/sequences" className="text-xs text-white/45 hover:text-white/70">← Sequences</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">New sequence</h1>
      <p className="mt-1 text-sm text-white/55">Pick a starter and tweak the copy. You can edit everything after.</p>

      <div className="mt-6 space-y-3">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Q1 2026 outbound — finance interns"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
            autoFocus
          />
        </div>

        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Starter template</div>
          <div className="space-y-2">
            {TEMPLATES.map((t) => {
              const active = picked === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPicked(t.id)}
                  className={`block w-full rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-white/30 bg-white/[0.06]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-white/45">{t.steps.length} step{t.steps.length === 1 ? '' : 's'}</div>
                  </div>
                  <div className="mt-1 text-sm text-white/55">{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/outreach/sequences" className="rounded-lg px-3 py-2 text-sm text-white/65 hover:text-white">Cancel</Link>
        <button
          onClick={create}
          disabled={!name.trim() || creating}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create sequence'}
        </button>
      </div>
    </main>
  );
}

function cryptoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
