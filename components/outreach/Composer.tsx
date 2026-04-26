'use client';

import { useEffect, useMemo, useState } from 'react';
import { Contact, fullName, Template } from './types';

type Props = {
  contacts: Contact[];
  fromEmail: string | null;
  gmailConnected: boolean;
  initialSubject?: string;
  initialBody?: string;
  onClose: () => void;
  onSent?: (summary: { sent: number; skipped: number; errors: number }) => void;
};

function personalize(template: string, contact: Contact): string {
  const map: Record<string, string> = {
    first_name: contact.first_name || (contact.email.split('@')[0] || 'there'),
    last_name: contact.last_name || '',
    full_name: fullName(contact) || (contact.email.split('@')[0] || 'there'),
    email: contact.email || '',
    company: contact.company || '',
    title: contact.title || '',
    linkedin: contact.linkedin || '',
    ...Object.fromEntries(Object.entries(contact.custom || {})),
  };
  return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, k) => map[String(k).toLowerCase()] ?? '');
}

export default function Composer({ contacts, fromEmail, gmailConnected, initialSubject, initialBody, onClose, onSent }: Props) {
  const [subject, setSubject] = useState(initialSubject ?? '');
  const [body, setBody] = useState(initialBody ?? '');
  const [recipients, setRecipients] = useState<Contact[]>(contacts);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number; errors: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null); // contact id currently generating

  useEffect(() => {
    fetch('/api/admin/outreach/templates', { cache: 'no-store' }).then((r) => r.json()).then((j) => setTemplates(j.templates ?? [])).catch(() => {});
  }, []);

  const sendable = useMemo(() => recipients.filter((c) => c.email && !c.unsubscribed && !c.bounced), [recipients]);
  const preview = sendable[previewIdx] ?? sendable[0] ?? null;

  const applyTemplate = (t: Template) => {
    setSubject(t.subject);
    setBody(t.body);
  };

  const removeContact = (id: string) => {
    setRecipients((r) => r.filter((c) => c.id !== id));
    if (previewIdx >= recipients.length - 1) setPreviewIdx(0);
  };

  const generateAI = async (contact: Contact) => {
    setAiBusy(contact.id);
    try {
      const r = await fetch('/api/admin/outreach/ai/intro', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contact_id: contact.id, persist: true }),
      });
      const j = await r.json();
      if (r.ok) {
        // refresh contact in local list
        setRecipients((rs) =>
          rs.map((c) => (c.id === contact.id ? { ...c, custom: { ...(c.custom ?? {}), ai_intro: j.intro } } : c)),
        );
      }
    } finally {
      setAiBusy(null);
    }
  };

  const send = async () => {
    if (!subject.trim() || !body.trim() || sendable.length === 0) return;
    if (!gmailConnected) {
      setError('Connect Gmail in Settings before sending.');
      return;
    }
    if (!confirm(`Send this email to ${sendable.length} contact${sendable.length === 1 ? '' : 's'} from ${fromEmail}?`)) return;
    setSending(true); setError(null);
    try {
      const r = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          contact_ids: sendable.map((c) => c.id),
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.error || 'send failed');
      } else {
        setResult({ sent: j.sent, skipped: j.skipped, errors: j.errors });
        onSent?.({ sent: j.sent, skipped: j.skipped, errors: j.errors });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'send failed');
    } finally {
      setSending(false);
    }
  };

  const previewSubject = preview ? personalize(subject, preview) : subject;
  const previewBody = preview ? personalize(body, preview) : body;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div>
            <div className="text-sm font-semibold">Compose outreach</div>
            <div className="text-xs text-white/55">
              {gmailConnected
                ? <>Sending from <span className="font-mono text-white/80">{fromEmail}</span> via Gmail</>
                : <span className="text-[#fbbf24]">Gmail not connected — connect in Settings to send.</span>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-white/55 hover:bg-white/5 hover:text-white">×</button>
        </div>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
          {/* Editor + preview */}
          <div className="flex flex-col overflow-hidden border-r border-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 text-xs">
              <span className="text-white/45">Template:</span>
              <select
                onChange={(e) => {
                  const t = templates.find((x) => x.id === e.target.value);
                  if (t) applyTemplate(t);
                  e.currentTarget.value = '';
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs outline-none focus:border-white/25"
                defaultValue=""
              >
                <option value="">— pick a template —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="ml-auto text-white/40">
                Tokens: <code>{`{{first_name}}`}</code> <code>{`{{company}}`}</code> <code>{`{{title}}`}</code> <code className="text-[#d8b4fe]">{`{{ai_intro}}`}</code>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/25"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Hi {{first_name}},\n\n{{ai_intro}}\n\nI run HirePage — we turn resumes into clean recruiter-friendly personal websites in 24 hours. Thought it might be useful for you / your team.\n\nWorth a quick look?\n\nThanks,\nAndrew`}
                rows={14}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-[ui-monospace,SFMono-Regular,Menlo,monospace] leading-relaxed outline-none focus:border-white/25"
              />

              {preview && (
                <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
                      Preview · {fullName(preview) || preview.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
                        disabled={previewIdx === 0}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 hover:bg-white/10 disabled:opacity-30"
                      >‹</button>
                      <span className="text-white/55">{previewIdx + 1} / {sendable.length}</span>
                      <button
                        onClick={() => setPreviewIdx((i) => Math.min(sendable.length - 1, i + 1))}
                        disabled={previewIdx >= sendable.length - 1}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 hover:bg-white/10 disabled:opacity-30"
                      >›</button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-medium text-white/90">{previewSubject || <span className="text-white/30">(no subject)</span>}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{previewBody || <span className="text-white/30">(empty body)</span>}</div>
                  {body.includes('{{ai_intro}}') && !preview.custom?.ai_intro && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#a855f7]/30 bg-[#a855f7]/[0.07] px-3 py-2 text-xs">
                      <span className="text-[#d8b4fe]">No AI intro yet for this contact.</span>
                      <button
                        onClick={() => generateAI(preview)}
                        disabled={aiBusy === preview.id}
                        className="ml-auto rounded-md bg-[#a855f7]/30 px-2 py-0.5 text-[10px] text-white hover:bg-[#a855f7]/50 disabled:opacity-50"
                      >
                        {aiBusy === preview.id ? 'Generating…' : '✨ Generate'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recipients */}
          <div className="flex flex-col overflow-hidden bg-white/[0.015]">
            <div className="border-b border-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              Recipients · {sendable.length} sendable / {recipients.length} selected
            </div>
            <div className="flex-1 overflow-y-auto">
              {recipients.length === 0 && <div className="p-6 text-center text-sm text-white/45">No contacts selected.</div>}
              {recipients.map((c) => {
                const sendable = !!c.email && !c.unsubscribed && !c.bounced;
                return (
                  <div key={c.id} className="flex items-center gap-3 border-b border-white/[0.03] px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-white/90">{fullName(c) || c.email}</div>
                      <div className="truncate text-xs text-white/55">{c.email || c.linkedin || '—'}</div>
                      {!sendable && <div className="text-[10px] text-[#fca5a5]">{!c.email ? 'no email' : c.unsubscribed ? 'unsubscribed' : 'bounced'}</div>}
                    </div>
                    <button onClick={() => removeContact(c.id)} className="text-xs text-white/40 hover:text-white/80">×</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-3">
          <div className="text-xs text-white/55">
            {error && <span className="text-[#fca5a5]">{error}</span>}
            {result && !error && <span className="text-[#86efac]">Sent {result.sent} · skipped {result.skipped}{result.errors ? ` · errors ${result.errors}` : ''}</span>}
            {!error && !result && (
              <>
                <span>{sendable.length} ready to send</span>
                {recipients.length - sendable.length > 0 && <span className="text-white/35"> · {recipients.length - sendable.length} skipped</span>}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-white/65 hover:text-white">
              {result ? 'Close' : 'Cancel'}
            </button>
            {!result && (
              <button
                onClick={send}
                disabled={sending || !gmailConnected || !subject.trim() || !body.trim() || sendable.length === 0}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-40"
              >
                {sending ? 'Sending…' : `Send to ${sendable.length}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
