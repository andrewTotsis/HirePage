'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Template, relTime } from './types';

export default function TemplatesView() {
  const [list, setList] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch('/api/admin/outreach/templates', { cache: 'no-store' });
      const j = await r.json();
      setList(j.templates ?? []);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const r = await fetch('/api/admin/outreach/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'New template', subject: '', body: '' }),
    });
    const j = await r.json();
    setEditing(j.template);
    await load();
  };

  const save = async () => {
    if (!editing) return;
    await fetch(`/api/admin/outreach/templates/${editing.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: editing.name, subject: editing.subject, body: editing.body }),
    });
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/admin/outreach/templates/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link href="/admin/outreach" className="text-xs text-white/45 hover:text-white/70">← Outreach</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-white/55">Reusable subject + body. Copy them into any sequence step.</p>
        </div>
        <button onClick={create} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90">
          New template
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center text-white/45">Loading…</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <div className="text-base font-semibold text-white/85">No templates yet</div>
          <div className="mx-auto mt-1 max-w-sm text-sm text-white/55">Save bits of copy you reuse — intros, follow-ups, breakups.</div>
          <button onClick={create} className="mt-3 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90">Create template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="font-medium text-white/95">{t.name}</div>
                <div className="text-xs text-white/45">{relTime(t.updated_at)}</div>
              </div>
              <div className="text-xs text-white/55">{t.subject || <span className="text-white/30">(no subject)</span>}</div>
              <div className="mt-2 line-clamp-3 text-xs text-white/55 whitespace-pre-wrap">{t.body || <span className="text-white/30">(empty)</span>}</div>
              <div className="mt-3 flex justify-end gap-1.5">
                <button onClick={() => setEditing(t)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">Edit</button>
                <button onClick={() => remove(t.id)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65 hover:text-[#fca5a5]">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="bg-transparent text-sm font-semibold outline-none"
              />
              <button onClick={() => setEditing(null)} className="text-white/55 hover:text-white">×</button>
            </div>
            <div className="space-y-3 p-5">
              <input
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                placeholder="Subject — supports {{first_name}} {{company}}"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
              />
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                rows={12}
                placeholder="Body…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-[ui-monospace,SFMono-Regular,Menlo,monospace] leading-relaxed outline-none focus:border-white/25"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-white/5 px-5 py-3">
              <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">Cancel</button>
              <button onClick={save} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
