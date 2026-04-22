import type { Profile, Section } from '@/lib/profiles';

type Variant = 'compact' | 'detailed';

export default function ExamplePreview({
  profile,
  variant = 'detailed',
}: {
  profile: Profile;
  variant?: Variant;
}) {
  const { site } = profile;

  const sectionsToShow =
    variant === 'compact'
      ? pickCompactSections(site.sections)
      : site.sections;

  return (
    <div className="window">
      <div className="window-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <div className="ml-3 flex-1">
          <div className="mx-auto max-w-sm text-center text-[11px] text-white/50 bg-white/5 rounded-md py-1 px-3 border border-white/5 truncate">
            {site.url}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <FakeNav name={profile.name} accent={site.accent} />
        <Hero profile={profile} variant={variant} />

        <div className={variant === 'compact' ? 'px-5 pb-5 md:px-7' : 'px-6 pb-8 md:px-10'}>
          {sectionsToShow.map((s, i) => (
            <div key={i} className={i === 0 ? '' : variant === 'compact' ? 'mt-4' : 'mt-7'}>
              <SectionBlock section={s} accent={site.accent} variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function pickCompactSections(sections: Section[]): Section[] {
  const primary = sections.find((s) => s.kind !== 'about');
  return primary ? [primary] : sections.slice(0, 1);
}

function FakeNav({
  name,
  accent,
}: {
  name: string;
  accent: Profile['site']['accent'];
}) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 md:px-10">
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold text-white"
          style={{ backgroundColor: accent.base }}
        >
          {initials}
        </div>
        <div className="text-[11px] font-semibold text-[#0f172a]">{name.replace(/\s*\.$/, '')}</div>
      </div>
      <div className="hidden items-center gap-4 text-[11px] text-[#64748b] md:flex">
        <span>About</span>
        <span>Work</span>
        <span>Contact</span>
      </div>
    </div>
  );
}

function Hero({ profile, variant }: { profile: Profile; variant: Variant }) {
  const { site, name, targetRole } = profile;
  const compact = variant === 'compact';
  return (
    <div
      className={
        compact
          ? 'relative px-5 pt-5 pb-5 md:px-7 md:pt-7 md:pb-6'
          : 'relative px-6 pt-8 pb-7 md:px-10 md:pt-10 md:pb-9'
      }
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -20%, ${hexToRgba(
          site.accent.tint,
          0.14
        )}, transparent 70%)`,
      }}
    >
      <span
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em]"
        style={{
          borderColor: site.accent.ring,
          backgroundColor: site.accent.soft,
          color: site.accent.base,
        }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: site.accent.tint }}
        />
        {site.availability}
      </span>

      <h3
        className={
          compact
            ? 'mt-3 text-2xl font-semibold tracking-tight text-[#0f172a] md:text-3xl'
            : 'mt-4 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-5xl'
        }
        style={{ letterSpacing: '-0.03em' }}
      >
        {name.replace(/\s*\.$/, '')}
      </h3>

      <p
        className={
          compact
            ? 'mt-1 text-xs font-medium md:text-sm'
            : 'mt-2 text-sm font-medium md:text-base'
        }
        style={{ color: site.accent.base }}
      >
        {targetRole}
      </p>

      <p
        className={
          compact
            ? 'mt-2 text-xs leading-relaxed text-[#475569] md:text-[13px]'
            : 'mt-3 max-w-xl text-sm leading-relaxed text-[#475569] md:text-[15px]'
        }
      >
        {site.tagline}
      </p>

      {!compact && (
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#64748b] md:text-sm">
          {site.summary}
        </p>
      )}

      <div className={compact ? 'mt-3 flex flex-wrap items-center gap-2' : 'mt-5 flex flex-wrap items-center gap-2'}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          Get in touch →
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a]">
          LinkedIn
        </span>
        {!compact && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a]">
            Download resume
          </span>
        )}
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  accent,
  variant,
}: {
  section: Section;
  accent: Profile['site']['accent'];
  variant: Variant;
}) {
  const compact = variant === 'compact';
  switch (section.kind) {
    case 'about':
      return (
        <Block label="About" accent={accent} compact={compact}>
          <p className={compact ? 'text-xs leading-relaxed text-[#475569]' : 'text-sm leading-relaxed text-[#475569] md:text-[15px]'}>
            {section.body}
          </p>
        </Block>
      );

    case 'pillars':
      return (
        <Block label="What I bring" accent={accent} compact={compact}>
          <div className={compact ? 'grid gap-2 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-3'}>
            {section.items.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-slate-100 bg-white p-3 md:p-4"
              >
                <div className="text-[11px] font-semibold text-[#0f172a] md:text-[13px]">
                  {p.title}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-[#64748b] md:text-[12px]">
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </Block>
      );

    case 'projects':
    case 'cases':
    case 'writing':
    case 'research':
      return (
        <Block
          label={section.label ?? defaultLabel(section.kind)}
          accent={accent}
          compact={compact}
        >
          <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {section.items.map((p) => (
              <Card key={p.title} item={p} accent={accent} compact={compact} />
            ))}
          </div>
        </Block>
      );

    case 'experience':
      return (
        <Block label={section.label ?? 'Experience'} accent={accent} compact={compact}>
          <ol className={compact ? 'space-y-2' : 'space-y-3'}>
            {section.items.map((e) => (
              <li
                key={`${e.role}-${e.org}`}
                className="rounded-xl border border-slate-100 bg-white p-3 md:p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-[12px] font-semibold text-[#0f172a] md:text-[13px]">
                    {e.role} · <span className="text-[#475569]">{e.org}</span>
                  </div>
                  <div className="text-[11px] text-[#94a3b8]">{e.period}</div>
                </div>
                {e.summary && (
                  <p className="mt-1 text-[11px] leading-relaxed text-[#64748b] md:text-[12px]">
                    {e.summary}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Block>
      );

    case 'skills':
      return (
        <Block label={section.label ?? 'Skills'} accent={accent} compact={compact}>
          <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {section.groups.map((g, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {g.title && (
                  <span className="text-[10px] uppercase tracking-widest text-[#94a3b8]">
                    {g.title}
                  </span>
                )}
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-[#334155] md:text-[11px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Block>
      );

    case 'exploring':
      return (
        <Block label={section.label ?? 'Currently exploring'} accent={accent} compact={compact}>
          <div className="flex flex-wrap gap-2">
            {section.items.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium md:text-[11px]"
                style={{
                  borderColor: accent.ring,
                  backgroundColor: accent.soft,
                  color: accent.base,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </Block>
      );
  }
}

function defaultLabel(kind: Section['kind']): string {
  switch (kind) {
    case 'projects':
      return 'Selected projects';
    case 'cases':
      return 'Case studies';
    case 'writing':
      return 'Writing';
    case 'research':
      return 'Research';
    default:
      return '';
  }
}

function Block({
  label,
  accent,
  compact,
  children,
}: {
  label: string;
  accent: Profile['site']['accent'];
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className={
          compact
            ? 'mb-2 text-[9px] uppercase tracking-[0.16em]'
            : 'mb-3 text-[10px] uppercase tracking-[0.18em]'
        }
        style={{ color: accent.base }}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

function Card({
  item,
  accent,
  compact,
}: {
  item: { title: string; description: string; tags?: string[] };
  accent: Profile['site']['accent'];
  compact: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={compact ? 'text-[12px] font-semibold text-[#0f172a]' : 'text-[13px] font-semibold text-[#0f172a] md:text-[14px]'}>
          {item.title}
        </div>
        <span
          className="mt-0.5 inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest"
          style={{
            borderColor: accent.ring,
            backgroundColor: accent.soft,
            color: accent.base,
          }}
        >
          Open
        </span>
      </div>
      <p className={compact ? 'mt-1 text-[11px] leading-relaxed text-[#64748b]' : 'mt-1.5 text-[12px] leading-relaxed text-[#64748b] md:text-[13px]'}>
        {item.description}
      </p>
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-[#475569]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
