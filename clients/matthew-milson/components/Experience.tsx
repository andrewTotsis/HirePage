type Role = {
  company: string;
  title: string;
  location: string;
  dates: string;
  current?: boolean;
  summary: string;
  bullets: { text: string; emphasis?: string[] }[];
  tags: string[];
};

const roles: Role[] = [
  {
    company: 'Black Magic Alchemy',
    title: 'Sales Representative',
    location: 'Toronto, ON',
    dates: 'Aug 2025 — Present',
    current: true,
    summary:
      'Own the full sales cycle for a Shopify-based DTC brand — from first touch to fulfillment and retention.',
    bullets: [
      {
        text: 'Drove $4,000+ in additional monthly revenue through disciplined upsell and cross-sell motions.',
        emphasis: ['$4,000+', 'monthly revenue'],
      },
      {
        text: 'Retained 50+ net-new clients with proactive follow-up and a consultative customer experience.',
        emphasis: ['50+ net-new clients'],
      },
      {
        text: 'Leverage Shopify to segment customer data, surface expansion opportunities, and streamline order operations.',
      },
    ],
    tags: ['Full-cycle sales', 'Upsell / Cross-sell', 'Shopify', 'Retention'],
  },
  {
    company: 'RBC Insurance',
    title: 'Inside Sales Representative',
    location: 'Mississauga, ON',
    dates: 'May 2024 — Jul 2025',
    summary:
      'High-volume inside sales role supporting senior consultants with qualified pipeline across a large Ontario book.',
    bullets: [
      {
        text: 'Ran 15+ outbound prospecting calls daily, consistently booking 3+ qualified meetings per week for senior sales consultants.',
        emphasis: ['15+ outbound', '3+ qualified meetings per week'],
      },
      {
        text: 'Managed a 1,500+ client territory that contributed to $1.1M+ in insurance premiums.',
        emphasis: ['1,500+ client territory', '$1.1M+ in insurance premiums'],
      },
      {
        text: 'Diagnosed prospect needs, positioned tailored solutions, and advanced deals through the funnel.',
      },
      {
        text: 'Partnered with underwriting and onboarding to lift conversion on new policies.',
      },
    ],
    tags: [
      'Outbound',
      'Meeting Booking',
      'Territory Management',
      'Objection Handling',
    ],
  },
  {
    company: 'Family Life Care',
    title: 'Sales Representative',
    location: 'Toronto, ON',
    dates: 'Feb 2023 — Apr 2023',
    summary:
      'Short-cycle sales role focused on generating and closing net-new business via cold outreach.',
    bullets: [
      {
        text: 'Cold-called 10+ leads per day to open net-new business opportunities.',
        emphasis: ['10+ leads per day'],
      },
      {
        text: 'Closed 3 deals generating $10,000 in commission in under three months.',
        emphasis: ['$10,000 in commission'],
      },
      {
        text: 'Built and ran digital marketing campaigns that delivered inbound leads.',
      },
    ],
    tags: ['Cold Calling', 'Closing', 'Digital Campaigns'],
  },
  {
    company: 'GTA Search Solutions',
    title: 'Business Development Representative',
    location: 'Toronto, ON',
    dates: 'Mar 2022 — Jan 2023',
    summary:
      'Dedicated BDR role running multi-channel outreach to both clients and candidates for a Toronto recruiting firm.',
    bullets: [
      {
        text: 'Executed multi-channel outbound via LinkedIn, email, and phone to hiring managers and passive candidates.',
        emphasis: ['LinkedIn, email, and phone'],
      },
      {
        text: 'Generated $20,000+ in revenue through qualified candidate placements.',
        emphasis: ['$20,000+ in revenue'],
      },
      {
        text: 'Sourced and qualified 8+ strong candidates using job boards and direct outreach.',
      },
      {
        text: 'Built and maintained trusted relationships with hiring managers and prospects.',
      },
    ],
    tags: [
      'Full-stack BDR',
      'LinkedIn Outreach',
      'Email Sequences',
      'Account Management',
    ],
  },
];

function emphasize(text: string, terms?: string[]) {
  if (!terms?.length) return text;
  const parts: Array<{ t: string; bold: boolean }> = [{ t: text, bold: false }];
  for (const term of terms) {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.bold) continue;
      const idx = p.t.indexOf(term);
      if (idx === -1) continue;
      const before = p.t.slice(0, idx);
      const mid = p.t.slice(idx, idx + term.length);
      const after = p.t.slice(idx + term.length);
      const next: Array<{ t: string; bold: boolean }> = [];
      if (before) next.push({ t: before, bold: false });
      next.push({ t: mid, bold: true });
      if (after) next.push({ t: after, bold: false });
      parts.splice(i, 1, ...next);
      i += next.length - 1;
    }
  }
  return parts.map((p, i) =>
    p.bold ? (
      <strong key={i} className="font-semibold text-ink">
        {p.t}
      </strong>
    ) : (
      <span key={i}>{p.t}</span>
    ),
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container-pro">
        <div className="max-w-3xl">
          <span className="eyebrow">Work Experience</span>
          <h2 className="section-title mt-5">
            Pipeline built. Deals closed. Revenue moved.
          </h2>
          <p className="section-kicker">
            Four sales roles across insurance, recruiting, and e-commerce — each
            one grounded in outbound activity, qualified meetings, and measurable
            revenue.
          </p>
        </div>

        <ol className="mt-14 space-y-10 md:space-y-12">
          {roles.map((r) => (
            <li
              key={r.company + r.dates}
              className="relative border-l border-slate-200 pl-7 md:pl-10"
            >
              <span className="timeline-dot" />

              <article className="card card-hover">
                <header className="flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between md:gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
                        {r.company}
                      </h3>
                      {r.current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-base font-medium text-sky-deep">
                      {r.title}
                    </p>
                  </div>
                  <div className="text-left text-sm text-ink-muted md:text-right">
                    <div className="font-medium text-ink-soft">{r.dates}</div>
                    <div>{r.location}</div>
                  </div>
                </header>

                <p className="mt-5 text-[15px] text-ink-muted">{r.summary}</p>

                <ul className="mt-5 space-y-3">
                  {r.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"
                    >
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-accent"
                      />
                      <span>{emphasize(b.text, b.emphasis)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
