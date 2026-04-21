const channels = [
  {
    label: 'Email',
    value: 'matthewmilson55@gmail.com',
    href: 'mailto:matthewmilson55@gmail.com',
    icon: (
      <path
        d="M3 5h14v10H3z M3 5l7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: 'Phone',
    value: '(647) 532-6010',
    href: 'tel:+16475326010',
    icon: (
      <path
        d="M4 2h2.5l1 3.5-2 1.2a9 9 0 0 0 4.8 4.8l1.2-2L15 10.5V13a1.8 1.8 0 0 1-1.8 1.8A12.5 12.5 0 0 1 2 3.8 1.8 1.8 0 0 1 3.8 2H4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/matthewmilson',
    href: 'https://www.linkedin.com/in/matthewmilson/',
    icon: (
      <g
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <rect x="2.5" y="2.5" width="15" height="15" rx="2" />
        <path d="M6 8v6 M6 5.5v.01 M9.5 14V8 M9.5 11c0-1.7 1-3 2.5-3s2.5 1.3 2.5 3v3" />
      </g>
    ),
  },
];

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container-pro">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-soft p-10 md:p-16 shadow-card">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <span className="eyebrow">Contact</span>
              <h2 className="section-title mt-5">
                Let&apos;s talk about your next BDR hire.
              </h2>
              <p className="section-kicker">
                I&apos;m actively interviewing for BDR / SDR roles in Toronto or
                remote. Quickest way to reach me is email or LinkedIn — I reply
                same-day.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:matthewmilson55@gmail.com"
                  className="btn btn-primary"
                >
                  Email me
                </a>
                <a
                  href="https://www.linkedin.com/in/matthewmilson/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>

            <ul className="grid gap-3">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      c.href.startsWith('http') ? 'noopener noreferrer' : undefined
                    }
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-line hover:shadow-soft"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-soft text-sky-deep">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        {c.icon}
                      </svg>
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-[15px] font-medium text-ink">
                        {c.value}
                      </span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
                    >
                      <path
                        d="M3 8h9M8 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
