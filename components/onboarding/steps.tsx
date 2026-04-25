'use client';

import { motion } from 'framer-motion';
import { ChangeEvent, DragEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import StepShell from './StepShell';
import { OnboardingData, PackageId, StylePref, UploadedFile } from './types';

type StepProps = {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  next: () => void;
  back: () => void;
  canAdvance: boolean;
};

/* ---------- shared input styles ---------- */

const inputCls =
  'w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-lg text-ink placeholder-ink/35 outline-none transition-all focus:border-black/30 focus:ring-4 focus:ring-black/5';

/* ---------- Welcome ---------- */

export function WelcomeStep({ next }: StepProps) {
  return (
    <StepShell
      eyebrow="Step 1"
      title={
        <>
          Let&rsquo;s build your <span className="text-gradient">HirePage</span>
        </>
      }
      subtitle="A few quick questions. Takes about 2 minutes. Press Enter anytime to keep going."
    >
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <button onClick={next} className="btn-primary justify-center" autoFocus>
          <span>Get Started</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-2 text-sm text-ink/65 sm:grid-cols-3">
        <li className="flex items-center gap-2"><Dot /> Your info stays private</li>
        <li className="flex items-center gap-2"><Dot /> Auto-saves as you go</li>
        <li className="flex items-center gap-2"><Dot /> Site shipped in 24 hours</li>
      </ul>
    </StepShell>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />;
}

/* ---------- Text input steps ---------- */

export function NameStep({ data, update, next, canAdvance }: StepProps) {
  return (
    <StepShell
      eyebrow="About you"
      title="What's your full name?"
      subtitle="We'll use this as the heading of your site."
    >
      <AutoInput
        value={data.fullName}
        onChange={(v) => update('fullName', v)}
        onEnter={() => canAdvance && next()}
        placeholder="Alex Parker"
        autoComplete="name"
      />
    </StepShell>
  );
}

export function EmailStep({ data, update, next, canAdvance }: StepProps) {
  return (
    <StepShell
      eyebrow="About you"
      title="What email should we use?"
      subtitle="We'll send your HirePage link here."
    >
      <AutoInput
        type="email"
        value={data.email}
        onChange={(v) => update('email', v)}
        onEnter={() => canAdvance && next()}
        placeholder="you@example.com"
        autoComplete="email"
      />
    </StepShell>
  );
}

export function PhoneStep({ data, update, next }: StepProps) {
  const countries = ['+1', '+44', '+61', '+91', '+33', '+49', '+81', '+86'];
  return (
    <StepShell
      eyebrow="About you"
      title="Your phone number"
      subtitle="Optional, but we'll text you if we need something."
    >
      <div className="flex gap-2">
        <select
          value={data.phoneCountry}
          onChange={(e) => update('phoneCountry', e.target.value)}
          className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-lg text-ink outline-none transition-all focus:border-black/30 focus:ring-4 focus:ring-black/5"
          aria-label="Country code"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <AutoInput
          type="tel"
          value={data.phoneNumber}
          onChange={(v) => update('phoneNumber', v.replace(/[^0-9 ()\-]/g, ''))}
          onEnter={next}
          placeholder="(555) 123-4567"
          autoComplete="tel"
        />
      </div>
    </StepShell>
  );
}

/* ---------- Roles (tags) ---------- */

export function RolesStep({ data, update, next }: StepProps) {
  const [draft, setDraft] = useState('');
  const suggestions = ['Software Engineer', 'Finance Intern', 'Product Manager', 'Marketing Analyst', 'Data Scientist'];

  const commit = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (data.roles.includes(v)) return;
    update('roles', [...data.roles, v]);
    setDraft('');
  };
  const remove = (v: string) => update('roles', data.roles.filter((r) => r !== v));

  return (
    <StepShell
      eyebrow="Direction"
      title="What roles are you applying for?"
      subtitle="Add as many as you'd like. Press Enter after each one."
    >
      <div className="rounded-2xl border border-black/10 bg-white p-3 transition-all focus-within:border-black/30 focus-within:ring-4 focus-within:ring-black/5">
        <div className="flex flex-wrap gap-2">
          {data.roles.map((r) => (
            <motion.span
              key={r}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-3 py-1.5 text-sm"
            >
              {r}
              <button onClick={() => remove(r)} className="opacity-70 hover:opacity-100" aria-label={`Remove ${r}`}>×</button>
            </motion.span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (draft.trim()) commit(draft);
                else if (data.roles.length > 0) next();
              } else if (e.key === 'Backspace' && !draft && data.roles.length) {
                update('roles', data.roles.slice(0, -1));
              }
            }}
            placeholder={data.roles.length ? 'Add another...' : 'e.g. Software Engineer'}
            className="flex-1 min-w-[140px] bg-transparent px-2 py-1.5 text-base outline-none"
            autoFocus
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions
          .filter((s) => !data.roles.includes(s))
          .map((s) => (
            <button
              key={s}
              onClick={() => commit(s)}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-ink/70 transition-all hover:border-black/30 hover:text-ink"
            >
              + {s}
            </button>
          ))}
      </div>
    </StepShell>
  );
}

/* ---------- Links ---------- */

export function LinkedInStep({ data, update, next }: StepProps) {
  return (
    <StepShell
      eyebrow="Your web"
      title="LinkedIn profile"
      subtitle="Optional. We'll link it from your HirePage."
    >
      <AutoInput
        type="url"
        value={data.linkedin}
        onChange={(v) => update('linkedin', v)}
        onEnter={next}
        placeholder="linkedin.com/in/yourname"
      />
    </StepShell>
  );
}

export function GithubStep({ data, update, next }: StepProps) {
  return (
    <StepShell
      eyebrow="Your web"
      title="GitHub or portfolio"
      subtitle="Optional. Drop a link if you have one."
    >
      <AutoInput
        type="url"
        value={data.github}
        onChange={(v) => update('github', v)}
        onEnter={next}
        placeholder="github.com/yourname"
      />
    </StepShell>
  );
}

/* ---------- Uploads ---------- */

export function ResumeUploadStep({ data, update }: StepProps) {
  return (
    <StepShell
      eyebrow="Upload"
      title="Upload your resume"
      subtitle="PDF, DOC, or DOCX. We'll pull the content from here."
    >
      <FileDrop
        accept=".pdf,.doc,.docx"
        value={data.resume}
        onChange={(f) => update('resume', f)}
        hint="PDF / DOC / DOCX up to 10 MB"
      />
    </StepShell>
  );
}

export function HeadshotStep({ data, update }: StepProps) {
  return (
    <StepShell
      eyebrow="Optional"
      title="Add a headshot"
      subtitle="Optional. A friendly photo helps recruiters connect."
    >
      <FileDrop
        accept="image/*"
        preview
        value={data.headshot}
        onChange={(f) => update('headshot', f)}
        hint="JPG or PNG, square works best"
      />
    </StepShell>
  );
}

/* ---------- Style ---------- */

const STYLE_CHOICES: { id: StylePref; label: string; blurb: string; swatch: string }[] = [
  { id: 'corporate', label: 'Corporate / Professional', blurb: 'Trustworthy, IB / consulting feel.', swatch: 'linear-gradient(135deg,#0f172a,#334155)' },
  { id: 'modern', label: 'Modern / Startup', blurb: 'Stripe-like, clean and current.', swatch: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { id: 'minimal', label: 'Minimal / Clean', blurb: 'Lots of whitespace, confident type.', swatch: 'linear-gradient(135deg,#fafafa,#d4d4d8)' },
  { id: 'creative', label: 'Creative / Bold', blurb: 'Color, motion, personality.', swatch: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { id: 'surprise', label: 'Surprise Me', blurb: 'Let our team pick what fits.', swatch: 'linear-gradient(135deg,#22c55e,#0ea5e9)' },
];

export function StyleStep({ data, update }: StepProps) {
  return (
    <StepShell
      eyebrow="Design"
      title="Pick a vibe"
      subtitle="This sets the direction. You can tweak anything later."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STYLE_CHOICES.map((c) => {
          const active = data.style === c.id;
          return (
            <motion.button
              key={c.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => update('style', c.id)}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                active
                  ? 'border-ink shadow-[0_14px_40px_-16px_rgba(10,10,11,0.4)]'
                  : 'border-black/10 hover:border-black/25'
              }`}
            >
              <div className="mb-4 h-14 w-full rounded-xl" style={{ background: c.swatch }} />
              <div className="font-semibold text-ink">{c.label}</div>
              <div className="mt-1 text-sm text-ink/60">{c.blurb}</div>
              {active && (
                <motion.span
                  layoutId="style-check"
                  className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}

/* ---------- Colors ---------- */

const COLOR_PRESETS = [
  '#0a0a0b',
  '#1e3a8a',
  '#0ea5e9',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#a855f7',
  '#dc2626',
];

export function ColorStep({ data, update }: StepProps) {
  const toggle = (c: string) => {
    const has = data.colors.includes(c);
    update('colors', has ? data.colors.filter((x) => x !== c) : [...data.colors, c]);
  };
  return (
    <StepShell
      eyebrow="Design"
      title="Any color preferences?"
      subtitle="Pick one or two, or skip and we'll choose for you."
    >
      <div className="flex flex-wrap gap-3">
        {COLOR_PRESETS.map((c) => {
          const active = data.colors.includes(c);
          return (
            <motion.button
              key={c}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(c)}
              className={`h-12 w-12 rounded-full transition-all ${active ? 'ring-2 ring-ink ring-offset-2' : 'ring-1 ring-black/10'}`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
              aria-pressed={active}
            />
          );
        })}
      </div>
    </StepShell>
  );
}

/* ---------- Custom requests ---------- */

export function RequestsStep({ data, update, next }: StepProps) {
  return (
    <StepShell
      eyebrow="Tell us more"
      title="Anything special?"
      subtitle="Sections you'd like highlighted, tone, inspiration. Optional."
    >
      <textarea
        value={data.customRequests}
        onChange={(e) => update('customRequests', e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) next();
        }}
        placeholder="e.g. Feature my hackathon projects, match the palette of stripe.com, include a testimonial from my manager..."
        rows={5}
        className={inputCls + ' resize-none'}
      />
      <div className="mt-2 text-xs text-ink/40">Tip: ⌘/Ctrl + Enter to continue</div>
    </StepShell>
  );
}

/* ---------- Package ---------- */

const PACKAGES: { id: PackageId; title: string; price: string; blurb: string; perks: string[] }[] = [
  { id: 'basic', title: 'Basic', price: '$50 once', blurb: 'Custom site built from your resume.', perks: ['Resume\u2192website', 'Mobile responsive', 'SEO basics'] },
  { id: 'monthly', title: 'Monthly Edits', price: '$50 + $5/mo', blurb: 'Site plus monthly updates. First month free.', perks: ['Everything in Basic', 'Monthly refresh', 'Priority email'] },
  { id: 'unlimited', title: 'Unlimited Edits', price: '$50 + $10/mo', blurb: 'Update anytime. Most popular.', perks: ['Everything in Monthly', 'Unlimited requests', 'Priority turnaround'] },
];

export function PackageStep({ data, update }: StepProps) {
  return (
    <StepShell
      eyebrow="Almost there"
      title="Pick your plan"
      subtitle="All plans charge $50 today. Recurring (if any) starts day 31."
    >
      <div className="grid grid-cols-1 gap-3">
        {PACKAGES.map((p) => {
          const active = data.plan === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => update('plan', p.id)}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                active
                  ? 'border-ink shadow-[0_14px_40px_-16px_rgba(10,10,11,0.4)]'
                  : 'border-black/10 hover:border-black/25'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-lg font-semibold text-ink">{p.title}</div>
                <div className="text-base font-medium text-ink/80">{p.price}</div>
              </div>
              <div className="mt-1 text-sm text-ink/60">{p.blurb}</div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                {p.perks.map((x) => (
                  <li key={x} className="flex items-center gap-1.5">
                    <span className="inline-block h-1 w-1 rounded-full bg-[#22c55e]" /> {x}
                  </li>
                ))}
              </ul>
              {active && (
                <motion.span
                  layoutId="pkg-check"
                  className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}

/* ---------- Review ---------- */

export function ReviewStep({
  data,
  jumpTo,
}: StepProps & { jumpTo: (stepId: string) => void }) {
  const rows: { id: string; label: string; value: string }[] = [
    { id: 'name', label: 'Name', value: data.fullName || '\u2014' },
    { id: 'email', label: 'Email', value: data.email || '\u2014' },
    { id: 'phone', label: 'Phone', value: data.phoneNumber ? `${data.phoneCountry} ${data.phoneNumber}` : '\u2014' },
    { id: 'roles', label: 'Roles', value: data.roles.join(', ') || '\u2014' },
    { id: 'linkedin', label: 'LinkedIn', value: data.linkedin || '\u2014' },
    { id: 'github', label: 'GitHub / Portfolio', value: data.github || '\u2014' },
    { id: 'resume', label: 'Resume', value: data.resume?.name || '\u2014' },
    { id: 'headshot', label: 'Headshot', value: data.headshot?.name || '\u2014' },
    { id: 'style', label: 'Style', value: data.style ? STYLE_CHOICES.find((s) => s.id === data.style)!.label : '\u2014' },
    { id: 'colors', label: 'Colors', value: data.colors.join('  ') || '\u2014' },
    { id: 'requests', label: 'Custom requests', value: data.customRequests || '\u2014' },
    { id: 'package', label: 'Plan', value: data.plan ? PACKAGES.find((p) => p.id === data.plan)!.title : '\u2014' },
  ];
  return (
    <StepShell
      eyebrow="Final look"
      title="Review your details"
      subtitle="Click any row to edit. Looks good? Hit Submit."
    >
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        {rows.map((r, i) => (
          <button
            key={r.id}
            onClick={() => jumpTo(r.id)}
            className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02] ${
              i !== rows.length - 1 ? 'border-b border-black/5' : ''
            }`}
          >
            <div className="w-32 shrink-0 text-sm text-ink/50">{r.label}</div>
            <div className="flex-1 text-sm text-ink">{r.value}</div>
            <div className="text-xs text-ink/40 group-hover:text-ink/70">Edit</div>
          </button>
        ))}
      </div>
    </StepShell>
  );
}

/* ---------- Grouped step: Basics (name + email + phone) ---------- */

export function BasicsStep({ data, update }: StepProps) {
  const countries = ['+1', '+44', '+61', '+91', '+33', '+49', '+81', '+86'];
  return (
    <StepShell
      eyebrow="Step 1 of 3 · About you"
      title="Tell us who you are"
      subtitle="The basics. We'll use these to set up your HirePage."
    >
      <div className="space-y-5">
        <Field label="Full name">
          <input
            value={data.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Alex Parker"
            autoComplete="name"
            autoFocus
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputCls}
          />
        </Field>
        <Field label="Phone" hint="Optional — we'll text you if we need something">
          <div className="flex gap-2">
            <select
              value={data.phoneCountry}
              onChange={(e) => update('phoneCountry', e.target.value)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-lg text-ink outline-none transition-all focus:border-black/30 focus:ring-4 focus:ring-black/5"
              aria-label="Country code"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="tel"
              value={data.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value.replace(/[^0-9 ()\-]/g, ''))}
              placeholder="(555) 123-4567"
              autoComplete="tel"
              className={inputCls}
            />
          </div>
        </Field>
      </div>
    </StepShell>
  );
}

/* ---------- Grouped step: Profile (roles + linkedin + github + resume + headshot) ---------- */

export function ProfileStep({ data, update }: StepProps) {
  const [draft, setDraft] = useState('');
  const suggestions = ['Software Engineer', 'Finance Intern', 'Product Manager', 'Marketing Analyst', 'Data Scientist'];

  const commit = (raw: string) => {
    const v = raw.trim();
    if (!v || data.roles.includes(v)) return;
    update('roles', [...data.roles, v]);
    setDraft('');
  };
  const remove = (v: string) => update('roles', data.roles.filter((r) => r !== v));

  return (
    <StepShell
      eyebrow="Step 2 of 3 · Your profile"
      title="What's your story?"
      subtitle="Roles you're targeting, links to your work, and your resume."
    >
      <div className="space-y-5">
        <Field label="Roles you're applying for" hint="Press Enter after each one">
          <div className="rounded-2xl border border-black/10 bg-white p-3 transition-all focus-within:border-black/30 focus-within:ring-4 focus-within:ring-black/5">
            <div className="flex flex-wrap gap-2">
              {data.roles.map((r) => (
                <motion.span
                  key={r}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-3 py-1.5 text-sm"
                >
                  {r}
                  <button onClick={() => remove(r)} className="opacity-70 hover:opacity-100" aria-label={`Remove ${r}`}>×</button>
                </motion.span>
              ))}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (draft.trim()) commit(draft);
                  } else if (e.key === 'Backspace' && !draft && data.roles.length) {
                    update('roles', data.roles.slice(0, -1));
                  }
                }}
                placeholder={data.roles.length ? 'Add another...' : 'e.g. Software Engineer'}
                className="flex-1 min-w-[140px] bg-transparent px-2 py-1.5 text-base outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !data.roles.includes(s))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => commit(s)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-ink/70 transition-all hover:border-black/30 hover:text-ink"
                >
                  + {s}
                </button>
              ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" hint="Optional">
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => update('linkedin', e.target.value)}
              placeholder="linkedin.com/in/yourname"
              className={inputCls}
            />
          </Field>
          <Field label="GitHub / portfolio" hint="Optional">
            <input
              type="url"
              value={data.github}
              onChange={(e) => update('github', e.target.value)}
              placeholder="github.com/yourname"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Resume" hint="PDF, DOC, or DOCX">
          <FileDrop
            accept=".pdf,.doc,.docx"
            value={data.resume}
            onChange={(f) => update('resume', f)}
            hint="Drop your resume — we'll pull the content from here"
          />
        </Field>

        <Field label="Headshot" hint="Optional — JPG or PNG, square works best">
          <FileDrop
            accept="image/*"
            preview
            value={data.headshot}
            onChange={(f) => update('headshot', f)}
            hint="A friendly photo helps recruiters connect"
          />
        </Field>
      </div>
    </StepShell>
  );
}

/* ---------- Grouped step: Design + Plan (colors + custom requests + package) ---------- */

export function DesignStep({ data, update }: StepProps) {
  const toggleColor = (c: string) => {
    const has = data.colors.includes(c);
    update('colors', has ? data.colors.filter((x) => x !== c) : [...data.colors, c]);
  };
  return (
    <StepShell
      eyebrow="Step 3 of 3 · Design & plan"
      title="Make it yours, then pick a plan"
      subtitle="Color preferences, anything custom, and the plan that fits. You'll head to checkout next."
    >
      <div className="space-y-7">
        <Field label="Color preferences" hint="Pick one or two, or skip and we'll choose for you">
          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map((c) => {
              const active = data.colors.includes(c);
              return (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleColor(c)}
                  className={`h-12 w-12 rounded-full transition-all ${active ? 'ring-2 ring-ink ring-offset-2' : 'ring-1 ring-black/10'}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                  aria-pressed={active}
                />
              );
            })}
          </div>
        </Field>

        <Field label="Anything custom?" hint="Sections you'd like highlighted, tone, inspiration. Optional.">
          <textarea
            value={data.customRequests}
            onChange={(e) => update('customRequests', e.target.value)}
            placeholder="e.g. Feature my hackathon projects, match the palette of stripe.com, include a testimonial from my manager..."
            rows={4}
            className={inputCls + ' resize-none'}
          />
        </Field>

        <Field label="Choose your plan" hint="All plans charge $50 today. Recurring (if any) starts day 31.">
          <div className="grid grid-cols-1 gap-3">
            {PACKAGES.map((p) => {
              const active = data.plan === p.id;
              return (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => update('plan', p.id)}
                  className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? 'border-ink shadow-[0_14px_40px_-16px_rgba(10,10,11,0.4)]'
                      : 'border-black/10 hover:border-black/25'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-lg font-semibold text-ink">{p.title}</div>
                    <div className="text-base font-medium text-ink/80">{p.price}</div>
                  </div>
                  <div className="mt-1 text-sm text-ink/60">{p.blurb}</div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                    {p.perks.map((x) => (
                      <li key={x} className="flex items-center gap-1.5">
                        <span className="inline-block h-1 w-1 rounded-full bg-[#22c55e]" /> {x}
                      </li>
                    ))}
                  </ul>
                  {active && (
                    <motion.span
                      layoutId="pkg-check"
                      className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </Field>
      </div>
    </StepShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint ? <span className="text-xs text-ink/45">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/* ---------- Loading / Success ---------- */

export function LoadingStep() {
  const messages = [
    'Parsing your experience\u2026',
    'Designing your site\u2026',
    'Optimizing for recruiters\u2026',
    'Polishing the details\u2026',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
      <div className="relative h-16 w-16">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-ink/10"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-ink"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-xl font-medium text-ink"
      >
        {messages[i]}
      </motion.div>
      <p className="mt-2 text-sm text-ink/50">Hang tight \u2014 this only takes a moment.</p>
    </div>
  );
}

export function SuccessStep({ email }: { email?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#16a34a]"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </motion.div>
      <h2 className="mt-6 text-3xl font-semibold text-ink" style={{ letterSpacing: '-0.03em' }}>
        Your HirePage is being created
      </h2>
      <p className="mt-3 max-w-md text-ink/60">
        We&rsquo;ve got everything we need{email ? <> &mdash; check <span className="text-ink font-medium">{email}</span></> : ''}. You&rsquo;ll hear from us within 24 hours.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="/" className="btn-primary justify-center">Back to Home</a>
        <a href="#examples" className="btn-secondary justify-center">See Examples</a>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function AutoInput({
  value,
  onChange,
  onEnter,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={inputCls}
    />
  );
}

function FileDrop({
  accept,
  value,
  onChange,
  preview,
  hint,
}: {
  accept: string;
  value?: UploadedFile;
  onChange: (f: UploadedFile | undefined) => void;
  preview?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const ingest = (file: File) => {
    setProgress(0);
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    reader.onload = () => {
      setProgress(100);
      const dataUrl = preview && typeof reader.result === 'string' ? reader.result : undefined;
      onChange({ name: file.name, size: file.size, type: file.type, dataUrl });
      setTimeout(() => setProgress(null), 600);
    };
    reader.onerror = () => setProgress(null);
    if (preview) reader.readAsDataURL(file);
    else reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) ingest(file);
  };

  const formatSize = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`;

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5"
      >
        {preview && value.dataUrl ? (
          <img src={value.dataUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#16a34a]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-ink">{value.name}</div>
          <div className="text-xs text-ink/50">{formatSize(value.size)}  uploaded</div>
        </div>
        <button
          onClick={() => onChange(undefined)}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-ink/70 transition-all hover:border-black/30 hover:text-ink"
        >
          Replace
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          dragOver ? 'border-ink bg-ink/[0.02]' : 'border-black/15 hover:border-black/30'
        }`}
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ink/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15V3" />
            <path d="m7 8 5-5 5 5" />
            <path d="M5 21h14" />
          </svg>
        </div>
        <div className="text-base font-medium text-ink">Click to upload or drag &amp; drop</div>
        {hint ? <div className="mt-1 text-sm text-ink/55">{hint}</div> : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) ingest(f);
          }}
        />
      </div>
      {progress !== null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full bg-ink"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
